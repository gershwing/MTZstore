// server/services/paypal.service.js
/**
 * Integra aquí el SDK oficial o tus fetchs a la API de PayPal.
 * Estas funciones devuelven solo lo necesario para los controladores.
 */

export async function paypalCreateOrder({ amount, currency, referenceId, returnUrl, cancelUrl }) {
  // TODO: llamar a PayPal
  return {
    providerPaymentId: "PAYPAL_ORDER_ID_EXAMPLE",
    approveLink: "https://www.paypal.com/checkoutnow?token=PAYPAL_ORDER_ID_EXAMPLE",
    raw: { /* respuesta cruda */ },
  };
}

export async function paypalCaptureOrder({ providerPaymentId }) {
  // TODO: capturar en PayPal
  return {
    captureId: "PAYPAL_CAPTURE_ID_EXAMPLE",
    status: "COMPLETED",
    payer: { email: "buyer@example.com" },
    amount: { currency: "USD", value: 10 },
    raw: { /* respuesta cruda */ },
  };
}

export async function paypalRefundCapture({ captureId, amount }) {
  // TODO: refund en PayPal
  return {
    refundId: "PAYPAL_REFUND_ID_EXAMPLE",
    status: "COMPLETED",
    amount,
    raw: {},
  };
}

/** Verificación de firma de webhook (usa SDK oficial en prod) */
export async function verifyPaypalWebhookSignature(/* headers, body */) {
  // TODO: integrar verificación real; por ahora retornar true para no bloquear desarrollo
  return true;
}
