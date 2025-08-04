const xlsx = require("xlsx");
const { Project, Activity, ActivityVersion } = require("../models");
const {
  parseDias,
  parseFecha,
  esDiaHabil,
  ajustarAProximoDiaHabil,
  calendarioConfig,
} = require("../utils/dateUtils");

const importActivitiesFromExcel = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { tipoVersion } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No se envió ningún archivo." });
    }

    const mimetype = req.file.mimetype;
    if (!mimetype.includes("spreadsheetml") && !mimetype.includes("excel")) {
      return res
        .status(400)
        .json({ message: "Se esperaba un archivo Excel (.xlsx o .xls)." });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets["Tabla_Tareas"];
    if (!sheet) {
      return res
        .status(400)
        .json({ message: "Hoja 'Tabla_Tareas' no encontrada en el archivo." });
    }

    const data = xlsx.utils.sheet_to_json(sheet);
    const idMap = new Map(); // Excel ID → DB activity ID

    // Paso 1: Crear todas las actividades
    const actividades = data.map(() => ({ projectId }));
    const actividadesCreadas = await Activity.bulkCreate(actividades, {
      returning: true,
    });

    // Paso 2: Crear todas las versiones
    const versiones = data.map((row, index) => {
      // Ajuste Fecha Inicial
      const fechaInicioOriginal = parseFecha(row["Comienzo"]);
      let fechaInicio = fechaInicioOriginal;

      if (fechaInicio && !esDiaHabil(fechaInicio)) {
        const ajustada = ajustarAProximoDiaHabil(fechaInicio);
        console.log(
          `⚠️ Fecha no laborable (${fechaInicio}) → ajustada a ${ajustada}`
        );
        fechaInicio = ajustada;
      }

      // Ajuste Fecha Final
      const fechaFinalOriginal = parseFecha(row["Fin"]);
      let fechaFin = fechaFinalOriginal;

      if (fechaFin && !esDiaHabil(fechaFin)) {
        const ajustada = ajustarAProximoDiaHabil(fechaFin);
        // console.log(
        //   `⚠️ Fecha no laborable (${fechaFin}) → ajustada a ${ajustada}`
        // );
        fechaFin = ajustada;
      }

      return {
        activityId: actividadesCreadas[index].id,
        tipoVersion: tipoVersion, // draft baseline
        nombre: row["Nombre"] || "Actividad sin nombre",
        parentId: 0, // se asignará después
        orden: 0, // se asignará después
        nroVersion: 0,
        fechaInicio,
        fechaFin,
        plazo: parseDias(row["Duración"]),
        responsable: "",
        comentario: "",
        avance: 0,
        predecesorId: "", // se asignará después
        sustento: "",
        vigente: true,
      };
    });

    //console.log("Primera versión a crear:", versiones[0]);
    const versionesCreadas = await ActivityVersion.bulkCreate(versiones, {
      returning: true,
    });

    // Paso 3: Enlazar datos en memoria
    const rowsWithDBIds = data.map((row, index) => ({
      ...row,
      //excelId: row["Id"],
      dbActivityId: actividadesCreadas[index].id,
      versionId: versionesCreadas[index].id,
      level: row["Nivel de esquema"],
    }));

    // Paso 4: Asignar parentId
    const padresPorNivel = {};

    for (let i = 0; i < rowsWithDBIds.length; i++) {
      const row = rowsWithDBIds[i];
      const versionId = row.versionId;
      const nivelActual = row.level;

      let parentActivityId = 0;

      if (nivelActual > 0 && padresPorNivel[nivelActual - 1]) {
        const parentVersionId = padresPorNivel[nivelActual - 1];
        parentActivityId =
          rowsWithDBIds.find((r) => r.versionId === parentVersionId)
            ?.dbActivityId || 0;
      }

      await ActivityVersion.update(
        { parentId: parentActivityId },
        { where: { id: versionId } }
      );

      padresPorNivel[nivelActual] = versionId;
    }

    // Paso 5: Asignar orden entre hermanos
    const ordenPorPadre = new Map();

    for (const row of rowsWithDBIds) {
      const version = await ActivityVersion.findOne({
        where: { id: row.versionId },
      });

      const parentKey = version.parentId || 0;
      const hermanos = ordenPorPadre.get(parentKey) || [];
      const nuevoOrden = hermanos.length + 1;

      await ActivityVersion.update(
        { orden: nuevoOrden },
        { where: { id: row.versionId } }
      );

      ordenPorPadre.set(parentKey, [...hermanos, row.versionId]);
    }

    // paso 6: asignar predecesores
    for (const row of rowsWithDBIds) {
      const raw = row["Predecesoras"];
      if (!raw) continue;

      // console.log("\n🔍 Análisis de predecesores");
      // console.log("Actividad:", row["Nombre"]);
      // console.log("Predecesoras (raw):", raw);

      const partes = raw.split(",");
      //console.log("Partes:", partes);

      const traducidas = [];

      for (const parte of partes) {
        const idStr = parte.match(/^\d+/)?.[0];
        //console.log("  ➤ Parte:", parte);
        //console.log("     ID extraído:", idStr);

        if (!idStr) {
          console.warn("     ⚠️ No se pudo extraer ID");
          continue;
        }

        const predRow = rowsWithDBIds.find((r) => r.Id === idStr);
        const predActivityId = predRow?.dbActivityId;
        //console.log("     ID en base de datos:", predActivityId);

        if (!predActivityId) {
          console.warn("     ⚠️ No se encontró el activityId correspondiente");
          continue;
        }

        const parteTraducida = parte.replace(/^\d+/, predActivityId);
        //console.log("     Parte traducida:", parteTraducida);

        traducidas.push(parteTraducida);
      }

      const cadenaFinal = traducidas.join(",");

      await ActivityVersion.update(
        { predecesorId: cadenaFinal || null },
        { where: { id: row.versionId } }
      );

      //console.log(`✅ Resultado final: SIGET ← ${cadenaFinal || "null"}`);
    }

    res.status(200).json({
      message: "Actividades importadas exitosamente desde Excel.",
    });
  } catch (err) {
    console.error("❌ Error en importación desde Excel:", err);
    res
      .status(500)
      .json({ message: "Error interno al importar el archivo Excel." });
  }
};

module.exports = { importActivitiesFromExcel };
