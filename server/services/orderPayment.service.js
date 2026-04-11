// server/services/orderPayment.service.js
import Order from "../models/order.model.js";

/**
 * Reconciliación mínima: ajusta estado de la orden cuando cambia el pago.
 * Ajusta según tus estados reales (order_status).
 */
export async function reconcileOrderPayment({ storeId, orderId, paymentStatus }) {
  if (!orderId) return; // pagos sueltos
  const order = await Order.findOne({ _id: orderId, ...(storeId ? { $or: [{ storeId }, { "products.storeId": storeId }] } : {}) });
  if (!order) return;

  // Mapea estados de pago a estados de orden (ajústalo a tu flujo)
  const map = {
    CAPTURED: "PAID",
    PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
    REFUNDED: "REFUNDED",
    FAILED: "PAYMENT_FAILED",
    CANCELED: "CANCELED",
  };
  const next = map[paymentStatus];
  if (!next) return;

  // Evita regresión de estados importantes
  if (order.order_status !== next) {
    order.order_status = next;
    await order.save();
  }
}
