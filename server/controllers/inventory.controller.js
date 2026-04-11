// server/controllers/inventory.controller.js
import mongoose from "mongoose";
import InventoryMovement from "../models/inventoryMovement.model.js";
import { ERR } from "../utils/httpError.js";

/**
 * Utilidad: calcula stock disponible por productId (+opcional location)
 * dentro del tenant actual (storeId).
 */
async function computeStock({ storeId, productId, location }) {
  const match = {
    storeId: new mongoose.Types.ObjectId(storeId),
    productId: new mongoose.Types.ObjectId(productId),
  };
  if (location) match.$or = [{ locationTo: location }, { locationFrom: location }];

  const cursor = await InventoryMovement.aggregate([
    { $match: match },
    {
      $project: {
        signQty: {
          $switch: {
            branches: [
              // ADJUST: tratamos qty como reposición (positiva).
              // Si requieres ajuste negativo, usa deltaSign="-" en el controller que crea el movimiento
              // (guardamos el signo en notes para auditoría).
              { case: { $eq: ["$action", "ADJUST"] }, then: "$qty" },
              // RESERVE: baja disponible
              { case: { $eq: ["$action", "RESERVE"] }, then: { $multiply: [-1, "$qty"] } },
              // RELEASE: sube disponible
              { case: { $eq: ["$action", "RELEASE"] }, then: "$qty" },
              // RECEIVE: ingreso al almacen (sube)
              { case: { $eq: ["$action", "RECEIVE"] }, then: "$qty" },
              // DISPATCH: salida del almacen (baja)
              { case: { $eq: ["$action", "DISPATCH"] }, then: { $multiply: [-1, "$qty"] } },
              // MOVE: netea entre origen/destino
              { case: { $eq: ["$action", "MOVE"] }, then: 0 },
            ],
            default: 0,
          },
        },
        moveTo: { $cond: [{ $eq: ["$action", "MOVE"] }, "$qty", 0] },
        moveFrom: { $cond: [{ $eq: ["$action", "MOVE"] }, { $multiply: [-1, "$qty"] }, 0] },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: { $add: ["$signQty", "$moveTo", "$moveFrom"] } },
      },
    },
  ]);

  return cursor[0]?.total ?? 0;
}

/**
 * GET /api/inventory/stock?productId=...&location=...
 */
export async function getStockController(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION("Falta storeId (tenant).");

    const { productId, location } = req.query;
    if (!productId) throw ERR.VALIDATION("productId es requerido.");

    const total = await computeStock({ storeId, productId, location });
    return res.ok({ productId, location: location || null, stock: total });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/inventory/movements?productId=...&page=1&limit=20
 */
export async function listMovementsController(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION("Falta storeId (tenant).");

    const { productId, page = 1, limit = 20 } = req.query;
    const pageN = Math.max(1, parseInt(page));
    const limitN = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageN - 1) * limitN;

    const filter = { storeId };
    if (productId) filter.productId = productId;

    const [rows, total] = await Promise.all([
      InventoryMovement.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitN),
      InventoryMovement.countDocuments(filter),
    ]);

    return res.ok({ total, page: pageN, limit: limitN, rows });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/inventory/adjust
 * Body: { productId, qty, locationTo?, notes?, deltaSign?("+"|"-") }
 * - Ajuste positivo por defecto; si deltaSign === "-", tratamos el ajuste como negativo a nivel semántico
 *   (guardamos el signo en notes para auditoría). El cálculo de stock interpreta ADJUST como positivo.
 */
