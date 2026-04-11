import mongoose from "mongoose";
import DirectSale from "../models/directSale.model.js";
import SalePayment from "../models/salePayment.model.js";
import { Product } from "../models/product.model.js";
import ProductVariantModel from "../models/productVariant.model.js";
import Contact from "../models/contact.model.js";
import { ERR } from "../utils/httpError.js";
import {
  generateSaleNumber,
  hasEnoughStock,
  decreaseProductStock,
  restoreProductStock,
  enrichItems,
  calculateTotals,
} from "../utils/directSalesHelpers.js";

/**
 * POST /api/direct-sales — Crear venta directa
 */
export async function createDirectSale(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    const userId = req.userId || req.user?._id;
    const userName = req.user?.name || "";

    const { items, customer, contactId, saleMode, currency, paymentMethod, paymentBreakdown, paymentNotes, notes, ivaEnabled, itEnabled, ivaPct, itPct, isCredit, initialPayment, creditNote } = req.body;
    const customerUserId = req.body.userId || null;

    if (!items?.length) throw ERR.VALIDATION("Debe agregar al menos un producto");
    if (!customer?.name?.trim() && !contactId) throw ERR.VALIDATION("Seleccione un cliente");
    if (!paymentMethod) throw ERR.VALIDATION("Seleccione un método de pago");

    // Cargar productos
    const productIds = [...new Set(items.map((i) => String(i.productId)))];
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productsMap = new Map(products.map((p) => [String(p._id), p]));

    // Validar stock
    for (const item of items) {
      const ok = await hasEnoughStock(item.productId, item.variantId, item.qty);
      if (!ok) {
        const p = productsMap.get(String(item.productId));
        throw ERR.VALIDATION(`Stock insuficiente para "${p?.name || item.productId}". Disponible: ${p?.countInStock || 0}`);
      }
    }

    // Cargar variantes si existen
    const variantIds = items.filter((i) => i.variantId).map((i) => String(i.variantId));
    const variantsMap = new Map();
    if (variantIds.length > 0) {
      const variants = await ProductVariantModel.find({ _id: { $in: variantIds } }).lean();
      variants.forEach((v) => variantsMap.set(String(v._id), v));
    }

    // Enriquecer y calcular
    const enrichedItems = enrichItems(items, productsMap, variantsMap);
    const totals = calculateTotals(enrichedItems, {
      ivaEnabled: ivaEnabled !== false,
      ivaPct: ivaPct ?? 13,
      itEnabled: itEnabled !== false,
      itPct: itPct ?? 3,
    });
    const saleNumber = await generateSaleNumber();

    // Calcular estado de crédito
    const totalAmount = totals.total;
    let paymentStatus = "PAID";
    let amountPaid = totalAmount;
    let amountDue = 0;

    if (isCredit) {
      const initial = Math.min(Number(initialPayment) || 0, totalAmount);
      amountPaid = Math.round(initial * 100) / 100;
      amountDue = Math.round((totalAmount - amountPaid) * 100) / 100;
      paymentStatus = amountDue <= 0.01 ? "PAID" : amountPaid > 0 ? "PARTIAL" : "CREDIT";
    }

    const sale = await DirectSale.create({
      saleNumber,
      saleMode: saleMode || "RETAIL",
      items: enrichedItems,
      customer: customer ? { name: customer.name?.trim() || "", phone: customer.phone || "", document: customer.document || "", email: customer.email || "" } : undefined,
      contactId: contactId || null,
      userId: customerUserId || null,
      ...totals,
      ivaEnabled: ivaEnabled !== false,
      ivaPct: ivaPct ?? 13,
      itEnabled: itEnabled !== false,
      itPct: itPct ?? 3,
      currency: currency || "USD",
      paymentMethod,
      paymentBreakdown: Array.isArray(paymentBreakdown) ? paymentBreakdown : [],
      paymentNotes: paymentNotes || "",
      notes: notes || "",
      paymentStatus,
      amountPaid,
      amountDue,
      creditNote: creditNote || "",
      createdBy: userId,
      createdByName: userName,
      storeId,
    });

    // Descontar stock
    for (const item of enrichedItems) {
      await decreaseProductStock(item.productId, item.variantId, item.qty);
    }

    // Actualizar stats del contacto
    if (contactId) {
      await Contact.updateOne(
        { _id: contactId },
        { $inc: { totalPurchases: 1, totalSpent: totals.total }, $set: { lastPurchase: new Date() } }
      ).catch(() => {});
    }

    return res.status(201).json({ success: true, sale, message: `Venta ${saleNumber} registrada` });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/direct-sales — Listar ventas
 */
export async function listDirectSales(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    const { page = 1, pageSize = 20, startDate, endDate } = req.query;

    const query = {};
    if (storeId) query.storeId = storeId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(pageSize);
    const [items, total] = await Promise.all([
      DirectSale.find(query).populate("storeId", "name").sort({ createdAt: -1 }).skip(skip).limit(Number(pageSize)).lean(),
      DirectSale.countDocuments(query),
    ]);

    return res.status(200).json({ success: true, items, total, page: Number(page), pageSize: Number(pageSize) });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/direct-sales/:id — Detalle de venta
 */
export async function getDirectSale(req, res, next) {
  try {
    const sale = await DirectSale.findById(req.params.id).lean();
    if (!sale) throw ERR.VALIDATION("Venta no encontrada");
    return res.status(200).json({ success: true, sale });
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /api/direct-sales/:id — Eliminar venta
 */
export async function deleteDirectSale(req, res, next) {
  try {
    const sale = await DirectSale.findById(req.params.id);
    if (!sale) throw ERR.VALIDATION("Venta no encontrada");

    // Restaurar stock de cada item
    for (const item of sale.items || []) {
      await restoreProductStock(item.productId, item.variantId, item.qty);
    }

    // Eliminar abonos asociados
    await SalePayment.deleteMany({ directSaleId: sale._id });

    // Revertir stats del contacto
    if (sale.contactId) {
      await Contact.updateOne(
        { _id: sale.contactId },
        { $inc: { totalPurchases: -1, totalSpent: -(sale.total || 0) } }
      ).catch(() => {});
    }

    await DirectSale.findByIdAndDelete(sale._id);

    return res.status(200).json({ success: true, message: "Venta eliminada y stock restaurado" });
  } catch (e) {
    next(e);
  }
}

/**
 * PATCH /api/direct-sales/:id/remove-item — Quitar producto de una venta
 */
export async function removeItemFromSale(req, res, next) {
  try {
    const { id } = req.params;
    const { productId, variantId } = req.body;

    const sale = await DirectSale.findById(id);
    if (!sale) throw ERR.VALIDATION("Venta no encontrada");

    // Encontrar item por productId + variantId
    const itemIndex = sale.items.findIndex((i) =>
      String(i.productId) === String(productId) &&
      String(i.variantId || "") === String(variantId || "")
    );
    if (itemIndex === -1) throw ERR.VALIDATION("Producto no encontrado en esta venta");

    if (sale.items.length <= 1) {
      throw ERR.VALIDATION("No se puede eliminar el ultimo producto. Use eliminar venta en su lugar.");
    }

    const removedItem = sale.items[itemIndex];

    // Restaurar stock
    await restoreProductStock(removedItem.productId, removedItem.variantId, removedItem.qty);

    // Quitar item
    sale.items.splice(itemIndex, 1);

    // Recalcular totales
    const totals = calculateTotals(sale.items, {
      ivaEnabled: sale.ivaEnabled,
      ivaPct: sale.ivaPct,
      itEnabled: sale.itEnabled,
      itPct: sale.itPct,
    });

    sale.subtotal = totals.subtotal;
    sale.ivaAmount = totals.ivaAmount;
    sale.itAmount = totals.itAmount;
    sale.total = totals.total;
    sale.totalCostUsd = totals.totalCostUsd;
    sale.totalEstimatedProfit = totals.totalEstimatedProfit;
    sale.marginPct = totals.marginPct;

    // Recalcular deuda si es venta a crédito
    if (sale.paymentStatus !== "PAID" || sale.amountDue > 0) {
      const newAmountDue = Math.round(Math.max(0, sale.total - sale.amountPaid) * 100) / 100;
      sale.amountDue = newAmountDue;
      sale.paymentStatus = newAmountDue <= 0.01 ? "PAID" : sale.amountPaid > 0 ? "PARTIAL" : "CREDIT";
    }

    await sale.save();

    return res.json({
      success: true,
      sale: sale.toObject(),
      message: `Producto "${removedItem.nameSnapshot}" eliminado de la venta`,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/direct-sales/stats — Estadísticas para Dashboard
 */
export async function getDirectSalesStats(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    const { period = "month", date } = req.query;

    // Rango de fechas (UTC para evitar problemas de timezone)
    const now = new Date();
    const d = date ? new Date(date + "T00:00:00Z") : now;
    let startDate, endDate;

    switch (period) {
      case "day":
        startDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
        endDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
        break;
      case "week": {
        const day = d.getUTCDay();
        startDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day, 0, 0, 0));
        endDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate() + 6, 23, 59, 59, 999));
        break;
      }
      case "year":
        startDate = new Date(Date.UTC(d.getUTCFullYear(), 0, 1, 0, 0, 0));
        endDate = new Date(Date.UTC(d.getUTCFullYear(), 11, 31, 23, 59, 59, 999));
        break;
      default: // month
        startDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0));
        endDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    }

    const match = { createdAt: { $gte: startDate, $lte: endDate } };
    if (storeId) match.storeId = new mongoose.Types.ObjectId(String(storeId));

    // Totales
    const [totals] = await DirectSale.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$subtotal" },
          totalRevenue: { $sum: "$total" },
          salesCount: { $sum: 1 },
          totalItems: { $sum: { $size: "$items" } },
          totalProfit: { $sum: "$totalEstimatedProfit" },
        },
      },
    ]);

    // Ventas por día
    const salesByDay = await DirectSale.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$subtotal" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", sales: 1, count: 1 } },
    ]);

    // Top 5 productos
    const topProducts = await DirectSale.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.nameSnapshot",
          qty: { $sum: "$items.qty" },
          revenue: { $sum: "$items.subtotal" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, name: "$_id", qty: 1, revenue: 1 } },
    ]);

    // Ventas por método de pago
    const paymentMethods = await DirectSale.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$paymentMethod",
          amount: { $sum: "$subtotal" },
          count: { $sum: 1 },
        },
      },
      { $sort: { amount: -1 } },
      { $project: { _id: 0, method: "$_id", amount: 1, count: 1 } },
    ]);

    const LABELS = { CASH: "Efectivo", TRANSFER: "Transferencia", QR: "QR", MIXED: "Mixto", OTHER: "Otro" };
    paymentMethods.forEach((pm) => { pm.method = LABELS[pm.method] || pm.method; });

    const t = totals || { totalSales: 0, totalRevenue: 0, salesCount: 0, totalItems: 0, totalProfit: 0 };

    return res.json({
      success: true,
      stats: {
        totalSales: t.totalSales,
        totalRevenue: t.totalRevenue,
        salesCount: t.salesCount,
        totalItems: t.totalItems,
        totalProfit: t.totalProfit,
        avgTicket: t.salesCount > 0 ? Math.round((t.totalSales / t.salesCount) * 100) / 100 : 0,
        salesByDay,
        topProducts,
        paymentMethods,
      },
    });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/direct-sales/search-products?q=...
 */
