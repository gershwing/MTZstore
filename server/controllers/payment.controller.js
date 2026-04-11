// server/controllers/payment.controller.js
import Payment from "../models/payment.model.js";
import { ERR } from "../utils/httpError.js";
import { paypalCreateOrder, paypalCaptureOrder, paypalRefundCapture } from "../services/paypal.service.js";
import { reconcileOrderPayment } from "../services/orderPayment.service.js";
import { sealIdempotentSuccess, sealIdempotentError } from "../middlewares/idempotency.js";
import { auditLog } from "../services/audit.service.js";

// Evita que un fallo de auditoría rompa el request
async function safeAudit(req, payload) {
  try {
    await auditLog(req, payload);
  } catch (e) {
    // No interrumpir el flujo principal por un fallo de logging
    // eslint-disable-next-line no-console
    console.warn("auditLog failed:", e?.message || e);
  }
}

/**
 * POST /api/payment/paypal/create
 * Body: { orderId?, amount:{currency,value}, idempotencyKey?, returnUrl?, cancelUrl? }
 */
export async function createPaypalPaymentController(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION("Falta storeId (tenant).");

    const { orderId = null, amount, idempotencyKey = "", returnUrl = "", cancelUrl = "" } = req.body || {};
    if (!amount?.currency || !Number.isFinite(amount?.value) || amount.value <= 0) {
      throw ERR.VALIDATION("amount { currency, value>0 } es requerido.");
    }

    // Idempotencia simple por idempotencyKey (compatibilidad hacia atrás)
    if (idempotencyKey) {
      const existing = await Payment.findOne({ storeId, idempotencyKey, provider: "PAYPAL" });
      if (existing) {
        const payload = { payment: existing, reused: true };
        await sealIdempotentSuccess(req, payload);

        // Audit (reutilización)
        await safeAudit(req, {
          action: "PAYMENT_CREATE",
          entity: "Payment",
          entityId: String(existing._id),
          meta: { provider: "PAYPAL", amount, providerPaymentId: existing.providerPaymentId, reused: true }
        });

        return res.ok(payload);
      }
    }

    const out = await paypalCreateOrder({
      amount: amount.value, currency: amount.currency, referenceId: String(orderId || ""),
      returnUrl, cancelUrl
    });

    const payment = await Payment.create({
      storeId,
      orderId,
      provider: "PAYPAL",
      providerPaymentId: out.providerPaymentId,
      status: "CREATED",
      idempotencyKey,
      amount,
      providerData: out.raw,
    });

    const payload = { payment, approveLink: out.approveLink };
    await sealIdempotentSuccess(req, payload);

    // Audit éxito
    await safeAudit(req, {
      action: "PAYMENT_CREATE",
      entity: "Payment",
      entityId: String(payment._id),
      meta: { provider: "PAYPAL", amount, providerPaymentId: payment.providerPaymentId }
    });

    return res.created(payload);
  } catch (error) {
    await sealIdempotentError(req, error);

    // Audit error
    await safeAudit(req, {
      action: "PAYMENT_CREATE",
      entity: "Payment",
      entityId: String(req.body?.providerPaymentId || ""),
      status: "ERROR",
      meta: { message: error?.message }
    });

    return next(error);
  }
}

/**
 * POST /api/payment/paypal/capture
 * Body: { providerPaymentId }
 */
