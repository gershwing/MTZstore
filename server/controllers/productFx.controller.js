import { ERR } from '../utils/httpError.js';
import { getBobToUsdRate } from '../services/binanceService.js';

/* ======================================================
   FX RATE CONTROLLER
====================================================== */

/**
 * Devuelve la tasa USDT/BOB
 * Usada por frontend y backend para conversión de precios
 */
export async function getFxRateController(req, res, next) {
  try {
    const rate = await getBobToUsdRate();

    if (!Number.isFinite(rate) || rate <= 0) {
      throw ERR.SERVER(`Invalid FX rate: ${rate}`);
    }

    return res.ok({
      fx: {
        pair: 'USDT/BOB',
        rate,
        source: 'binance',
      },
    });
  } catch (error) {
    // Fallback controlado (no rompemos frontend)
    const fallback = Number(process.env.FALLBACK_USDT_BOB || 6.90);

    return res.ok({
      fx: {
        pair: 'USDT/BOB',
        rate: fallback,
        source: 'fallback',
      },
      warning: error?.message || String(error),
    });
  }
}
