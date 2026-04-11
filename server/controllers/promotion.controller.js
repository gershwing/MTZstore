// server/controllers/promotion.controller.js
import mongoose from "mongoose";
import Promotion from "../models/promotion.model.js";
import { ERR } from "../utils/httpError.js";
import { convert, roundMoney, ensureCurrency } from "../utils/fx.js";

/** Utils */
function nowIn(range) {
  const now = new Date();
  return (!range.startAt || now >= new Date(range.startAt)) &&
    (!range.endAt || now <= new Date(range.endAt));
}

function normalizeCode(code) {
  return (code || "").trim().toUpperCase();
}

function productMatches(promo, item) {
  if (promo.appliesTo === "ALL") return true;
  if (promo.appliesTo === "PRODUCTS") {
    return promo.productIds?.some(id => String(id) === String(item.productId));
  }
  if (promo.appliesTo === "CATEGORIES") {
    // item.categoryId debe venir en el carro; si no lo tienes, puedes mapearlo por Product.populate
    return promo.categoryIds?.some(id => String(id) === String(item.categoryId));
  }
  return false;
}

function subtotalOfApplicable(promo, items) {
  return items
    .filter(it => productMatches(promo, it))
    .reduce((sum, it) => sum + (Number(it.price) * Number(it.qty)), 0);
}

/** BOGO: calcula ítems gratis multiplicando floor(totalQty/buyQty) * freeQty en el conjunto aplicable */
function computeBogoDiscount(promo, items) {
  const eligibleItems = items.filter(it => productMatches(promo, it));
  const totalQty = eligibleItems.reduce((s, it) => s + Number(it.qty), 0);
  if (totalQty < promo.buyQty || promo.buyQty <= 0) return 0;

  const packs = Math.floor(totalQty / promo.buyQty);
  const freeUnits = packs * promo.freeQty;

  // Descuenta el precio de los ítems más baratos primero (típico BOGO)
  const unitPrices = [];
  eligibleItems.forEach(it => {
    for (let i = 0; i < it.qty; i++) unitPrices.push(Number(it.price));
  });
  unitPrices.sort((a, b) => a - b);

  let discount = 0;
  for (let i = 0; i < freeUnits && i < unitPrices.length; i++) {
    discount += unitPrices[i];
  }
  return discount;
}

/**
 * Devuelve true si la promo está aplicable:
 * - status ACTIVE
 * - dentro de rango de fechas
 * - maxUses (si >0) no excedido
 * - minOrderAmount cumplido
 * (Nota: en preview convertimos minOrderAmount a la moneda del viewer; esta utilidad queda
 *  para otros usos donde no haya conversión previa.)
 */
function isPromoApplicable(promo, orderSubtotal) {
  if (promo.status !== "ACTIVE") return false;
  if (!nowIn({ startAt: promo.startAt, endAt: promo.endAt })) return false;
  if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) return false;
  if (promo.minOrderAmount > 0 && orderSubtotal < promo.minOrderAmount) return false;
  return true;
}

/** CRUD básico */
export async function createPromotionController(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION("Falta storeId (tenant).");

    const body = req.body || {};
    if (!body.name || !body.type || body.value == null) {
      throw ERR.VALIDATION("name, type y value son requeridos.");
    }
    if (!body.startAt || !body.endAt) {
      throw ERR.VALIDATION("startAt y endAt son requeridos.");
    }
    if (body.code) body.code = normalizeCode(body.code);

    const doc = await Promotion.create({ ...body, storeId });
    return res.created({ message: "Promoción creada", promotion: doc });
  } catch (error) {
    return next(error);
  }
}

export async function updatePromotionController(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    const id = req.params.id;
    if (!storeId) throw ERR.VALIDATION("Falta storeId (tenant).");
    if (!id) throw ERR.VALIDATION("id es requerido.");

    const body = { ...req.body };
    if (body.code) body.code = normalizeCode(body.code);

    const updated = await Promotion.findOneAndUpdate(
      { _id: id, storeId },
      body,
      { new: true }
    );
    if (!updated) throw ERR.NOT_FOUND("Promoción no encontrada.");
    return res.ok({ message: "Promoción actualizada", promotion: updated });
  } catch (error) {
    return next(error);
  }
}

export async function deletePromotionController(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    const id = req.params.id;
    if (!storeId) throw ERR.VALIDATION("Falta storeId (tenant).");
    if (!id) throw ERR.VALIDATION("id es requerido.");

    const deleted = await Promotion.findOneAndDelete({ _id: id, storeId });
    if (!deleted) throw ERR.NOT_FOUND("Promoción no encontrada.");
    return res.noContent();
  } catch (error) {
    return next(error);
  }
}

export async function getPromotionController(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    const id = req.params.id;
    if (!storeId) throw ERR.VALIDATION("Falta storeId (tenant).");
    if (!id) throw ERR.VALIDATION("id es requerido.");

    const doc = await Promotion.findOne({ _id: id, storeId });
    if (!doc) throw ERR.NOT_FOUND("Promoción no encontrada.");
    return res.ok(doc);
  } catch (error) {
    return next(error);
  }
}

