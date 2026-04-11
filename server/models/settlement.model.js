// server/models/settlement.model.js
import mongoose from "mongoose";

const SettlementSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", index: true, required: true },
    // Periodo liquidado (ej. mes)
    periodFrom: { type: Date, required: true },
    periodTo: { type: Date, required: true },

    // Montos propuestos a pagar a la tienda (post-fees & refunds)
    amountUSD: { type: Number, required: true, default: 0 },
    amountBOB: { type: Number, required: true, default: 0 },

    // FX de referencia usado para convertir (promedio ponderado o snapshot)
    fxUsed: {
      base: { type: String, default: "USD" }, // base currency
      USD_BOB: { type: Number, default: 0 },  // cuántos BOB por 1 USD
    },

    // Resumen de cálculo
    metrics: {
      grossUSD: { type: Number, default: 0 }, // ventas capturadas
      refundsUSD: { type: Number, default: 0 },
      feesUSD: { type: Number, default: 0 },
      netUSD: { type: Number, default: 0 }, // gross - refunds - fees
      paymentsCount: { type: Number, default: 0 },
    },

    status: { type: String, enum: ["PENDING", "PAID", "CANCELLED"], default: "PENDING", index: true },

    // Comprobante / soporte del pago a tienda
    proofUrl: { type: String, default: "" },
    notes: { type: String, default: "" },

    // Trazabilidad
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

SettlementSchema.index({ storeId: 1, periodFrom: 1, periodTo: 1 }, { unique: true });

export default mongoose.model("Settlement", SettlementSchema);
