const dayjs = require("dayjs");
const { contarDiasHabiles, calendarioConfig } = require("./dateUtils");

/**
 * Calcula el avance planificado ponderado (global, por dirección y por proyecto)
 * @param {Array} actividades - Lista con fechaInicio, fechaFin, plazo, direccion, proyecto, projectId
 * @param {string} hoyStr - Fecha de corte (formato YYYY-MM-DD), por defecto hoy
 * @returns {Object} avanceGlobal, avancePorDireccion, avancePorProyecto
 */
function calcularAvancePlanificado(
  actividades,
  hoyStr = dayjs().format("YYYY-MM-DD")
) {
  let sumaPonderada = 0;
  let sumaPlazos = 0;

  const direccionData = {};
  const proyectoData = {};

  for (const act of actividades) {
    const { fechaInicio, fechaFin, plazo, direccion, proyecto, projectId } =
      act;

    if (!fechaInicio || !fechaFin || !plazo || plazo === 0) continue;

    let avance = 0;

    if (dayjs(hoyStr).isBefore(fechaInicio)) {
      avance = 0;
    } else if (dayjs(hoyStr).isAfter(fechaFin)) {
      avance = 1;
    } else {
      const diasTranscurridos = contarDiasHabiles(
        fechaInicio,
        hoyStr,
        calendarioConfig
      );
      avance = Math.min(diasTranscurridos / plazo, 1);
    }

    const ponderado = avance * plazo;
    sumaPonderada += ponderado;
    sumaPlazos += plazo;

    // Agrupación por dirección
    if (direccion) {
      if (!direccionData[direccion]) {
        direccionData[direccion] = {
          sumaPonderada: 0,
          sumaPlazos: 0,
          proyectos: new Set(),
        };
      }
      direccionData[direccion].sumaPonderada += ponderado;
      direccionData[direccion].sumaPlazos += plazo;
      if (projectId) direccionData[direccion].proyectos.add(projectId);
    }

    // Agrupación por proyecto
    if (projectId && proyecto) {
      if (!proyectoData[projectId]) {
        proyectoData[projectId] = {
          alias: proyecto,
          direccion,
          sumaPonderada: 0,
          sumaPlazos: 0,
        };
      }
      proyectoData[projectId].sumaPonderada += ponderado;
      proyectoData[projectId].sumaPlazos += plazo;
    }
  }

  const avanceGlobal = sumaPlazos > 0 ? (sumaPonderada / sumaPlazos) * 100 : 0;

  const avancePorDireccion = Object.entries(direccionData).map(
    ([dir, data]) => ({
      direccion: dir,
      numeroProyectos: data.proyectos.size,
      avancePonderado:
        data.sumaPlazos > 0
          ? +((data.sumaPonderada / data.sumaPlazos) * 100).toFixed(2)
          : 0,
    })
  );

  const avancePorProyecto = Object.entries(proyectoData).map(([id, data]) => ({
    projectId: Number(id),
    alias: data.alias,
    direccion: data.direccion,
    avancePonderado:
      data.sumaPlazos > 0
        ? +((data.sumaPonderada / data.sumaPlazos) * 100).toFixed(2)
        : 0,
  }));

  return {
    avanceGlobal: Number(avanceGlobal.toFixed(2)),
    avancePorDireccion,
    avancePorProyecto,
  };
}

module.exports = {
  calcularAvancePlanificado,
};
