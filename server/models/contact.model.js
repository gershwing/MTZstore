import mongoose from "mongoose";
const { Schema, model } = mongoose;

const contactSchema = new Schema({
  nombre:   { type: String, required: true, trim: true },
  email:    { type: String, trim: true, lowercase: true, sparse: true },
  phone:    { type: String, default: "", trim: true },
  document: { type: String, default: "", trim: true },
  type:     { type: String, enum: ["INDIVIDUAL", "BUSINESS"], default: "INDIVIDUAL" },
  company:  { type: String, default: "", trim: true },
  address:  { type: String, default: "" },
  notes:    { type: String, default: "" },

  // Relación con User (si el contacto tiene cuenta)
  userId: { type: Schema.Types.ObjectId, ref: "User", default: null },

  // Stats de compras
  totalPurchases: { type: Number, default: 0 },
  totalSpent:     { type: Number, default: 0 },
  lastPurchase:   { type: Date, default: null },
}, { timestamps: true });

contactSchema.index({ nombre: "text", email: "text", document: "text", phone: "text" });
contactSchema.index({ userId: 1 }, { sparse: true });
contactSchema.index({ document: 1 }, { sparse: true });

export const Contact = model("Contact", contactSchema);
export default Contact;
