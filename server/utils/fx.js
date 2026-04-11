// server/utils/fx.js

export function ensureCurrency(code, fallback = "USD") {
  const c = String(code || "").toUpperCase();
  return (c === "USD" || c === "BOB") ? c : fallback;
}

/**
 * snapshot: { usdBob: number, bobUsd: number, asOf: Date|string }
 * Convenciones:
 *  - usdBob = cuántos BOB por 1 USD (ej. 13.10)
 *  - bobUsd = cuántos USD por 1 BOB (recíproco o medido, ej. 0.07634)
 */
export function convert(amount, from, to, snapshot) {
  const val = Number(amount || 0);
  const f = ensureCurrency(from);
  const t = ensureCurrency(to);
  if (!Number.isFinite(val)) return 0;

  if (f === t) return val;

  if (!snapshot || !snapshot.usdBob || !snapshot.bobUsd) {
    // sin snapshot => no conviertas (o lanza error si quieres forzarlo)
    return val;
  }

  if (f === "USD" && t === "BOB") {
    return val * snapshot.usdBob;
  }
  if (f === "BOB" && t === "USD") {
    return val * snapshot.bobUsd;
  }
  return val;
}

/** Redondeos “bonitos” para mostrar totales */
export const roundMoney = (n, digits = 2) =>
  Math.round(Number(n || 0) * Math.pow(10, digits)) / Math.pow(10, digits);

/**
 * Aplica margen de ganancia (%) a un precio base.
 * @param {number} price  - precio base
 * @param {number} marginPct - porcentaje de margen (0–500)
 * @returns {number} precio con margen aplicado
 */
export function applyMargin(price, marginPct) {
  const p = Number(price || 0);
  const m = Number(marginPct || 0);
  if (m <= 0) return p;
  return p * (1 + m / 100);
}

/**
 * 🛬 Cálculo de precio BOB para modo importador
 *  - costUsd: costo de compra en USD
 *  - marginPct: margen de ganancia (0–500)
 *  - bobPerUsd: tasa de cambio BOB por 1 USD (ej. 13.10 desde Binance)
 */
export function calcImportPriceBob({ costUsd, marginPct, bobPerUsd }) {
  const cost = Number(costUsd || 0);
  const margin = Number(marginPct || 0);
  const rate = Number(bobPerUsd || 0);

  if (!rate || !Number.isFinite(cost)) return 0;

  const factor = 1 + margin / 100;
  const raw = cost * rate * factor;

  return roundMoney(raw, 2);
}
