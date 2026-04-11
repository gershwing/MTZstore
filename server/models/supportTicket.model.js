// server/models/supportTicket.model.js
import mongoose from "mongoose";

const SupportMessageSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["BUYER", "STORE", "SUPPORT"], required: true },
    body: { type: String, default: "" },
    attachments: [
      {
        url: String,          // URL del archivo subido (Cloud, local, etc.)
        name: String,         // Nombre original
        mimeType: String,     // image/png, application/pdf, etc.
        size: Number          // bytes
      }
    ],
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // usuarios que lo vieron
  },
  { timestamps: true }
);

const SupportTicketSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", index: true, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // creador

    subject: { type: String, required: true },
    category: { type: String, enum: ["ORDER", "PAYMENT", "DELIVERY", "PRODUCT", "OTHER"], default: "OTHER" },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "LOW" },

    status: { type: String, enum: ["OPEN", "PENDING", "RESOLVED", "CLOSED"], default: "OPEN", index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    messages: [SupportMessageSchema],
    lastMessageAt: { type: Date, index: true },
  },
  { timestamps: true }
);

SupportTicketSchema.index({ storeId: 1, status: 1, lastMessageAt: -1 });

export default mongoose.model("SupportTicket", SupportTicketSchema);