export async function searchProducts(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) throw ERR.VALIDATION("Búsqueda muy corta");

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const filter = { $or: [{ name: regex }, { brand: regex }] };
    if (storeId) filter.storeId = storeId;

    const products = await Product.find(filter)
      .select("_id name brand basePrice baseCurrency wholesalePrice countInStock images salesConfig")
      .limit(Number(limit))
      .lean();

    // Cargar variantes de todos los productos encontrados
    const productIds = products.map((p) => p._id);
    const variants = await ProductVariantModel.find({
      productId: { $in: productIds },
      isActive: true,
      stock: { $gt: 0 },
    }).select("productId attributes sku price wholesalePrice stock images").lean();

    const variantsByProduct = {};
    for (const v of variants) {
      const pid = String(v.productId);
      if (!variantsByProduct[pid]) variantsByProduct[pid] = [];
      variantsByProduct[pid].push({
        _id: v._id,
        attributes: v.attributes || {},
        sku: v.sku || "",
        price: v.price || 0,
        wholesalePrice: v.wholesalePrice || 0,
        stock: v.stock || 0,
        image: v.images?.[0]?.url || v.images?.[0] || null,
      });
    }

    const enriched = products.map((p) => ({
      _id: p._id,
      name: p.name,
      brand: p.brand || "",
      image: p.images?.[0] || null,
      stock: p.countInStock || 0,
      basePrice: p.basePrice || 0,
      baseCurrency: p.baseCurrency || "USD",
      wholesalePrice: p.wholesalePrice || 0,
      costUsd: p.salesConfig?.marginConfig?.costUsd || 0,
      ivaEnabled: p.salesConfig?.taxConfig?.ivaEnabled !== false,
      ivaPct: p.salesConfig?.taxConfig?.ivaPct ?? 13,
      itEnabled: p.salesConfig?.taxConfig?.itEnabled !== false,
      itPct: p.salesConfig?.taxConfig?.otherTaxesPct ?? 3,
      variants: variantsByProduct[String(p._id)] || [],
    }));

    return res.status(200).json({ success: true, products: enriched });
  } catch (e) {
    next(e);
  }
}
