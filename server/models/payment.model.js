// server/models/payment.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;

export const PAYMENT_PROVIDERS = ["PAYPAL", "CRYPTIX"];
export const PAYMENT_STATUS = [
  "CREATED", "APPROVED", "AUTHORIZED", "CAPTURED",
  "FAILED", "CANCELED", "REFUNDED", "PARTIALLY_REFUNDED"
];

const amtSchema = new Schema({
  currency: { type: String, enum: ["USD", "BOB"], required: true },
  value: { type: Number, required: true, min: 0 },
}, { _id: false });

const refundSchema = new Schema({
  amount: amtSchema,
  providerRefundId: { type: String, default: "" },
  reason: { type: String, default: "" },
  at: { type: Date, default: Date.now }
}, { _id: false });

const paymentSchema = new Schema({
  storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true, required: true },
  orderId: { type: Schema.Types.ObjectId, ref: "Order", index: true },

  provider: { type: String, enum: PAYMENT_PROVIDERS, required: true },
  providerPaymentId: { type: String, index: true },   // p.ej. PayPal orderId/captureId
  intentId: { type: String, default: "" },            // opcional (intent externo)

  status: { type: String, enum: PAYMENT_STATUS, default: "CREATED", index: true },

  amount: amtSchema,                // monto a cobrar (moneda del proveedor)
  capturedAmount: amtSchema,        // último monto capturado (opcional)
  payer: { type: Object, default: {} },   // snapshot payer

  // Seguridad / idempotencia
  idempotencyKey: { type: String, index: true, default: "" },

  // Datos crudos por auditoría
  providerData: { type: Schema.Types.Mixed, default: {} },

  refunds: [refundSchema],
}, { timestamps: true });

// Índices
paymentSchema.index({ storeId: 1, orderId: 1, provider: 1, providerPaymentId: 1 });
paymentSchema.index({ orderId: 1, createdAt: -1 });   // ➕ para listados por orden/recientes
paymentSchema.index({ storeId: 1, orderId: 1 });      // ➕ para filtros por tienda+orden

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
export default Payment;
