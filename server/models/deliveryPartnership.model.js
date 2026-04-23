// server/models/deliveryPartnership.model.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const DeliveryPartnershipSchema = new Schema(
  {
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    // Tipo de servicio de la sociedad
    serviceType: {
      type: String,
      enum: ["express", "standard"],
      required: true,
    },

    // Estado de la sociedad
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"],
      default: "PENDING",
      index: true,
    },

    // Quién inició la solicitud
    requestedBy: {
      type: String,
      enum: ["agent", "store"],
      required: true,
    },
    requestedAt: { type: Date, default: Date.now },

    // Respuesta
    respondedAt: { type: Date },
    respondedBy: { type: Schema.Types.ObjectId, ref: "User" },

    // Suspensión
    suspendedAt: { type: Date },
    suspendedBy: { type: Schema.Types.ObjectId, ref: "User" },
    suspensionReason: { type: String },

    // Rechazo
    rejectionReason: { type: String },

    // Notas generales
    notes: { type: String },

    // Estadísticas específicas de esta sociedad
    stats: {
      deliveriesCompleted: { type: Number, default: 0 },
      deliveriesFailed: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 },
      lastDeliveryAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Un agente no puede tener dos partnerships del mismo tipo con la misma tienda
DeliveryPartnershipSchema.index(
  { agentId: 1, storeId: 1, serviceType: 1 },
  { unique: true, name: "uniq_agent_store_service" }
);

// Query: "mis socios activos" por tienda
DeliveryPartnershipSchema.index(
  { storeId: 1, status: 1, serviceType: 1 },
  { name: "idx_store_partnerships" }
);

const DeliveryPartnership =
  mongoose.models.DeliveryPartnership ||
  mongoose.model("DeliveryPartnership", DeliveryPartnershipSchema);

export default DeliveryPartnership;
