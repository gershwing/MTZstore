import mongoose from "mongoose";
const { Schema, model } = mongoose;

const salePaymentSchema = new Schema({
  directSaleId: { type: Schema.Types.ObjectId, ref: "DirectSale", required: true },
  contactId:    { type: Schema.Types.ObjectId, ref: "Contact", default: null },
  storeId:      { type: Schema.Types.ObjectId, ref: "Store", default: null },
  amount:       { type: Number, required: true, min: 0.01 },
  paymentMethod:{ type: String, enum: ["CASH", "TRANSFER", "QR", "MIXED", "OTHER"], default: "CASH" },
  note:         { type: String, default: "" },
  createdBy:    { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdByName:{ type: String, default: "" },
}, { timestamps: true });

salePaymentSchema.index({ directSaleId: 1, createdAt: -1 });
salePaymentSchema.index({ contactId: 1 });
salePaymentSchema.index({ storeId: 1, createdAt: -1 });

export const SalePayment = model("SalePayment", salePaymentSchema);
export default SalePayment;
