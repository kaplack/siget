const xlsx = require("xlsx");
const { Project, Activity, ActivityVersion } = require("../models");

// Convert "3 días" → 3
const parseDias = (duracionStr) => {
  const match = duracionStr?.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

// Convert "10 julio 2025 09:00" → "YYYY-MM-DD"
const parseFecha = (str) => {
  if (!str) return null;
  const fecha = new Date(str);
  return isNaN(fecha) ? null : fecha.toLocaleDateString("en-CA"); // → "2025-07-29"
};

const importActivitiesFromExcel = async (req, res) => {
  try {
    const { projectId } = req.params;

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
    const rowsWithDBIds = [];

    // Paso 1: Crear actividades y versiones
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      const version = {
        nombre: row["Nombre"] || "Actividad sin nombre",
        fechaInicio: parseFecha(row["Comienzo"]),
        fechaFin: parseFecha(row["Fin"]),
        plazo: parseDias(row["Duración"]),
        parentId: null,
        orden: 0, // se actualizará después
        tipo: "base",
        nroVersion: 0,
        responsable: "",
        avance: 0,
        predecesorId: null,
        sustento: "",
        vigente: true,
      };

      const activity = await Activity.create({ projectId });
      await ActivityVersion.create({
        ...version,
        activityId: activity.id,
      });

      idMap.set(row["Id"], activity.id);
      rowsWithDBIds.push({
        ...row,
        dbActivityId: activity.id,
        level: row["Nivel de esquema"],
      });
    }

    // Paso 2: Asignar parentId y predecesorId
    const padresPorNivel = {};

    for (let i = 0; i < rowsWithDBIds.length; i++) {
      const row = rowsWithDBIds[i];
      const thisActivityId = row.dbActivityId;
      const nivelActual = row["Nivel de esquema"];

      // Determinar el parentId si no es nivel 1
      let parentId = 0;

      if (nivelActual > 1 && padresPorNivel[nivelActual - 1]) {
        parentId = padresPorNivel[nivelActual - 1];
      }

      console.log(
        parentId
          ? `🧭 ${row["Nombre"]} será hijo de ID ${parentId} (nivel ${nivelActual})`
          : `🌲 ${row["Nombre"]} es raíz (nivel ${nivelActual})`
      );

      await ActivityVersion.update(
        { parentId },
        {
          where: {
            activityId: thisActivityId,
            nroVersion: 0,
          },
        }
      );

      // Actualizar el último ID usado para este nivel
      padresPorNivel[nivelActual] = thisActivityId;
    }

    // Paso 3: Asignar orden entre hermanos
    const ordenPorPadre = new Map();

    for (let i = 0; i < rowsWithDBIds.length; i++) {
      const row = rowsWithDBIds[i];
      const thisActivityId = row.dbActivityId;

      const version = await ActivityVersion.findOne({
        where: { activityId: thisActivityId, nroVersion: 0 },
      });

      const parentKey = version.parentId || 0;
      const hermanos = ordenPorPadre.get(parentKey) || [];
      const nuevoOrden = hermanos.length + 1;

      console.log(
        `📌 Asignando orden=${nuevoOrden} a "${row["Nombre"]}" con parentId=${parentKey}`
      );

      await ActivityVersion.update(
        { orden: nuevoOrden },
        {
          where: {
            activityId: thisActivityId,
            nroVersion: 0,
          },
        }
      );

      ordenPorPadre.set(parentKey, [...hermanos, thisActivityId]);
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
