import mongoose from "mongoose";
const { Schema, model } = mongoose;

const directSaleItemSchema = new Schema({
  productId:    { type: Schema.Types.ObjectId, ref: "Product", required: true },
  variantId:    { type: Schema.Types.ObjectId, ref: "ProductVariant", default: null },
  nameSnapshot: { type: String, default: "" },
  brand:        { type: String, default: "" },
  imageSnapshot:{ type: String, default: "" },
  sku:          { type: String, default: "" },
  qty:          { type: Number, required: true, min: 1 },
  pricingMode:  { type: String, enum: ["RETAIL", "WHOLESALE", "MANUAL"], default: "RETAIL" },
  unitPrice:    { type: Number, required: true, min: 0 },
  subtotal:     { type: Number, default: 0 },
  costSnapshot: { type: Number, default: 0 },
  estimatedProfit: { type: Number, default: 0 },
}, { _id: false });

const customerSchema = new Schema({
  name:     { type: String, required: true, trim: true },
  phone:    { type: String, default: "", trim: true },
  document: { type: String, default: "", trim: true },
  email:    { type: String, default: "", trim: true },
}, { _id: false });

const paymentBreakdownSchema = new Schema({
  method: { type: String, enum: ["CASH", "TRANSFER", "QR", "OTHER"], required: true },
  amount: { type: Number, required: true, min: 0 },
  note:   { type: String, default: "" },
}, { _id: false });

const directSaleSchema = new Schema({
  saleNumber:   { type: String, required: true },
  type:         { type: String, default: "DIRECT_SALE" },
  saleMode:     { type: String, enum: ["RETAIL", "WHOLESALE"], default: "RETAIL" },
  items:        [directSaleItemSchema],
  customer:     { type: customerSchema },
  contactId:    { type: Schema.Types.ObjectId, ref: "Contact", default: null },
  userId:       { type: Schema.Types.ObjectId, ref: "User", default: null },

  subtotal:             { type: Number, default: 0 },
  ivaEnabled:           { type: Boolean, default: true },
  ivaPct:               { type: Number, default: 13 },
  ivaAmount:            { type: Number, default: 0 },
  itEnabled:            { type: Boolean, default: true },
  itPct:                { type: Number, default: 3 },
  itAmount:             { type: Number, default: 0 },
  total:                { type: Number, default: 0 },
  currency:             { type: String, enum: ["USD", "BOB"], default: "USD" },
  totalCostUsd:         { type: Number, default: 0 },
  totalEstimatedProfit: { type: Number, default: 0 },
  marginPct:            { type: Number, default: 0 },

  paymentMethod: { type: String, enum: ["CASH", "TRANSFER", "QR", "MIXED", "OTHER"], default: "CASH" },
  paymentBreakdown: [paymentBreakdownSchema],
  paymentNotes:  { type: String, default: "" },
  notes:         { type: String, default: "" },

  // --- Crédito / Deudas ---
  paymentStatus: { type: String, enum: ["PAID", "PARTIAL", "CREDIT"], default: "PAID" },
  amountPaid:    { type: Number, default: 0 },
  amountDue:     { type: Number, default: 0 },
  creditNote:    { type: String, default: "" },

  createdBy:     { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdByName: { type: String, default: "" },
  storeId:       { type: Schema.Types.ObjectId, ref: "Store", index: true },
}, { timestamps: true });

directSaleSchema.index({ saleNumber: 1 }, { unique: true });
directSaleSchema.index({ storeId: 1, createdAt: -1 });
directSaleSchema.index({ createdBy: 1, createdAt: -1 });
directSaleSchema.index({ paymentStatus: 1, storeId: 1 });

export const DirectSale = model("DirectSale", directSaleSchema);
export default DirectSale;
