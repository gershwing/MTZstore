import { Router } from "express";
import { authOptional } from "../middlewares/authOptional.js";
import ProductModel from "../models/product.model.js";
import { calcShippingCost, getAvailableRates } from "../services/shipping.service.js";

const router = Router();

/**
 * GET /api/shipping/calculate
 * Query: items (JSON array [{productId, quantity}]), method, zone, subtotal
 */
router.get("/calculate", authOptional, async (req, res, next) => {
  try {
    const { method, zone, subtotal } = req.query;
    let items;

    try {
      items = JSON.parse(req.query.items || "[]");
    } catch {
      return res.status(400).json({ error: true, message: "items debe ser JSON válido" });
    }

    if (!method || !zone) {
      return res.status(400).json({ error: true, message: "method y zone son requeridos" });
    }

    // Obtener dimensiones de los productos
    const productIds = items.map((i) => i.productId).filter(Boolean);
    const products = await ProductModel.find({ _id: { $in: productIds } })
      .select("dimensions")
      .lean();

    const prodMap = Object.fromEntries(products.map((p) => [String(p._id), p]));

    const enrichedItems = items.map((item) => ({
      dimensions: prodMap[item.productId]?.dimensions || {},
      quantity: item.quantity || 1,
    }));

    const result = await calcShippingCost(
      enrichedItems,
      method,
      zone,
      Number(subtotal) || 0
    );

    return res.json({ error: false, data: result });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/shipping/rates?zone=La Paz
 * Retorna tarifas disponibles para una zona
 */
router.get("/rates", authOptional, async (req, res, next) => {
  try {
    const zone = req.query.zone || "DEFAULT";
    const rates = await getAvailableRates(zone);
    return res.json({ error: false, data: rates });
  } catch (err) {
    return next(err);
  }
});

export default router;
