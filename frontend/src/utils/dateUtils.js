// dateUtils.js
import dayjs from "dayjs";
import "dayjs/locale/es"; // Import

// Establece el locale a español
dayjs.locale("es");

// Establece los dias laborables y feriados
export const calendarioConfig = {
  diasLaborables: [1, 2, 3, 4, 5], // lunes a viernes (0 = domingo)
  feriados: [
    "2025-01-01",
    "2025-07-28",
    "2025-12-25",
    // agregar más feriados aquí o cargar desde DB
  ],
};

// Checks if a date is a working day based on calendarioConfig (customizable laborable days y feriados)
export const isWorkingDay = (date, holidays = calendarioConfig.feriados) => {
  const day = date.getDay();
  const formatted = date.toISOString().split("T")[0];
  // Usamos diasLaborables de calendarioConfig en lugar de fixed weekdays
  const isLaborableDay = calendarioConfig.diasLaborables.includes(day);
  return isLaborableDay && !holidays.includes(formatted);
};

// Calculates number of business days between two dates
export const businessDaysBetween = (start, end, holidays = []) => {
  let count = 0;
  let current = new Date(start);

  while (current <= end) {
    if (isWorkingDay(current, holidays)) count++;
    current.setDate(current.getDate() + 1);
  }

  return count;
};

// Adds business days to a date
export const addBusinessDays = (start, daysToAdd, holidays = []) => {
  const date = new Date(start);
  let added = 0;

  while (added < daysToAdd) {
    date.setDate(date.getDate() + 1);
    console.log("while", date);
    if (isWorkingDay(date, holidays)) added++;
  }

  return date;
};

export const formatearFechaLarga = (fechaStr) => {
  return dayjs(fechaStr).format("D [de] MMMM [de] YYYY");
};

export const formatearFechaCorta = (fechaStr) => {
  return dayjs(fechaStr).format("DD/MM/YYYY");
};

export function ordenarPorFirmaReciente(data = []) {
  return [...data].sort((a, b) => {
    const fechaA = a.firmaConvenio ? dayjs(a.firmaConvenio) : dayjs(0); // Epoch
    const fechaB = b.firmaConvenio ? dayjs(b.firmaConvenio) : dayjs(0);
    return fechaB.diff(fechaA); // más reciente primero
  });
}
