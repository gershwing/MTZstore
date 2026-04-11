// server/middlewares/withViewerCurrency.js
import { ensureCurrency } from "../utils/fx.js";

/**
 * Usa (prioridad): query ?currency=USD, header x-currency, luego default "USD".
 * getFxSnapshot(storeId) debe devolverte el último snapshot válido.
 */
export default function withViewerCurrency(getFxSnapshot) {
  return async (req, _res, next) => {
    try {
      const qCur = ensureCurrency(req.query?.currency || req.headers["x-currency"] || "USD");
      const storeId = req?.tenant?.storeId || null;
      let fx = null;

      if (storeId && typeof getFxSnapshot === "function") {
        // Ej: lee de Redis/Mongo tu feed Binance P2P (BOB/USDT→USD) normalizado a USD↔BOB
        // Debe retornar: { usdBob: number, bobUsd: number, asOf: Date }
        fx = await getFxSnapshot(storeId);
      }

      req.viewerCurrency = qCur;    // "USD" | "BOB"
      req.fxSnapshot = fx;          // { usdBob, bobUsd, asOf } | null
      next();
    } catch (err) {
      next(err);
    }
  };
}
