// server/models/idempotencyKey.model.js
import mongoose from "mongoose";

const IdempotencyKeySchema = new mongoose.Schema({
  key: { type: String, required: true, index: true },       // header Idempotency-Key
  op: { type: String, required: true, index: true },         // p.ej. 'payment:create'
  tenant: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  payloadHash: { type: String, required: true },
  status: { type: String, enum: ["PENDING", "COMPLETED", "FAILED"], default: "PENDING", index: true },
  response: { type: Object },
  error: { type: Object },
  createdAt: { type: Date, default: Date.now }               // ← quitamos index:true aquí
}, { timestamps: true });

// TTL (48h por defecto)
IdempotencyKeySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: Number(process.env.IDEMPOTENCY_TTL_SECONDS || 172800) }
);

// (opcional pero recomendado) evita duplicados exactos de key+op
IdempotencyKeySchema.index({ key: 1, op: 1, payloadHash: 1 }, { unique: true });

export default mongoose.model("IdempotencyKey", IdempotencyKeySchema);
