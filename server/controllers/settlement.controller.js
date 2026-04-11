// server/controllers/settlement.controller.js
import mongoose from "mongoose";
import Settlement from "../models/settlement.model.js";
import Payment from "../models/payment.model.js";
import StoreModel from "../models/store.model.js";
import { HttpError } from "../utils/httpError.js";
import { v2 as cloudinary } from "cloudinary";
import { auditLog } from "../services/audit.service.js";

// No dejes que un fallo de logging rompa la operación principal
async function safeAudit(req, payload) {
  try {
    await auditLog(req, payload);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("auditLog failed:", e?.message || e);
  }
}

/**
 * GET /api/settlements
 * Lista por tienda/periodo (tenant-aware)
 */
export async function listSettlementsController(req, res) {
  const { storeId: qStoreId, from, to, status, page = 1, limit = 20 } = req.query;

  const isSuperAdmin = req.user?.role === "SUPER_ADMIN";
  const tenantStoreId = req.tenant?.storeId;

  const filter = {};
  if (!isSuperAdmin && tenantStoreId) filter.storeId = tenantStoreId;
  if (isSuperAdmin && qStoreId) filter.storeId = qStoreId;

  if (from || to) {
    filter.$and = [
      { periodFrom: { $lte: to ? new Date(to) : new Date("2999-12-31") } },
      { periodTo: { $gte: from ? new Date(from) : new Date("1970-01-01") } },
    ];
  }
  if (status) filter.status = status;

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
  const items = await Settlement.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean();
  const total = await Settlement.countDocuments(filter);
  return res.json({ error: false, success: true, data: items, total });
}

/**
 * POST /api/settlements/create
 * Genera propuesta de liquidación (PENDING) para un periodo de una tienda
 * Requiere payment:reconcile
 */
