// utils/productFxMapper.js
// Nota: por ahora seguimos importando getBobToUsdRate() para no romper nada.
// Dentro del servicio, haremos que devuelva R = BOB por 1 USDT (USDT/BOB).
import { getBobToUsdRate } from "../services/binanceService.js";
import { applyMargin } from "./fx.js";

/**
 * Mapea un producto añadiendo precios en USD/USDT/BOB según su baseCurrency.
 * No escribe en DB: solo transforma el objeto para respuesta.
 * @param {Object} doc - Documento de mongoose o POJO
 * @param {number} rate - R = BOB por 1 USDT (USDT/BOB)
 * @returns {Object} producto enriquecido con priceUsd, priceUsdt, priceBob, oldPrice*
 */
export function mapWithFx(doc, rate) {
  const obj = doc?.toObject ? doc.toObject() : doc || {};
  const safeRate = Number(rate);
  const fxRate = Number.isFinite(safeRate) && safeRate > 0 ? safeRate : 1;

  const basePrice = Number(obj.basePrice) || 0;
  const oldBasePrice = Number(obj.oldBasePrice) || 0;
  const baseCurrency = (obj.baseCurrency || "USD").toUpperCase();
  const marginPct = Number(obj.marginPct || 0);

  // Aplicar margen de la plataforma antes de convertir
  const finalPrice = applyMargin(basePrice, marginPct);
  const finalOldPrice = applyMargin(oldBasePrice, marginPct);

  let priceUsd = 0,
    priceBob = 0,
    priceUsdt = 0,
    oldPriceUsd = 0,
    oldPriceBob = 0,
    oldPriceUsdt = 0;

  if (baseCurrency === "USD") {
    priceUsd = finalPrice;
    oldPriceUsd = finalOldPrice;

    priceBob = +(finalPrice * fxRate).toFixed(2);
    oldPriceBob = +(finalOldPrice * fxRate).toFixed(2);

    priceUsdt = +priceUsd.toFixed(2);
    oldPriceUsdt = +oldPriceUsd.toFixed(2);
  } else {
    priceBob = finalPrice;
    oldPriceBob = finalOldPrice;

    priceUsd = +(finalPrice / fxRate).toFixed(2);
    oldPriceUsd = +(finalOldPrice / fxRate).toFixed(2);

    priceUsdt = +(finalPrice / fxRate).toFixed(2);
    oldPriceUsdt = +(finalOldPrice / fxRate).toFixed(2);
  }

  return {
    ...obj,
    basePrice,
    oldBasePrice,
    baseCurrency,
    marginPct,
    priceUsd,
    oldPriceUsd,
    priceUsdt,
    oldPriceUsdt,
    priceBob,
    oldPriceBob,
    fx: { pair: "USDT/BOB", rate: fxRate }
  };
}

/**
 * Enriquecer una lista de productos con precios en USD/USDT/BOB.
 * Si la lista está vacía, evita llamar a la API de tasa.
 */
export async function enrichProductsWithFx(products = []) {
  if (!Array.isArray(products) || products.length === 0) return [];
  // Por compatibilidad, seguimos usando getBobToUsdRate(), pero debe devolver R = BOB por 1 USDT.
  const rate = await getBobToUsdRate();
  return products.map(p => mapWithFx(p, rate));
}

/**
 * Enriquecer un solo producto con precios en USD/USDT/BOB.
 */
export async function enrichProductWithFx(product) {
  if (!product) return null;
  const rate = await getBobToUsdRate(); // R = BOB por 1 USDT
  return mapWithFx(product, rate);
}

