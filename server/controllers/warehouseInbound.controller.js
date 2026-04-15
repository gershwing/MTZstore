// server/controllers/warehouseInbound.controller.js
import mongoose from 'mongoose';
import WarehouseInbound from '../models/warehouseInbound.model.js';
import Product from '../models/product.model.js';
import ProductVariant from '../models/productVariant.model.js';
import InventoryMovement from '../models/inventoryMovement.model.js';
import { ERR } from '../utils/httpError.js';

/**
 * POST /api/warehouse-inbound
 * Seller creates an inbound request to send stock to MTZ warehouse.
 */
export async function create(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION('Falta storeId (tenant).');

    const { lineItems, notes = '' } = req.body;
    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      throw ERR.VALIDATION('lineItems es requerido y debe contener al menos un item.');
    }

    // Validate all productIds belong to the seller's store and populate names
    const populatedItems = [];

    for (const item of lineItems) {
      if (!item.productId) throw ERR.VALIDATION('Cada lineItem requiere productId.');
      if (!item.qty || item.qty < 1) throw ERR.VALIDATION('Cada lineItem requiere qty >= 1.');

      const product = await Product.findOne({
        _id: item.productId,
        storeId,
      }).select('name images');

      if (!product) {
        throw ERR.NOT_FOUND(`Producto ${item.productId} no encontrado en esta tienda.`);
      }

      let variantLabel = '';
      let sku = '';

      if (item.variantId) {
        const variant = await ProductVariant.findOne({
          _id: item.variantId,
          productId: item.productId,
        }).select('attributes sku');

        if (!variant) {
          throw ERR.NOT_FOUND(`Variante ${item.variantId} no encontrada para producto ${item.productId}.`);
        }

        sku = variant.sku || '';

        // Build variantLabel from attributes (e.g. "Rojo / XL")
        if (variant.attributes && typeof variant.attributes === 'object') {
          variantLabel = Object.values(variant.attributes).join(' / ');
        }
      }

      populatedItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        sku,
        productName: product.name,
        variantLabel,
        qty: Math.floor(item.qty),
        qtyReceived: 0,
      });
    }

    const doc = await WarehouseInbound.create({
      storeId,
      userId: req.userId,
      lineItems: populatedItems,
      notes,
    });

    return res.created(doc);
  } catch (e) {
    return next(e);
  }
}

/**
 * GET /api/warehouse-inbound/mine
 * Seller lists their own inbound requests.
 */
export async function listMine(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageN = Math.max(1, parseInt(page));
    const limitN = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageN - 1) * limitN;

    const filter = {
      userId: req.userId,
      deletedAt: { $exists: false },
    };

    const [items, total] = await Promise.all([
      WarehouseInbound.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitN)
        .lean(),
      WarehouseInbound.countDocuments(filter),
    ]);

    return res.ok({ items, total, page: pageN, limit: limitN });
  } catch (e) {
    return next(e);
  }
}

/**
 * GET /api/warehouse-inbound/admin
 * Admin lists all inbound requests with filters.
 */
export async function listAdmin(req, res, next) {
  try {
    const { storeId, status, q, page = 1, limit = 20 } = req.query;
    const pageN = Math.max(1, parseInt(page));
    const limitN = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageN - 1) * limitN;

    const filter = { deletedAt: { $exists: false } };

    if (storeId) filter.storeId = storeId;
    if (status) filter.status = status;

    // Search by notes or lineItems.productName
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { notes: regex },
        { 'lineItems.productName': regex },
      ];
    }

    const [items, total] = await Promise.all([
      WarehouseInbound.find(filter)
        .populate('userId', 'name email')
        .populate('storeId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitN)
        .lean(),
      WarehouseInbound.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitN);

    return res.ok({ items, total, page: pageN, limit: limitN, totalPages });
  } catch (e) {
    return next(e);
  }
}

/**
 * GET /api/warehouse-inbound/admin/:id
 * Get a single inbound request with full details.
 */
export async function getById(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ERR.VALIDATION('ID inválido.');
    }

    const doc = await WarehouseInbound.findById(id)
      .populate('userId', 'name email')
      .populate('storeId', 'name')
      .populate('reviewedBy', 'name email')
      .populate('lineItems.productId', 'name images')
      .lean();

    if (!doc) throw ERR.NOT_FOUND('Solicitud de ingreso no encontrada.');

    return res.ok(doc);
  } catch (e) {
    return next(e);
  }
}

/**
 * PATCH /api/warehouse-inbound/:id/approve
 * Admin approves an inbound request and creates inventory movements.
 */
export async function approve(req, res, next) {
  try {
    const { id } = req.params;

    const request = await WarehouseInbound.findById(id);
    if (!request) throw ERR.NOT_FOUND('Solicitud de ingreso no encontrada.');

    if (request.status !== 'PENDING') {
      throw ERR.CONFLICT(`La solicitud ya tiene estado: ${request.status}`);
    }

    // Update request status
    request.status = 'APPROVED';
    request.reviewedBy = req.userId;
    request.reviewedAt = new Date();

    // Create inventory movements for each line item
    const movementPromises = request.lineItems.map((item) => {
      return InventoryMovement.create({
        storeId: request.storeId,
        productId: item.productId,
        action: 'RECEIVE',
        locationTo: 'warehouse-mtz',
        qty: item.qty,
        refType: 'WAREHOUSE_INBOUND',
        refId: String(request._id),
        performedBy: req.userId,
        notes: `Inbound aprobado | ${item.productName}${item.variantLabel ? ` (${item.variantLabel})` : ''}`,
      });
    });

    // Update qtyReceived on each line item and increment warehouseStock
    const stockUpdates = [];
    for (const item of request.lineItems) {
      item.qtyReceived = item.qty;

      // Increment warehouseStock on the product or variant
      if (item.variantId) {
        stockUpdates.push(
          ProductVariant.findByIdAndUpdate(item.variantId, {
            $inc: { warehouseStock: item.qty }
          })
        );
      } else {
        stockUpdates.push(
          Product.findByIdAndUpdate(item.productId, {
            $inc: { warehouseStock: item.qty }
          })
        );
      }
    }

    await Promise.all([
      request.save(),
      ...movementPromises,
      ...stockUpdates,
    ]);

    return res.ok(request);
  } catch (e) {
    return next(e);
  }
}

/**
 * PATCH /api/warehouse-inbound/:id/reject
 * Admin rejects an inbound request.
 */
export async function reject(req, res, next) {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body;

    const request = await WarehouseInbound.findById(id);
    if (!request) throw ERR.NOT_FOUND('Solicitud de ingreso no encontrada.');

    if (request.status !== 'PENDING') {
      throw ERR.CONFLICT(`La solicitud ya tiene estado: ${request.status}`);
    }

    request.status = 'REJECTED';
    request.rejectionReason = reason;
    request.reviewedBy = req.userId;
    request.reviewedAt = new Date();

    await request.save();

    return res.ok(request);
  } catch (e) {
    return next(e);
  }
}
