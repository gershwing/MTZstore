// services/binanceService.js
import fetch from "node-fetch";

/**
 * R = BOB por 1 USDT (par USDT/BOB)
 * Binance P2P (anuncios de compra) → se toma un rango y se calcula la MEDIANA.
 * Cache con TTL configurable y fallback por entorno. Exports retro-compatibles.
 */

// ===== Config =====
const DEFAULT_TTL_MS = Number(process.env.FX_CACHE_TTL_MS ?? 60_000); // 1 min
const REQUEST_TIMEOUT_MS = Number(process.env.FX_HTTP_TIMEOUT_MS ?? 5000);

const FALLBACK_BOB_PER_USDT = Number(
  process.env.FX_FALLBACK_BOB_PER_USDT ??
  process.env.FX_FALLBACK_BOB_PER_USD ?? // compatibilidad con tu env anterior
  7
);

// cache en memoria
let _cache = { rateBobPerUsdt: null, ts: 0 };

// ===== Utils =====
function median(nums) {
  if (!nums?.length) return null;
  const arr = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

function toNum(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v : NaN;
}

/** Llamada cruda a Binance P2P: devuelve R (BOB por 1 USDT) usando MEDIANA en el rango (start..end, end excluido) */
export async function getBobPerUsdtRateRaw(startIndex = 5, endIndex = 15) {
  const rows = Math.max(endIndex, 20);

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const resp = await fetch(
    "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
    {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        // algunos endpoints bloquean sin UA
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
      },
      body: JSON.stringify({
        asset: "USDT",
        fiat: "BOB",
        tradeType: "BUY", // precio al que el público compra USDT (BOB/USDT)
        page: 1,
        rows,
      }),
    }
  ).catch((e) => {
    clearTimeout(id);
    throw e;
  });

  clearTimeout(id);

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`HTTP ${resp.status} en Binance P2P. Body: ${text?.slice(0, 200)}`);
  }

  const data = await resp.json();
  if (data?.code && data.code !== "000000") {
    throw new Error(`Binance P2P code=${data.code} message=${data?.message || "N/A"}`);
  }
  if (!Array.isArray(data?.data) || data.data.length === 0) {
    throw new Error("No se obtuvieron anuncios de Binance P2P");
  }

  const sliced = data.data.slice(startIndex, endIndex);
  if (sliced.length === 0) throw new Error("Rango sin suficientes anuncios");

  const prices = sliced
    .map((ad) => toNum(ad?.adv?.price))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (!prices.length) throw new Error("Anuncios sin precios numéricos válidos");

  // Mediana → más estable ante outliers
  const med = median(prices);
  if (!Number.isFinite(med) || med <= 0) {
    throw new Error("Mediana inválida en precios de Binance P2P");
  }

  return med; // R = BOB por 1 USDT
}

/** Con caché + fallback. Opcional: { startIndex, endIndex, ttlMs } */
export async function getBobPerUsdtRateCached(opts = {}) {
  const ttlMs = Number(opts.ttlMs ?? DEFAULT_TTL_MS);
  const now = Date.now();

  if (_cache.rateBobPerUsdt && now - _cache.ts < ttlMs) {
    return { rate: _cache.rateBobPerUsdt, source: "cache", ts: _cache.ts };
  }

  try {
    const fresh = await getBobPerUsdtRateRaw(
      opts.startIndex ?? 5,
      opts.endIndex ?? 15
    );
    _cache = { rateBobPerUsdt: fresh, ts: now };
    return { rate: fresh, source: "binance", ts: now };
  } catch (err) {
    console.error("FX refresh error:", err.message);
    if (_cache.rateBobPerUsdt) {
      return { rate: _cache.rateBobPerUsdt, source: "stale-cache", ts: _cache.ts };
    }
    return { rate: FALLBACK_BOB_PER_USDT, source: "env-fallback", ts: now };
  }
}

/**
 * API retro-compatible:
 *  - getBobToUsdRate()              → devuelve BOB por 1 USDT (antes decía USD)
 *  - getBobToUsdRate(5, 15)         → igual, respetando rango
 */
export async function getBobToUsdRate(startIndex, endIndex) {
  if (startIndex === undefined && endIndex === undefined) {
    const { rate } = await getBobPerUsdtRateCached();
    return rate;
  }
  const { rate } = await getBobPerUsdtRateCached({ startIndex, endIndex });
  return rate;
}

/** Alias claro (misma tasa): R = BOB por 1 USDT */
export async function getBobPerUsdtRate(startIndex, endIndex) {
  return getBobToUsdRate(startIndex, endIndex);
}

/** Helpers de conversión (con caché) */
export async function convertUsdtToBob(amountUsdt) {
  const { rate, source, ts } = await getBobPerUsdtRateCached();
  const amountBob = Number((Number(amountUsdt || 0) * rate).toFixed(2));
  return { amountUsdt: Number(amountUsdt || 0), rate, amountBob, source, ts };
}

export async function convertBobToUsdt(amountBob) {
  const { rate, source, ts } = await getBobPerUsdtRateCached();
  const amountUsdt = Number((Number(amountBob || 0) / rate).toFixed(6)); // más decimales
  return { amountBob: Number(amountBob || 0), rate, amountUsdt, source, ts };
}

/** Alias retro (USD≈USDT para catálogo) */
export async function convertUsdToBob(amountUsd) {
  const { rate, source, ts } = await getBobPerUsdtRateCached();
  const amountBob = Number((Number(amountUsd || 0) * rate).toFixed(2));
  return { amountUsd: Number(amountUsd || 0), rate, amountBob, source, ts };
}

/** Invalidar caché manualmente (opcional) */
export function invalidateFxCache() {
  _cache = { rateBobPerUsdt: null, ts: 0 };
}
