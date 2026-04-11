// server/controllers/webhook.controller.js
import Payment from "../models/payment.model.js";
import WebhookEvent from "../models/webhookEvent.model.js";
import { ERR } from "../utils/httpError.js";
import { hashPayload } from "../utils/idempotency.js";
import { verifyPaypalWebhookSignature } from "../services/paypal.service.js";
import { reconcileOrderPayment } from "../services/orderPayment.service.js";

/**
 * POST /api/webhook/paypal/:storeId
 * No requiere auth; PayPal firmará el webhook.
 */
export async function paypalWebhookController(req, res, next) {
  try {
    const storeId = req.params.storeId; // lo pasas en la URL del webhook por tienda
    if (!storeId) throw ERR.VALIDATION("storeId es requerido en la URL.");

    const body = req.body || {};
    const ok = await verifyPaypalWebhookSignature(/* req.headers, body */);
    if (!ok) throw ERR.UNAUTHORIZED("Firma de PayPal inválida.");

    const eventId = String(body.id || "");
    const payloadHash = hashPayload(body);

    // Idempotencia
    const existed = await WebhookEvent.findOne({ provider: "PAYPAL", eventId });
    if (existed?.processedAt) return res.ok({ idempotent: true });

    const evt = existed || await WebhookEvent.create({
      storeId, provider: "PAYPAL", eventId, payloadHash, eventType: String(body.event_type || "")
    });
    evt.attempts += 1;

    const type = String(body.event_type || "");
    // Manejadores básicos: ajusta a los tipos que habilites en PayPal
    if (type === "PAYMENT.CAPTURE.COMPLETED") {
      const capture = body?.resource || {};
      const providerPaymentId = String(capture?.supplementary_data?.related_ids?.order_id || capture?.id || "");
      const amount = {
        currency: String(capture?.amount?.currency_code || "USD"),
        value: Number(capture?.amount?.value || 0)
      };

      let payment = await Payment.findOne({ storeId, provider: "PAYPAL", providerPaymentId });
      if (!payment) {
        // crea si no existe (por si la captura llegó antes de tu persistencia)
        payment = await Payment.create({
          storeId,
          provider: "PAYPAL",
          providerPaymentId,
          status: "CAPTURED",
          amount,
          capturedAmount: amount,
          payer: capture?.payer || {},
          providerData: { webhook: body }
        });
      } else {
        payment.status = "CAPTURED";
        payment.capturedAmount = amount;
        payment.payer = capture?.payer || payment.payer;
        payment.providerData = { ...(payment.providerData || {}), webhook: body };
        await payment.save();
      }

      await reconcileOrderPayment({ storeId, orderId: payment.orderId, paymentStatus: "CAPTURED" });
    }

    if (type === "PAYMENT.CAPTURE.REFUNDED") {
      const refund = body?.resource || {};
      const providerPaymentId = String(refund?.supplementary_data?.related_ids?.order_id || refund?.id || "");
      const amount = {
        currency: String(refund?.amount?.currency_code || "USD"),
        value: Number(refund?.amount?.value || 0)
      };

      const payment = await Payment.findOne({ storeId, provider: "PAYPAL", providerPaymentId });
      if (payment) {
        payment.refunds.push({ amount, providerRefundId: String(refund?.id || ""), at: new Date() });
        const totalRefunded = payment.refunds.reduce((s, r) => s + Number(r.amount.value || 0), 0);
        const captured = Number(payment.capturedAmount?.value || payment.amount?.value || 0);
        payment.status = totalRefunded >= captured ? "REFUNDED" : "PARTIALLY_REFUNDED";
        payment.providerData = { ...(payment.providerData || {}), webhookRefund: body };
        await payment.save();

        await reconcileOrderPayment({ storeId, orderId: payment.orderId, paymentStatus: payment.status });
      }
    }

    evt.processedAt = new Date();
    await evt.save();

    return res.ok({ processed: true, eventId });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/webhook/cryptix/:storeId
 * Valida HMAC compartido en header (ej. X-Signature) y procesa estados equivalentes.
 */
export async function cryptixWebhookController(req, res, next) {
  try {
    const storeId = req.params.storeId;
    if (!storeId) throw ERR.VALIDATION("storeId es requerido en la URL.");

    const body = req.body || {};
    // TODO: verificar HMAC con tu secret de Cryptix (req.headers['x-signature'])
    // if (!isValid) throw ERR.UNAUTHORIZED("Firma Cryptix inválida.");

    const eventId = String(body.eventId || body.id || "");
    const payloadHash = hashPayload(body);

    const existed = await WebhookEvent.findOne({ provider: "CRYPTIX", eventId });
    if (existed?.processedAt) return res.ok({ idempotent: true });

    const evt = existed || await WebhookEvent.create({
      storeId, provider: "CRYPTIX", eventId, payloadHash, eventType: String(body.type || "")
    });
    evt.attempts += 1;

    // Traduce tus estados: COMPLETED / FAILED / REFUNDED, etc.
    const status = String(body.status || "").toUpperCase(); // ej. COMPLETED
    const providerPaymentId = String(body.paymentId || "");
    const amount = { currency: String(body.currency || "USD"), value: Number(body.amount || 0) };

    let payment = await Payment.findOne({ storeId, provider: "CRYPTIX", providerPaymentId });
    if (!payment) {
      payment = await Payment.create({
        storeId, provider: "CRYPTIX", providerPaymentId, amount, status: "CREATED", providerData: { webhook: body }
      });
    }

    if (status === "COMPLETED") {
      payment.status = "CAPTURED";
      payment.capturedAmount = amount;
      await payment.save();
      await reconcileOrderPayment({ storeId, orderId: payment.orderId, paymentStatus: "CAPTURED" });
    } else if (status === "FAILED") {
      payment.status = "FAILED";
      await payment.save();
    } else if (status === "REFUNDED") {
      payment.status = "REFUNDED";
      payment.refunds.push({ amount, providerRefundId: String(body.refundId || "") });
      await payment.save();
      await reconcileOrderPayment({ storeId, orderId: payment.orderId, paymentStatus: "REFUNDED" });
    }

    evt.processedAt = new Date();
    await evt.save();

    return res.ok({ processed: true, eventId });
  } catch (error) {
    return next(error);
  }
}
