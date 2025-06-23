// utils/workingDays.js
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
dayjs.extend(minMax);

/**
 * Checks if a date is a working day (Monday to Friday and not a holiday).
 */
export function esDiaHabil(fecha, feriados = []) {
  const dia = fecha.day(); // 0 = domingo, 6 = sábado
  const esFinDeSemana = dia === 0 || dia === 6;
  const esFeriado = feriados.includes(fecha.format("YYYY-MM-DD"));
  return !esFinDeSemana && !esFeriado;
}

/**
 * Counts business days between two dates, inclusive.
 */
export function contarDiasHabilesEntre(fechaInicio, fechaFin, feriados = []) {
  let inicio = dayjs(fechaInicio);
  let fin = dayjs(fechaFin);
  if (fin.isBefore(inicio)) return 0;

  let contador = 0;
  while (!inicio.isAfter(fin)) {
    if (esDiaHabil(inicio, feriados)) contador++;
    inicio = inicio.add(1, "day");
  }
  return contador;
}

/**
 * Adds N working days to a start date and returns the resulting date.
 * Includes the start date if it's a business day.
 */
export function sumarDiasHabiles(fechaInicio, cantidadDias, feriados = []) {
  let fecha = dayjs(fechaInicio);
  let diasSumados = 0;
  while (diasSumados < cantidadDias) {
    if (esDiaHabil(fecha, feriados)) diasSumados++;
    if (diasSumados < cantidadDias) fecha = fecha.add(1, "day");
  }
  return fecha;
}

/**
 * Subtracts N working days from a final date and returns the resulting date.
 * Includes the end date if it's a business day.
 */
export function restarDiasHabiles(fechaFin, cantidadDias, feriados = []) {
  let fecha = dayjs(fechaFin);
  let diasRestados = 0;
  while (diasRestados < cantidadDias) {
    if (esDiaHabil(fecha, feriados)) diasRestados++;
    if (diasRestados < cantidadDias) fecha = fecha.subtract(1, "day");
  }
  return fecha;
}

/**
 * Given two of the fields (fechaInicio, fechaFin, plazo), calculates the missing one.
 * Optionally adjusts others if only one field changed.
 */
export function calcularTerceraVariable(
  { fechaInicio, fechaFin, plazo },
  feriados = [],
  campoEditado = null
) {
  const tieneInicio = !!fechaInicio;
  const tieneFin = !!fechaFin;
  const tienePlazo = plazo !== null && plazo !== undefined;

  // Normal 2-variable logic
  if (tieneInicio && tieneFin && !tienePlazo) {
    const p = contarDiasHabilesEntre(fechaInicio, fechaFin, feriados);
    return { fechaInicio, fechaFin, plazo: p };
  }
  if (tieneInicio && !tieneFin && tienePlazo) {
    const fin = sumarDiasHabiles(fechaInicio, plazo, feriados);
    return { fechaInicio, fechaFin: fin.format("YYYY-MM-DD"), plazo };
  }
  if (!tieneInicio && tieneFin && tienePlazo) {
    const inicio = restarDiasHabiles(fechaFin, plazo, feriados);
    return { fechaInicio: inicio.format("YYYY-MM-DD"), fechaFin, plazo };
  }

  // When all 3 values exist but one changed, recalculate to preserve consistency
  if (tieneInicio && tieneFin && tienePlazo && campoEditado) {
    if (campoEditado === "fechaInicio") {
      const fin = sumarDiasHabiles(fechaInicio, plazo, feriados);
      return { fechaInicio, fechaFin: fin.format("YYYY-MM-DD"), plazo };
    }
    if (campoEditado === "fechaFin") {
      const inicio = restarDiasHabiles(fechaFin, plazo, feriados);
      return { fechaInicio: inicio.format("YYYY-MM-DD"), fechaFin, plazo };
    }
    if (campoEditado === "plazo") {
      const fin = sumarDiasHabiles(fechaInicio, plazo, feriados);
      return { fechaInicio, fechaFin: fin.format("YYYY-MM-DD"), plazo };
    }
  }

  return { fechaInicio, fechaFin, plazo };
}

/**
 * Recalculates parent dates based on their children recursively.
 * It modifies the tree in-place.
 */
export function recalcularFechasPadres(tree, feriados = []) {
  const calcularFechas = (nodo) => {
    if (!nodo.children || nodo.children.length === 0) return;

    // First ensure children are processed
    nodo.children.forEach(calcularFechas);

    // Collect valid child dates
    const hijosConFechas = nodo.children.filter(
      (h) => h.fechaInicio && h.fechaFin
    );

    if (hijosConFechas.length === 0) return;

    const minInicio = dayjs.min(
      hijosConFechas.map((h) => dayjs(h.fechaInicio))
    );
    const maxFin = dayjs.max(hijosConFechas.map((h) => dayjs(h.fechaFin)));
    const nuevoPlazo = contarDiasHabilesEntre(
      minInicio.format("YYYY-MM-DD"),
      maxFin.format("YYYY-MM-DD"),
      feriados
    );

    nodo.fechaInicio = minInicio.format("YYYY-MM-DD");
    nodo.fechaFin = maxFin.format("YYYY-MM-DD");
    nodo.plazo = nuevoPlazo;
  };

  tree.forEach(calcularFechas);
}