export async function listPromotionsController(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION("Falta storeId (tenant).");

    const { q = "", status, page = 1, limit = 20 } = req.query;
    const pageN = Math.max(1, parseInt(page));
    const limitN = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageN - 1) * limitN;

    const filter = { storeId };
    if (q) filter.name = { $regex: q, $options: "i" };
    if (status) filter.status = status;

    const [rows, total] = await Promise.all([
      Promotion.find(filter).sort({ priority: 1, createdAt: -1 }).skip(skip).limit(limitN),
      Promotion.countDocuments(filter),
    ]);
    return res.ok({ total, page: pageN, limit: limitN, rows });
  } catch (error) {
    return next(error);
  }
}

/**
 * PREVIEW — Calcula descuento de una promo sobre un carrito
 * POST /api/promotion/preview
 * Body: {
 *   code?, autoApply?, items: [{ productId, categoryId, price, qty }],
 *   shipping?: { price?: number },
 *   currency?: "USD" | "BOB",     // (legacy, se ignora si usas withViewerCurrency)
 *   orderSubtotal?: number        // opcional; si no, se calcula de items
 * }
 * Requiere que el index haya montado: withViewerCurrency(getFxSnapshot)
 * para disponer de req.viewerCurrency y req.fxSnapshot.
 */
export async function previewPromotionController(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION("Falta storeId (tenant).");

    // Moneda del viewer + snapshot FX inyectados por middleware
    const viewerCurrency = ensureCurrency(req.viewerCurrency || "USD");
    const fx = req.fxSnapshot || null;

    const { code, autoApply = false, items = [], shipping = {} } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      throw ERR.VALIDATION("items debe ser un arreglo con productos (price, qty, productId).");
    }
    // items[].price deben venir ya en viewerCurrency; si no, conviértelo aquí (según tu origen).

    const orderSubtotal = Number(req.body?.orderSubtotal) ||
      items.reduce((s, it) => s + Number(it.price) * Number(it.qty), 0);

    let promos = [];
    if (autoApply) {
      promos = await Promotion.find({
        storeId,
        status: "ACTIVE",
        startAt: { $lte: new Date() },
        endAt: { $gte: new Date() },
      }).sort({ priority: 1 });
    } else {
      const norm = normalizeCode(code);
      if (!norm) throw ERR.VALIDATION("code es requerido cuando autoApply=false.");
      const one = await Promotion.findOne({ storeId, code: norm });
      if (one) promos = [one];
    }

    if (promos.length === 0) {
      return res.ok({ discounts: [], totalDiscount: 0, currency: viewerCurrency });
    }

    const applied = [];
    let remainingSubtotal = orderSubtotal;
    let totalDiscount = 0;

    for (const promo of promos) {
      // 1) Convertir umbral mínimo a la moneda del viewer
      const baseCur = ensureCurrency(promo.baseCurrency || "USD");
      const minOrderViewer = convert(promo.minOrderAmount || 0, baseCur, viewerCurrency, fx);

      // 2) Estado/fechas + mínimo cumplido
      const applicableByStatusDate =
        promo.status === "ACTIVE" &&
        new Date() >= new Date(promo.startAt) &&
        new Date() <= new Date(promo.endAt);

      if (!applicableByStatusDate) continue;
      if (minOrderViewer > 0 && remainingSubtotal < minOrderViewer) continue;

      let discount = 0;

      if (promo.type === "PERCENT") {
        const base = subtotalOfApplicable(promo, items); // ya en viewerCurrency
        discount = Math.max(0, (base * Number(promo.value)) / 100);

      } else if (promo.type === "FIXED") {
        // Convertir el valor FIXED desde la baseCurrency de la promo a viewerCurrency
        const fixedViewer = convert(Number(promo.value || 0), baseCur, viewerCurrency, fx);
        const base = subtotalOfApplicable(promo, items);
        discount = Math.min(base, fixedViewer);

      } else if (promo.type === "BOGO") {
        discount = computeBogoDiscount(promo, items); // no usa FX

      } else if (promo.type === "FREE_SHIPPING") {
        const shipPrice = Number(shipping?.price || 0); // ya en viewerCurrency
        discount = Math.max(0, shipPrice);
      }

      discount = roundMoney(discount);

      if (discount > 0) {
        applied.push({
          id: String(promo._id),
          code: promo.code || null,
          name: promo.name,
          type: promo.type,
          discount,
          currency: viewerCurrency,
          priority: promo.priority,
          stackable: promo.stackable,
        });

        totalDiscount += discount;
        remainingSubtotal = Math.max(0, roundMoney(remainingSubtotal - discount));

        if (!promo.stackable) break; // si no es combinable, detenemos la cadena
      }
    }

    return res.ok({
      discounts: applied,
      totalDiscount: roundMoney(totalDiscount),
      currency: viewerCurrency
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * REDEEM (opcional) — marcar uso (para confirmar en creación de orden)
 * POST /api/promotion/redeem  { promotionId, orderId }
 */
export async function redeemPromotionController(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION("Falta storeId (tenant).");
    const { promotionId, orderId } = req.body || {};
    if (!promotionId) throw ERR.VALIDATION("promotionId es requerido.");
    if (!orderId) throw ERR.VALIDATION("orderId es requerido.");

    const updated = await Promotion.findOneAndUpdate(
      { _id: promotionId, storeId, status: "ACTIVE" },
      { $inc: { usedCount: 1 } },
      { new: true }
    );
    if (!updated) throw ERR.NOT_FOUND("Promoción no encontrada o no activa.");
    return res.ok({ message: "Promoción canjeada", promotion: updated, orderId });
  } catch (error) {
    return next(error);
  }
}
