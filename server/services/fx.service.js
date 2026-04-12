// server/services/fx.service.js
import { ensureCurrency, convert, roundMoney, applyMargin } from '../utils/fx.js';
import { getBobToUsdRate } from './binanceService.js';

// Cache del snapshot FX en memoria (se refresca cada llamada a enrich)
let _cachedSnapshot = null;
let _cacheTs = 0;
const CACHE_TTL = 60_000; // 60s

async function getAutoSnapshot() {
  const now = Date.now();
  if (_cachedSnapshot && (now - _cacheTs) < CACHE_TTL) return _cachedSnapshot;
  try {
    const bobPerUsd = await getBobToUsdRate();
    if (Number.isFinite(bobPerUsd) && bobPerUsd > 0) {
      _cachedSnapshot = { usdBob: bobPerUsd, bobUsd: 1 / bobPerUsd, asOf: new Date(), source: 'binance' };
      _cacheTs = now;
      return _cachedSnapshot;
    }
  } catch {}
  // Fallback a env
  const envRate = Number(process.env.FX_USD_BOB || process.env.FX_FALLBACK_BOB_PER_USDT);
  if (Number.isFinite(envRate) && envRate > 0) {
    _cachedSnapshot = { usdBob: envRate, bobUsd: 1 / envRate, asOf: new Date(), source: 'env' };
    _cacheTs = now;
    return _cachedSnapshot;
  }
  return null;
}

/**
 * Obtiene un snapshot de FX.
 * Prioridad:
 *  1) req.app.locals.fxSnapshot (si lo inyectas desde un cron o al boot)
 *  2) process.env.FX_USD_BOB (ej. "13.10"); bobUsd = 1/usdBob
 *  3) null => no convierte (devolverá el mismo valor base)
 */
export async function getFxSnapshot(app) {
  // 1) cache en memoria (opcional)
  const cached = app?.locals?.fxSnapshot;
  if (cached && cached.usdBob && cached.bobUsd) return cached;

  // 2) desde .env
  const envUsdBob = Number(process.env.FX_USD_BOB);
  if (Number.isFinite(envUsdBob) && envUsdBob > 0) {
    return {
      usdBob: envUsdBob,
      bobUsd: 1 / envUsdBob,
      asOf: new Date(),
      source: 'env',
    };
  }

  // 3) sin datos → null (convert() retornará el mismo valor)
  return null;
}

/**
 * Enriquecer una lista de productos agregando precios públicos en ambas monedas.
 * No muta los documentos originales; devuelve plain objects.
 */
export async function enrichProductsWithFx(rows, snapshot) {
  if (!Array.isArray(rows)) return [];

  // Auto-obtener snapshot si no se pasa
  if (!snapshot) snapshot = await getAutoSnapshot();

  return rows.map((doc) => {
    const p = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
    const baseCurrency = ensureCurrency(p.baseCurrency || 'USD');
    const basePrice = Number(p.basePrice || 0);
    const marginPct = Number(p.marginPct || 0);

    // Precio final = basePrice + margen de la plataforma
    const finalPrice = applyMargin(basePrice, marginPct);

    // Calculamos en ambas monedas, respetando snapshot si existe
    const priceUSD = baseCurrency === 'USD'
      ? finalPrice
      : convert(finalPrice, 'BOB', 'USD', snapshot);

    const priceBOB = baseCurrency === 'BOB'
      ? finalPrice
      : convert(finalPrice, 'USD', 'BOB', snapshot);

    // Precio anterior (oldBasePrice)
    const oldBasePrice = Number(p.oldBasePrice || 0);
    const oldPriceUSD = oldBasePrice > 0
      ? (baseCurrency === 'USD' ? oldBasePrice : convert(oldBasePrice, 'BOB', 'USD', snapshot))
      : 0;
    const oldPriceBOB = oldBasePrice > 0
      ? (baseCurrency === 'BOB' ? oldBasePrice : convert(oldBasePrice, 'USD', 'BOB', snapshot))
      : 0;

    // Campos derivados para UI
    p.pricePublic = {
      USD: roundMoney(priceUSD, 2),
      BOB: roundMoney(priceBOB, 2),
    };

    // Campos que el client espera
    p.price = roundMoney(basePrice, 2);
    p.priceBob = roundMoney(priceBOB, 2);
    p.priceUsd = roundMoney(priceUSD, 2);
    p.oldPrice = roundMoney(oldBasePrice, 2);
    p.oldPriceBob = oldPriceBOB > 0 ? roundMoney(oldPriceBOB, 2) : null;
    p.oldPriceUsd = oldPriceUSD > 0 ? roundMoney(oldPriceUSD, 2) : null;

    p.marginPct = marginPct;
    p.fxAsOf = snapshot?.asOf || null;

    // Enriquecer wholesaleTiers con precios convertidos
    if (p.wholesaleTiers?.enabled) {
      const convertTierPrice = (tierPrice) => {
        const fp = applyMargin(Number(tierPrice) || 0, marginPct);
        return {
          bob: roundMoney(baseCurrency === 'BOB' ? fp : convert(fp, 'USD', 'BOB', snapshot), 2),
          usd: roundMoney(baseCurrency === 'USD' ? fp : convert(fp, 'BOB', 'USD', snapshot), 2),
        };
      };
      p.wholesaleTiers = {
        ...p.wholesaleTiers,
        tier1: { ...p.wholesaleTiers.tier1, ...convertTierPrice(p.wholesaleTiers.tier1?.price) },
        tier2: { ...p.wholesaleTiers.tier2, ...convertTierPrice(p.wholesaleTiers.tier2?.price) },
      };
    }

    return p;
  });
}