export async function capturePaypalPaymentController(req, res, next) {
  let payment = null;
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION("Falta storeId (tenant).");
    const { providerPaymentId } = req.body || {};
    if (!providerPaymentId) throw ERR.VALIDATION("providerPaymentId es requerido.");

    payment = await Payment.findOne({ storeId, provider: "PAYPAL", providerPaymentId });
    if (!payment) throw ERR.NOT_FOUND("Pago no encontrado.");

    const result = await paypalCaptureOrder({ providerPaymentId });
    if (result.status !== "COMPLETED") throw ERR.CONFLICT("La captura no fue completada.");

    payment.status = "CAPTURED";
    payment.capturedAmount = { currency: result.amount.currency, value: Number(result.amount.value) };
    payment.payer = result.payer || {};
    payment.providerData = { ...(payment.providerData || {}), capture: result.raw };
    await payment.save();

    await reconcileOrderPayment({ storeId, orderId: payment.orderId, paymentStatus: "CAPTURED" });

    const payload = { message: "Pago capturado", payment };
    await sealIdempotentSuccess(req, payload);

    // Audit éxito
    await safeAudit(req, {
      action: "PAYMENT_CAPTURE",
      entity: "Payment",
      entityId: String(payment._id),
      meta: { amount: payment.capturedAmount }
    });

    return res.ok(payload);
  } catch (error) {
    await sealIdempotentError(req, error);

    // Audit error
    await safeAudit(req, {
      action: "PAYMENT_CAPTURE",
      entity: "Payment",
      entityId: String(payment?._id || req.body?.providerPaymentId || ""),
      status: "ERROR",
      meta: { message: error?.message }
    });

    return next(error);
  }
}

/**
 * POST /api/payment/refund
 * Body: { paymentId, amount? }  // si no amount => refund total
 */
export async function refundPaymentController(req, res, next) {
  let payment = null;
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION("Falta storeId (tenant).");
    const { paymentId, amount } = req.body || {};
    if (!paymentId) throw ERR.VALIDATION("paymentId es requerido.");

    payment = await Payment.findOne({ _id: paymentId, storeId });
    if (!payment) throw ERR.NOT_FOUND("Pago no encontrado.");

    if (payment.provider === "PAYPAL") {
      const captureId = payment?.providerData?.capture?.id || payment.providerPaymentId;
      const out = await paypalRefundCapture({
        captureId,
        amount: amount || payment.capturedAmount || payment.amount
      });

      payment.refunds.push({
        amount: out.amount,
        providerRefundId: out.refundId,
        reason: "manual",
        at: new Date()
      });

      // Estado
      const totalRefunded = payment.refunds.reduce((s, r) => s + Number(r.amount.value || 0), 0);
      const captured = Number(payment.capturedAmount?.value || payment.amount?.value || 0);
      payment.status = totalRefunded >= captured ? "REFUNDED" : "PARTIALLY_REFUNDED";

      payment.providerData = { ...(payment.providerData || {}), refund: out.raw };
      await payment.save();

      await reconcileOrderPayment({
        storeId,
        orderId: payment.orderId,
        paymentStatus: payment.status
      });

      const payload = { message: "Reembolso procesado", payment };
      await sealIdempotentSuccess(req, payload);

      // Audit éxito
      await safeAudit(req, {
        action: "PAYMENT_REFUND",
        entity: "Payment",
        entityId: String(payment._id),
        meta: { amount: amount || payment.capturedAmount }
      });

      return res.ok(payload);
    }

    throw ERR.NOT_IMPLEMENTED("Proveedor no soportado aún para reembolsos.");
  } catch (error) {
    await sealIdempotentError(req, error);

    // Audit error
    await safeAudit(req, {
      action: "PAYMENT_REFUND",
      entity: "Payment",
      entityId: String(payment?._id || req.body?.paymentId || ""),
      status: "ERROR",
      meta: { message: error?.message }
    });

    return next(error);
  }
}

/** GET /api/payment/:id */
export async function getPaymentController(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION("Falta storeId (tenant).");
    const { id } = req.params;
    const doc = await Payment.findOne({ _id: id, storeId });
    if (!doc) throw ERR.NOT_FOUND("Pago no encontrado.");
    return res.ok(doc);
  } catch (error) {
    return next(error);
  }
}

/** GET /api/payment?page&limit&status */
export async function listPaymentsController(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION("Falta storeId (tenant).");
    const { status, page = 1, limit = 20 } = req.query;
    const p = Math.max(1, parseInt(page)); const l = Math.min(100, Math.max(1, parseInt(limit)));
    const filter = { storeId };
    if (status) filter.status = status;

    const [rows, total] = await Promise.all([
      Payment.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l),
      Payment.countDocuments(filter),
    ]);
    return res.ok({ total, page: p, limit: l, rows });
  } catch (error) {
    return next(error);
  }
}