export async function createSettlementProposalController(req, res, next) {
  try {
    const { storeId, periodFrom, periodTo, fxUSD_BOB, notes } = req.body;
    if (!storeId || !periodFrom || !periodTo) throw HttpError(400, "Faltan parámetros");

    const from = new Date(periodFrom);
    const to = new Date(periodTo);

    const pipeline = [
      {
        $match: {
          storeId,
          status: "CAPTURED",
          createdAt: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: null,
          grossUSD: { $sum: "$amountUSD" },
          refundsUSD: { $sum: { $ifNull: ["$refundUSD", 0] } },
          feesUSD: { $sum: { $ifNull: ["$feeUSD", 0] } },
          paymentsCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          grossUSD: 1,
          refundsUSD: 1,
          feesUSD: 1,
          netUSD: { $subtract: [{ $subtract: ["$grossUSD", "$refundsUSD"] }, "$feesUSD"] },
          paymentsCount: 1,
        },
      },
    ];

    const agg = await Payment.aggregate(pipeline);
    const raw = agg[0] || { grossUSD: 0, refundsUSD: 0, feesUSD: 0, netUSD: 0, paymentsCount: 0 };

    // Calcular comision de plataforma
    const store = await StoreModel.findById(storeId).select("config.commissionPct").lean();
    const commissionPct = store?.config?.commissionPct ?? 10;
    const calculatedFee = Math.round(raw.grossUSD * (commissionPct / 100) * 100) / 100;
    const feesUSD = calculatedFee || raw.feesUSD;
    const netUSD = Math.round((raw.grossUSD - raw.refundsUSD - feesUSD) * 100) / 100;

    const metrics = { ...raw, feesUSD, netUSD, commissionPct };

    const exists = await Settlement.findOne({ storeId, periodFrom: from, periodTo: to });
    if (exists) throw HttpError(409, "Ya existe una liquidación para este periodo y tienda");

    const fx = {
      base: "USD",
      USD_BOB: Number(fxUSD_BOB) || 0,
    };

    const doc = await Settlement.create({
      storeId,
      periodFrom: from,
      periodTo: to,
      amountUSD: netUSD,
      amountBOB: fx.USD_BOB ? Math.round(netUSD * fx.USD_BOB * 100) / 100 : 0,
      fxUsed: fx,
      metrics,
      status: "PENDING",
      createdBy: req.userId,
      notes: notes || "",
    });

    return res.status(201).json({ error: false, success: true, data: doc });
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /api/settlements/:id/pay
 * Sube comprobante y marca como PAID
 * Requiere payment:reconcile
 */
export async function paySettlementController(req, res, next) {
  let settlement = null;
  try {
    const { id } = req.params;
    const { notes } = req.body;

    settlement = await Settlement.findById(id);
    if (!settlement) throw HttpError(404, "Settlement no encontrado");
    if (settlement.status !== "PENDING") throw HttpError(400, "Solo PENDING puede ser pagado");

    // Subida opcional de comprobante
    let proofUrl = settlement.proofUrl;
    const file = req.file; // upload.single('proof')
    if (file?.path) {
      const up = await cloudinary.uploader.upload(file.path, { folder: "settlements" });
      proofUrl = up.secure_url;
    }

    settlement.status = "PAID";
    settlement.proofUrl = proofUrl;
    settlement.paidAt = new Date();
    settlement.paidBy = req.userId;
    if (notes) settlement.notes = notes;

    await settlement.save();

    // ✅ Audit éxito
    await safeAudit(req, {
      action: "SETTLEMENT_PAY",
      entity: "Settlement",
      entityId: String(settlement._id),
      meta: { amountUSD: settlement.amountUSD, proofUrl }
    });

    return res.json({ error: false, success: true, data: settlement });
  } catch (err) {
    // ❌ Audit error (no bloquear flujo del error original)
    await safeAudit(req, {
      action: "SETTLEMENT_PAY",
      entity: "Settlement",
      entityId: String(settlement?._id || req.params?.id || ""),
      status: "ERROR",
      meta: { message: err?.message }
    });

    return next(err);
  }
}

/**
 * GET /api/settlements/pending
 * Lista settlements PENDING agrupados por tienda (para finance manager)
 */
export async function getPendingSettlementsController(req, res, next) {
  try {
    const items = await Settlement.find({ status: "PENDING" })
      .populate("storeId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const byStore = {};
    for (const s of items) {
      const sid = String(s.storeId?._id || s.storeId);
      if (!byStore[sid]) {
        byStore[sid] = {
          storeId: sid,
          storeName: s.storeId?.name || "Sin nombre",
          storeEmail: s.storeId?.email || "",
          settlements: [],
          totalPendingUSD: 0,
          totalPendingBOB: 0,
        };
      }
      byStore[sid].settlements.push(s);
      byStore[sid].totalPendingUSD += s.amountUSD || 0;
      byStore[sid].totalPendingBOB += s.amountBOB || 0;
    }

    return res.json({ success: true, data: Object.values(byStore), totalPending: items.length });
  } catch (err) {
    return next(err);
  }
}

/**
 * Crear settlement automatico para una orden entregada.
 * Llamado internamente desde delivery controller.
 */
export async function createAutoSettlement({ storeId, orderId, amountUSD, amountBOB, bobPerUsd, createdBy }) {
  try {
    const store = await StoreModel.findById(storeId).select("config.commissionPct").lean();
    const commissionPct = store?.config?.commissionPct ?? 10;
    const feeUSD = Math.round(amountUSD * (commissionPct / 100) * 100) / 100;
    const netUSD = Math.round((amountUSD - feeUSD) * 100) / 100;
    const netBOB = bobPerUsd ? Math.round(netUSD * bobPerUsd * 100) / 100 : 0;

    const now = new Date();
    return await Settlement.create({
      storeId,
      periodFrom: now,
      periodTo: now,
      amountUSD: netUSD,
      amountBOB: netBOB,
      fxUsed: { base: "USD", USD_BOB: bobPerUsd || 0 },
      metrics: { grossUSD: amountUSD, refundsUSD: 0, feesUSD: feeUSD, netUSD, paymentsCount: 1, commissionPct },
      status: "PENDING",
      createdBy,
      notes: `Auto-settlement por entrega completada (orden ${orderId})`,
    });
  } catch (err) {
    console.warn("[createAutoSettlement] Error:", err?.message);
    return null;
  }
}
