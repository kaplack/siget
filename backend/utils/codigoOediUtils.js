// utils/codigoOediUtils.js
const { Consecutive } = require("../models");
const sequelize = require("../config/sequelize");

/** Allowed 'direccion' codes for OEDI code building */
const ALLOWED_DIRECCIONES = new Set(["DET", "DEP", "DATEC"]);

/**
 * Map modeloConvenio (1-9) to two-letter type ('DE' or 'CO').
 * @param {number|string} modeloConvenio - Integer 1..9
 * @returns {'DE'|'CO'}
 * @throws {Error} If the model is out of the allowed range.
 */
function mapModeloToTT(modeloConvenio) {
  const m = Number(modeloConvenio);
  if ([1, 2, 3, 4].includes(m)) return "DE"; // Delegación
  if ([5, 6, 7, 8, 9].includes(m)) return "CO"; // Colaboración
  throw new Error("modeloConvenio inválido (debe estar entre 1 y 9).");
}

/**
 * Normalize and validate direccion against the allowed set.
 * @param {string} direccionRaw - Raw 'direccion' value (e.g., 'dep', 'DEP').
 * @returns {string} Uppercased and trimmed direccion.
 * @throws {Error} If not in the allowed set.
 */
function validateDireccion(direccionRaw) {
  const val = String(direccionRaw || "")
    .trim()
    .toUpperCase();
  if (!ALLOWED_DIRECCIONES.has(val)) {
    throw new Error("direccion inválida. Use DET, DEP o DATEC.");
  }
  return val;
}

/**
 * Build final OEDI code: TT-X-SSS-###-OEDI (### = left pad)
 * @param {{tt:'DE'|'CO', modeloConvenio:number|string, direccion:string, correlativo:number, pad?:number, suffix?:string}} params
 * @returns {string} Code like 'DE-3-DEP-007-OEDI'
 */
function buildCodigoOedi({
  tt,
  modeloConvenio,
  direccion,
  correlativo,
  pad = 3,
  suffix = "OEDI",
}) {
  const num = String(correlativo).padStart(pad, "0");
  return `${tt}-${Number(modeloConvenio)}-${direccion}-${num}-${suffix}`;
}

/**
 * Atomically get next consecutive number for a given 'tipo' scope.
 * Current policy: scope by 'tipo' only (TT = 'CO' | 'DE').
 * If in the future the policy changes (e.g., TT+modelo or TT+modelo+direccion),
 * extend the WHERE and the unique index accordingly.
 *
 * @param {{ tipo:'DE'|'CO', transaction?:import('sequelize').Transaction }} params
 * @returns {Promise<number>} Next integer consecutive (1..n)
 */
async function getNextConsecutive({ tipo, transaction }) {
  // Reuse outer transaction if provided; else create and manage an inner one.
  if (transaction) {
    return lockAndIncrement({ tipo, transaction });
  }
  return sequelize.transaction(async (t) =>
    lockAndIncrement({ tipo, transaction: t })
  );
}

/**
 * Internal: row-level lock + increment on 'consecutives' for {tipo, null, null}.
 * @param {{ tipo:'DE'|'CO', transaction:import('sequelize').Transaction }} params
 * @returns {Promise<number>}
 */
async function lockAndIncrement({ tipo, transaction }) {
  // Lock the single counter row for this tipo
  let row = await Consecutive.findOne({
    where: { tipo, modeloConvenio: null, direccion: null },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  // Seed if missing (first time usage)
  if (!row) {
    row = await Consecutive.create(
      { tipo, modeloConvenio: null, direccion: null, lastValue: 0 },
      { transaction }
    );
  }

  row.lastValue += 1;
  await row.save({ transaction });
  return row.lastValue;
}

/**
 * Build the next OEDI code in one call (maps, validates, increments, builds).
 * It is safe for concurrent calls due to row-level locking on 'consecutives'.
 *
 * @param {{ modeloConvenio:number|string, direccion:string, transaction?:import('sequelize').Transaction, pad?:number, suffix?:string }} params
 * @returns {Promise<{codigoOedi:string, correlativo:number, tt:'DE'|'CO', direccion:string}>}
 */
async function getNextCodigoOedi({
  modeloConvenio,
  direccion,
  transaction,
  pad = 3,
  suffix = "OEDI",
}) {
  const tt = mapModeloToTT(modeloConvenio);
  const dir = validateDireccion(direccion);

  const correlativo = await getNextConsecutive({ tipo: tt, transaction });

  return {
    codigoOedi: buildCodigoOedi({
      tt,
      modeloConvenio,
      direccion: dir,
      correlativo,
      pad,
      suffix,
    }),
    correlativo,
    tt,
    direccion: dir,
  };
}

/**
 * Peek (read-only) the next consecutive WITHOUT incrementing.
 * Useful for UI previews. Do not rely on this for final persistence.
 *
 * @param {{ modeloConvenio:number|string }} params
 * @returns {Promise<{tt:'DE'|'CO', next:number}>}
 */
async function peekNextConsecutive({ modeloConvenio }) {
  const tt = mapModeloToTT(modeloConvenio);
  const row = await Consecutive.findOne({
    where: { tipo: tt, modeloConvenio: null, direccion: null },
  });
  const next = (row?.lastValue || 0) + 1;
  return { tt, next };
}

module.exports = {
  ALLOWED_DIRECCIONES,
  mapModeloToTT,
  validateDireccion,
  buildCodigoOedi,
  getNextConsecutive,
  getNextCodigoOedi,
  peekNextConsecutive,
};
