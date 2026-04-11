// server/models/webhookEvent.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const webhookEventSchema = new Schema({
  storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true },
  provider: { type: String, required: true },     // "PAYPAL" | "CRYPTIX" | ...
  eventId: { type: String, required: true, index: true }, // id único del proveedor si existe
  payloadHash: { type: String, required: true, index: true }, // hash del body para idempotencia extra
  eventType: { type: String, default: "" },
  processedAt: { type: Date },
  attempts: { type: Number, default: 0 },
  lastError: { type: String, default: "" },
}, { timestamps: true });

webhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true, sparse: true });

const WebhookEvent = mongoose.models.WebhookEvent || mongoose.model("WebhookEvent", webhookEventSchema);
export default WebhookEvent;
