// server/controllers/warehouseInbound.controller.js
import mongoose from 'mongoose';
import WarehouseInbound from '../models/warehouseInbound.model.js';
import Product from '../models/product.model.js';
import ProductVariant from '../models/productVariant.model.js';
import InventoryMovement from '../models/inventoryMovement.model.js';
import { ERR } from '../utils/httpError.js';
import User from '../models/user.model.js';
import sendEmailFun from '../config/sendEmail.js';

/**
 * POST /api/warehouse-inbound
 * Seller creates an inbound request to send stock to MTZ warehouse.
 */
export async function create(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION('Falta storeId (tenant).');

    const { lineItems, notes = '', shipmentImages = [] } = req.body;
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
        productImage: product.images?.[0] || '',
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
      shipmentImages,
    });

    // Email notification to seller
    const user = await User.findById(req.userId).select('name email');
    if (user?.email) {
      sendEmailFun({
        sendTo: user.email,
        subject: 'Solicitud de envio al almacen enviada - MTZstore',
        html: `<div style="font-family:Arial;max-width:600px;margin:auto;padding:20px">
          <h2 style="color:#1d4ed8">Solicitud enviada</h2>
          <p>Hola <strong>${user.name}</strong>,</p>
          <p>Tu solicitud de envio al almacen ha sido registrada con <strong>${populatedItems.length}</strong> producto(s).</p>
          <p>Te notificaremos cuando sea revisada por nuestro equipo.</p>
          <p style="color:#666;font-size:13px">MTZstore - Tu mercado local</p>
        </div>`,
      }).catch(err => console.error('Inbound create email failed:', err));
    }

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
    const { lineItems: approvedItems, reviewNotes = '', reviewImages = [] } = req.body;

    const request = await WarehouseInbound.findById(id);
    if (!request) throw ERR.NOT_FOUND('Solicitud de ingreso no encontrada.');

    if (request.status !== 'PENDING') {
      throw ERR.CONFLICT(`La solicitud ya tiene estado: ${request.status}`);
    }

    // Update request status
    request.status = 'APPROVED';
    request.reviewedBy = req.userId;
    request.reviewedAt = new Date();
    request.reviewNotes = reviewNotes;
    request.reviewImages = reviewImages;

    // Create inventory movements for each line item
    const movementPromises = [];

    // Update qtyReceived on each line item and increment warehouseStock
    const stockUpdates = [];
    for (const item of request.lineItems) {
      // If approvedItems provided, find matching item and use its qtyReceived
      let received = item.qty; // default: full qty (backward compat)
      if (Array.isArray(approvedItems) && approvedItems.length > 0) {
        const match = approvedItems.find(
          (ai) =>
            String(ai.productId) === String(item.productId) &&
            String(ai.variantId || null) === String(item.variantId || null)
        );
        if (match && typeof match.qtyReceived === 'number') {
          received = Math.max(0, Math.min(match.qtyReceived, item.qty));
        }
      }

      item.qtyReceived = received;

      if (received > 0) {
        movementPromises.push(
          InventoryMovement.create({
            storeId: request.storeId,
            productId: item.productId,
            action: 'RECEIVE',
            locationTo: 'warehouse-mtz',
            qty: received,
            refType: 'WAREHOUSE_INBOUND',
            refId: String(request._id),
            performedBy: req.userId,
            notes: `Inbound aprobado | ${item.productName}${item.variantLabel ? ` (${item.variantLabel})` : ''} | recibido ${received}/${item.qty}`,
          })
        );

        // Increment warehouseStock by qtyReceived (not qty)
        if (item.variantId) {
          stockUpdates.push(
            ProductVariant.findByIdAndUpdate(item.variantId, {
              $inc: { warehouseStock: received }
            })
          );
        } else {
          stockUpdates.push(
            Product.findByIdAndUpdate(item.productId, {
              $inc: { warehouseStock: received }
            })
          );
        }
      }
    }

    await Promise.all([
      request.save(),
      ...movementPromises,
      ...stockUpdates,
    ]);

    // Email notification to seller
    const seller = await User.findById(request.userId).select('name email');
    if (seller?.email) {
      const totalRequested = request.lineItems.reduce((s, i) => s + i.qty, 0);
      const totalReceived = request.lineItems.reduce((s, i) => s + i.qtyReceived, 0);
      const isPartial = totalReceived < totalRequested;

      const itemsHtml = request.lineItems.map(i =>
        `<tr><td style="padding:4px 8px;border-bottom:1px solid #eee">${i.productName}${i.variantLabel ? ` (${i.variantLabel})` : ''}</td>
         <td style="padding:4px 8px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td>
         <td style="padding:4px 8px;border-bottom:1px solid #eee;text-align:center">${i.qtyReceived}</td></tr>`
      ).join('');

      sendEmailFun({
        sendTo: seller.email,
        subject: isPartial
          ? 'Solicitud aprobada con observaciones - MTZstore'
          : 'Solicitud aprobada - MTZstore',
        html: `<div style="font-family:Arial;max-width:600px;margin:auto;padding:20px">
          <h2 style="color:#16a34a">${isPartial ? 'Solicitud aprobada con observaciones' : 'Solicitud aprobada'}</h2>
          <p>Hola <strong>${seller.name}</strong>,</p>
          <p>Tu solicitud de envio al almacen ha sido <strong>aprobada</strong>.</p>
          <table style="width:100%;border-collapse:collapse;margin:12px 0">
            <tr style="background:#f3f4f6"><th style="padding:6px 8px;text-align:left">Producto</th><th style="padding:6px 8px">Solicitadas</th><th style="padding:6px 8px">Recibidas</th></tr>
            ${itemsHtml}
          </table>
          ${request.reviewNotes ? `<p><strong>Notas del almacen:</strong> ${request.reviewNotes}</p>` : ''}
          <p style="color:#666;font-size:13px">MTZstore - Tu mercado local</p>
        </div>`,
      }).catch(err => console.error('Inbound approve email failed:', err));
    }

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
    const { reason = '', reviewNotes = '', reviewImages = [] } = req.body;

    const request = await WarehouseInbound.findById(id);
    if (!request) throw ERR.NOT_FOUND('Solicitud de ingreso no encontrada.');

    if (request.status !== 'PENDING') {
      throw ERR.CONFLICT(`La solicitud ya tiene estado: ${request.status}`);
    }

    request.status = 'REJECTED';
    request.rejectionReason = reason;
    request.reviewNotes = reviewNotes;
    request.reviewImages = reviewImages;
    request.reviewedBy = req.userId;
    request.reviewedAt = new Date();

    await request.save();

    // Email notification to seller
    const seller = await User.findById(request.userId).select('name email');
    if (seller?.email) {
      sendEmailFun({
        sendTo: seller.email,
        subject: 'Solicitud rechazada - MTZstore',
        html: `<div style="font-family:Arial;max-width:600px;margin:auto;padding:20px">
          <h2 style="color:#dc2626">Solicitud rechazada</h2>
          <p>Hola <strong>${seller.name}</strong>,</p>
          <p>Tu solicitud de envio al almacen ha sido <strong>rechazada</strong>.</p>
          ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ''}
          ${reviewNotes ? `<p><strong>Notas:</strong> ${reviewNotes}</p>` : ''}
          <p>Puedes corregir los problemas y reenviar la solicitud desde tu panel.</p>
          <p style="color:#666;font-size:13px">MTZstore - Tu mercado local</p>
        </div>`,
      }).catch(err => console.error('Inbound reject email failed:', err));
    }

    return res.ok(request);
  } catch (e) {
    return next(e);
  }
}

/**
 * POST /api/warehouse-inbound/:id/resubmit
 * Seller resubmits a rejected inbound request as a new request.
 */
export async function resubmit(req, res, next) {
  try {
    const { id } = req.params;
    const original = await WarehouseInbound.findById(id);
    if (!original) throw ERR.NOT_FOUND('Solicitud no encontrada.');
    if (original.status !== 'REJECTED') {
      throw ERR.CONFLICT('Solo se pueden reenviar solicitudes rechazadas.');
    }
    // Verify ownership
    if (String(original.userId) !== String(req.userId)) {
      throw ERR.FORBIDDEN('No tiene permiso para reenviar esta solicitud.');
    }

    const { notes = '' } = req.body;

    const newDoc = await WarehouseInbound.create({
      storeId: original.storeId,
      userId: req.userId,
      lineItems: original.lineItems.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        sku: item.sku,
        productName: item.productName,
        productImage: item.productImage,
        variantLabel: item.variantLabel,
        qty: item.qty,
        qtyReceived: 0,
      })),
      notes: notes || original.notes,
      shipmentImages: original.shipmentImages || [],
    });

    return res.created(newDoc);
  } catch (e) {
    return next(e);
  }
}
