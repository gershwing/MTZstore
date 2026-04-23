import mongoose from "mongoose";

const DeliveryEventSchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["CREATED", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "FAILED", "DELIVERED", "CANCELLED", "DISPATCHED_TO_WAREHOUSE", "RECEIVED_AT_WAREHOUSE"],
      required: true
    },
    note: { type: String, default: "" }
  },
  { _id: false }
);

const ProofSchema = new mongoose.Schema(
  {
    url: String,       // URL pública (Cloudinary secure_url)
    publicId: String,  // Cloudinary public_id (para eliminar)
    name: String,
    mimeType: String,
    size: Number
  },
  { _id: false }
);

const DeliveryTaskSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", default: null, index: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // repartidor
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryRoute", default: null, index: true },
    shippingMethod: {
      type: String,
      enum: ["MTZSTORE_EXPRESS", "MTZSTORE_STANDARD", "STORE_EXPRESS", "STORE_STANDARD", "STORE"],
      default: "MTZSTORE_EXPRESS",
      index: true
    },
    status: {
      type: String,
      enum: ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "FAILED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
      index: true
    },
    address: {
      name: String, phone: String,
      line1: String, line2: String, city: String, state: String, zip: String, country: String,
      notes: String,
      geo: { lat: Number, lng: Number }
    },
    timeline: [DeliveryEventSchema],
    proofs: [ProofSchema],   // fotos/archivos de prueba
  },
  { timestamps: true }
);

DeliveryTaskSchema.index({ storeId: 1, status: 1, updatedAt: -1 });

export default mongoose.model("DeliveryTask", DeliveryTaskSchema);
