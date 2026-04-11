import ShippingRateModel from "../models/shippingRate.model.js";

/**
 * Calcula el peso facturable: max(peso real, peso volumétrico)
 * Peso volumétrico = (L × W × H) / 5000 (estándar DHL/FedEx)
 */
export function calcBillableWeight(dimensions) {
  const weight = Number(dimensions?.weight) || 0;
  const length = Number(dimensions?.length) || 0;
  const width = Number(dimensions?.width) || 0;
  const height = Number(dimensions?.height) || 0;

  const volumetricWeight = (length * width * height) / 5000;
  return Math.max(weight, volumetricWeight, 0.1); // mínimo 0.1 kg
}

/**
 * Calcula costo de envío para un conjunto de items
 * @param {Array} items - [{dimensions, quantity}]
 * @param {string} method - MTZSTORE_EXPRESS | MTZSTORE_STANDARD | STORE
 * @param {string} zone - departamento destino
 * @param {number} subtotal - subtotal del pedido en BOB (para envío gratis)
 * @returns {Object} { cost, estimatedDays, isFree }
 */
export async function calcShippingCost(items, method, zone, subtotal = 0) {
  // Buscar tarifa
  const rate = await ShippingRateModel.findOne({
    method,
    zone,
    active: true,
  }).lean();

  // Si no hay tarifa definida para esa zona, usar tarifa default
  const defaultRate = rate || await ShippingRateModel.findOne({
    method,
    zone: "DEFAULT",
    active: true,
  }).lean();

  if (!defaultRate) {
    // Sin tarifa definida → envío gratis por defecto
    return {
      cost: 0,
      estimatedDays: { min: 2, max: 5 },
      isFree: true,
      reason: "Sin tarifa configurada",
    };
  }

  // Calcular peso total facturable
  let totalBillableWeight = 0;
  for (const item of items) {
    const bw = calcBillableWeight(item.dimensions || {});
    totalBillableWeight += bw * (Number(item.quantity) || 1);
  }

  // Costo = tarifa base + (peso facturable * tarifa por kg)
  const rawCost = defaultRate.baseRate + (totalBillableWeight * defaultRate.perKgRate);
  const cost = Math.round(rawCost * 100) / 100;

  // Envío gratis solo para STORE si freeAbove aplica
  // Express y Standard SIEMPRE cobran
  const isMtzMethod = ["MTZSTORE_EXPRESS", "MTZSTORE_STANDARD"].includes(method);
  if (!isMtzMethod && defaultRate.freeAbove > 0 && subtotal >= defaultRate.freeAbove) {
    return {
      cost: 0,
      estimatedDays: defaultRate.estimatedDays,
      isFree: true,
      reason: `Envio gratis por compra mayor a ${defaultRate.freeAbove} Bs`,
    };
  }

  return {
    cost,
    estimatedDays: defaultRate.estimatedDays,
    isFree: cost === 0,
    billableWeight: totalBillableWeight,
    baseRate: defaultRate.baseRate,
    perKgRate: defaultRate.perKgRate,
  };
}

/**
 * Obtener tarifas disponibles para una zona
 */
export async function getAvailableRates(zone) {
  const rates = await ShippingRateModel.find({
    $or: [{ zone }, { zone: "DEFAULT" }],
    active: true,
  }).lean();

  // Preferir zona específica sobre DEFAULT
  const byMethod = {};
  for (const r of rates) {
    if (!byMethod[r.method] || r.zone !== "DEFAULT") {
      byMethod[r.method] = r;
    }
  }

  return Object.values(byMethod);
}
