import DirectSale from "../models/directSale.model.js";
import { Product } from "../models/product.model.js";

const r = (n, d = 2) => Math.round(Number(n || 0) * 10 ** d) / 10 ** d;

/**
 * Genera número de venta secuencial: VDIRECTO-2026-00001
 */
export async function generateSaleNumber() {
  const year = new Date().getFullYear();
  const prefix = `VDIRECTA-${year}-`;

  const last = await DirectSale.findOne({ saleNumber: { $regex: `^${prefix}` } })
    .sort({ saleNumber: -1 })
    .select("saleNumber")
    .lean();

  let seq = 1;
  if (last?.saleNumber) {
    const parts = last.saleNumber.split("-");
    seq = (parseInt(parts[2], 10) || 0) + 1;
  }

  return `${prefix}${String(seq).padStart(5, "0")}`;
}

/**
 * Verifica stock disponible
 */
export async function hasEnoughStock(productId, variantId, qty) {
  const product = await Product.findById(productId).select("countInStock").lean();
  if (!product) return false;
  return (product.countInStock || 0) >= qty;
}

/**
 * Descuenta stock del producto
 */
export async function decreaseProductStock(productId, variantId, qty) {
  await Product.findByIdAndUpdate(productId, {
    $inc: { countInStock: -qty },
  });
}

/**
 * Restaura stock del producto (inverso de decreaseProductStock)
 */
export async function restoreProductStock(productId, variantId, qty) {
  await Product.findByIdAndUpdate(productId, {
    $inc: { countInStock: qty },
  });
}

/**
 * Enriquece items con snapshots de productos
 */
export function enrichItems(items, productsMap, variantsMap = new Map()) {
  return items.map((item) => {
    const p = productsMap.get(String(item.productId));
    if (!p) return item;

    const unitPrice = Number(item.unitPrice) || p.basePrice || 0;
    const costSnapshot = p.salesConfig?.marginConfig?.costUsd || 0;
    const qty = Number(item.qty) || 1;
    const subtotal = r(qty * unitPrice);
    const estimatedProfit = r(subtotal - costSnapshot * qty);

    // Construir nameSnapshot con atributos de variante
    let nameSnapshot = p.name || "";
    if (item.variantId) {
      const variant = variantsMap.get(String(item.variantId));
      if (variant?.attributes) {
        const attrs = Object.values(variant.attributes).filter(Boolean).join(" / ");
        if (attrs) nameSnapshot += ` (${attrs})`;
      }
    }

    return {
      productId: item.productId,
      variantId: item.variantId || null,
      nameSnapshot,
      brand: p.brand || "",
      imageSnapshot: p.images?.[0] || "",
      sku: p.sku || "",
      qty,
      pricingMode: item.pricingMode || "RETAIL",
      unitPrice: r(unitPrice),
      subtotal,
      costSnapshot: r(costSnapshot),
      estimatedProfit,
    };
  });
}

/**
 * Calcula totales de la venta
 */
export function calculateTotals(enrichedItems, { ivaEnabled = true, ivaPct = 13, itEnabled = true, itPct = 3 } = {}) {
  const subtotal = r(enrichedItems.reduce((s, i) => s + (i.subtotal || 0), 0));
  const ivaAmount = ivaEnabled ? r(subtotal * ivaPct / 100) : 0;
  const itAmount = itEnabled ? r(subtotal * itPct / 100) : 0;
  const total = r(subtotal + ivaAmount + itAmount);
  const totalCostUsd = r(enrichedItems.reduce((s, i) => s + (i.costSnapshot || 0) * (i.qty || 0), 0));
  const totalEstimatedProfit = r(enrichedItems.reduce((s, i) => s + (i.estimatedProfit || 0), 0));
  const marginPct = subtotal > 0 ? r((totalEstimatedProfit / subtotal) * 100) : 0;

  return { subtotal, ivaAmount, itAmount, total, totalCostUsd, totalEstimatedProfit, marginPct };
}
