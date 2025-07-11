const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
require("dayjs/locale/es");

// Extiende dayjs con los plugins necesarios
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.locale("es");

// 🔢 Convierte "3 días" → 3
const parseDias = (duracionStr) => {
  const match = duracionStr?.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

// 📅 Convierte fechas tipo "10 julio 2025 09:00 a. m." a "YYYY-MM-DD"
const parseFecha = (valor) => {
  if (!valor) return null;

  if (typeof valor === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    const fecha = new Date(excelEpoch.getTime() + valor * 86400000);
    return fecha.toISOString().split("T")[0];
  }

  if (typeof valor === "string") {
    valor = valor
      .normalize("NFKC")
      .replace(/\u00a0/g, " ") // no-break space
      .replace(/\s+/g, " ") // múltiples espacios
      .replace(/a\s*\.?\s*m\.?/gi, "AM")
      .replace(/p\s*\.?\s*m\.?/gi, "PM")
      .trim();
  }

  const formatos = [
    "D MMMM YYYY HH:mm",
    "D MMMM YYYY h:mm A",
    "DD MMMM YYYY h:mm A",
    "D MMMM YYYY",
    "DD/MM/YYYY",
    "DD-MM-YYYY",
    "YYYY-MM-DD",
  ];

  for (const formato of formatos) {
    const parsed = dayjs(valor, formato, "es", false); // no strict
    if (parsed.isValid()) {
      return parsed.format("YYYY-MM-DD");
    }
  }

  return null;
};

// ⚙️ Configuración de calendario
const calendarioConfig = {
  diasLaborables: [1, 2, 3, 4, 5], // lunes a viernes (0 = domingo)
  feriados: [
    "2025-01-01",
    "2025-07-28",
    "2025-12-25",
    // agregar más feriados aquí o cargar desde DB
  ],
};

// ✅ Verifica si una fecha es día laborable (y no feriado)
const esDiaHabil = (fechaStr, config = calendarioConfig) => {
  const fecha = dayjs(fechaStr);
  const dia = fecha.day(); // 0 = domingo, 6 = sábado
  const esLaborable = config.diasLaborables.includes(dia);
  const esFeriado = config.feriados.includes(fecha.format("YYYY-MM-DD"));
  return esLaborable && !esFeriado;
};

// Siguiente dia laborable
const ajustarAProximoDiaHabil = (fechaStr, config = calendarioConfig) => {
  let fecha = dayjs(fechaStr);
  let intentos = 0;

  while (!esDiaHabil(fecha.format("YYYY-MM-DD"), config) && intentos < 30) {
    fecha = fecha.add(1, "day");
    intentos++;
  }

  return fecha.format("YYYY-MM-DD");
};

// Cuenta los días hábiles entre dos fechas (inclusive)
const contarDiasHabiles = (
  fechaInicioStr,
  fechaFinStr,
  config = calendarioConfig
) => {
  const inicio = dayjs(fechaInicioStr);
  const fin = dayjs(fechaFinStr);

  if (!inicio.isValid() || !fin.isValid() || fin.isBefore(inicio)) return 0;

  let cuenta = 0;
  let fecha = inicio;

  while (fecha.isSameOrBefore(fin)) {
    if (esDiaHabil(fecha.format("YYYY-MM-DD"), config)) {
      cuenta++;
    }
    fecha = fecha.add(1, "day");
  }

  return cuenta;
};

module.exports = {
  parseDias,
  parseFecha,
  esDiaHabil,
  ajustarAProximoDiaHabil,
  calendarioConfig,
  contarDiasHabiles,
};