export async function adjustStockController(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION("Falta storeId (tenant).");

    const { productId, qty, locationTo = "", notes = "", deltaSign = "+" } = req.body;
    if (!productId || !Number.isFinite(qty) || qty <= 0) {
      throw ERR.VALIDATION("productId y qty>0 son requeridos.");
    }

    const effectiveSign = deltaSign === "-" ? "-" : "+";

    const movement = await InventoryMovement.create({
      storeId,
      productId,
      action: "ADJUST",
      locationTo,
      qty: Math.abs(qty), // guardamos qty positiva
      notes: `${notes}`.trim() ? `${notes} (delta:${effectiveSign})` : `(delta:${effectiveSign})`,
      performedBy: req.userId,
      refType: "MANUAL",
    });

    return res.ok({ message: "Ajuste registrado", movement });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/inventory/reserve
 * Body: { productId, qty, refType='ORDER', refId, locationTo? }
 */
export async function reserveStockController(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION("Falta storeId (tenant).");

    const { productId, qty, refType = "ORDER", refId = "", locationTo = "" } = req.body;
    if (!productId || !Number.isFinite(qty) || qty <= 0) {
      throw ERR.VALIDATION("productId y qty>0 son requeridos.");
    }

    // Validación de disponibilidad
    const available = await computeStock({ storeId, productId, location: locationTo });
    if (available < qty) {
      throw ERR.CONFLICT(`Stock insuficiente: disponible=${available}, requerido=${qty}`);
    }

    const movement = await InventoryMovement.create({
      storeId,
      productId,
      action: "RESERVE",
      locationTo,
      qty: Math.abs(qty),
      performedBy: req.userId,
      refType,
      refId,
    });

    return res.ok({ message: "Reserva registrada", movement });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/inventory/release
 * Body: { productId, qty, refType='ORDER', refId, locationTo? }
 */
export async function releaseStockController(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION("Falta storeId (tenant).");

    const { productId, qty, refType = "ORDER", refId = "", locationTo = "" } = req.body;
    if (!productId || !Number.isFinite(qty) || qty <= 0) {
      throw ERR.VALIDATION("productId y qty>0 son requeridos.");
    }

    const movement = await InventoryMovement.create({
      storeId,
      productId,
      action: "RELEASE",
      locationTo,
      qty: Math.abs(qty),
      performedBy: req.userId,
      refType,
      refId,
    });

    return res.ok({ message: "Liberación registrada", movement });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/inventory/move
 * Body: { productId, qty, from?, to, refType?, refId? }
 */
export async function moveStockController(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION("Falta storeId (tenant).");

    const { productId, qty, from = "", to = "", refType = "MANUAL", refId = "" } = req.body;
    if (!productId || !Number.isFinite(qty) || qty <= 0) {
      throw ERR.VALIDATION("productId y qty>0 son requeridos.");
    }
    if (!to) throw ERR.VALIDATION("Destino (to) es requerido.");

    // Validar disponibilidad en origen si se especifica
    const availableFrom = from ? await computeStock({ storeId, productId, location: from }) : Infinity;
    if (from && availableFrom < qty) {
      throw ERR.CONFLICT(`Stock insuficiente en '${from}': disponible=${availableFrom}, requerido=${qty}`);
    }

    const movement = await InventoryMovement.create({
      storeId,
      productId,
      action: "MOVE",
      locationFrom: from,
      locationTo: to,
      qty: Math.abs(qty),
      performedBy: req.userId,
      refType,
      refId,
    });

    return res.ok({ message: "Movimiento registrado", movement });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/inventory/receive
 * Body: { productId, qty, trackingCode, orderId?, notes? }
 * Recepcionar producto en almacen (vendedor entrego al almacen de la plataforma).
 */
export async function receiveStockController(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION("Falta storeId (tenant).");

    const { productId, qty, trackingCode = "", orderId = "", notes = "" } = req.body;
    if (!productId || !Number.isFinite(qty) || qty <= 0) {
      throw ERR.VALIDATION("productId y qty>0 son requeridos.");
    }
    if (!trackingCode) throw ERR.VALIDATION("trackingCode (numero de guia) es requerido.");

    const movement = await InventoryMovement.create({
      storeId,
      productId,
      action: "RECEIVE",
      locationTo: "WAREHOUSE",
      qty: Math.abs(qty),
      performedBy: req.userId,
      refType: orderId ? "ORDER" : "MANUAL",
      refId: orderId || trackingCode,
      notes: `Guia: ${trackingCode}${notes ? ` | ${notes}` : ""}`,
    });

    return res.ok({ message: "Producto recepcionado en almacen", movement });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/inventory/dispatch
 * Body: { productId, qty, deliveryTaskId?, trackingCode?, notes? }
 * Despachar producto del almacen hacia delivery.
 */
export async function dispatchStockController(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION("Falta storeId (tenant).");

    const { productId, qty, deliveryTaskId = "", trackingCode = "", notes = "" } = req.body;
    if (!productId || !Number.isFinite(qty) || qty <= 0) {
      throw ERR.VALIDATION("productId y qty>0 son requeridos.");
    }

    // Validar stock en almacen
    const available = await computeStock({ storeId, productId, location: "WAREHOUSE" });
    if (available < qty) {
      throw ERR.CONFLICT(`Stock insuficiente en almacen: disponible=${available}, requerido=${qty}`);
    }

    const movement = await InventoryMovement.create({
      storeId,
      productId,
      action: "DISPATCH",
      locationFrom: "WAREHOUSE",
      locationTo: "DELIVERY",
      qty: Math.abs(qty),
      performedBy: req.userId,
      refType: deliveryTaskId ? "DELIVERY" : "MANUAL",
      refId: deliveryTaskId || trackingCode,
      notes: notes || `Despachado a delivery${trackingCode ? ` | Guia: ${trackingCode}` : ""}`,
    });

    return res.ok({ message: "Producto despachado a delivery", movement });
  } catch (error) {
    return next(error);
  }
}

// Export util por si lo necesitas desde otros módulos (p. ej. órdenes)
export const _inventoryUtils = { computeStock };
