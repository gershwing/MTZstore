// server/models/deliveryAgentProfile.model.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const TrustLevelEntrySchema = new Schema(
  {
    level: { type: String, enum: ["BASIC", "VERIFIED", "TRUSTED"], required: true },
    promotedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    promotedAt: { type: Date, default: Date.now, required: true },
    reason: { type: String, default: "" },
  },
  { _id: false }
);

const VehicleExpressSchema = new Schema(
  {
    vehicleType: { type: String, enum: ["Moto", "Bicicleta", "Otro"] },
    licensePlate: { type: String, trim: true },
    licensePhotoUrl: { type: String },
  },
  { _id: false }
);

const VehicleStandardSchema = new Schema(
  {
    vehicleType: { type: String, enum: ["Auto", "Camioneta", "Van", "Otro"] },
    licensePlate: { type: String, trim: true },
    licensePhotoUrl: { type: String },
    cargoCapacityKg: { type: Number, min: 0 },
  },
  { _id: false }
);

const DeliveryAgentProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Tipos de servicio aprobados
    approvedServiceTypes: {
      type: [String],
      enum: ["express", "standard"],
      default: [],
    },

    // Nivel de confianza en la plataforma
    platformTrustLevel: {
      type: String,
      enum: ["BASIC", "VERIFIED", "TRUSTED"],
      default: "BASIC",
      index: true,
    },

    // Historial de cambios de nivel
    trustLevelHistory: { type: [TrustLevelEntrySchema], default: [] },

    // Vehículos por tipo de servicio
    vehicles: {
      express: { type: VehicleExpressSchema, default: null },
      standard: { type: VehicleStandardSchema, default: null },
    },

    // Estado operativo del agente
    status: {
      type: String,
      enum: ["ACTIVE", "PAUSED", "SUSPENDED"],
      default: "ACTIVE",
      index: true,
    },

    // Ubicación actual (para matching futuro)
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
      updatedAt: { type: Date },
    },

    // Estadísticas acumuladas
    stats: {
      totalDeliveries: { type: Number, default: 0 },
      totalExpress: { type: Number, default: 0 },
      totalStandard: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 },
      onTimeRate: { type: Number, default: 0 },
      incidentCount: { type: Number, default: 0 },
      lastDeliveryAt: { type: Date },
    },

    // Solicitud de verificación presencial
    verificationRequest: {
      status: {
        type: String,
        enum: ["NONE", "REQUESTED", "COMPLETED", "REJECTED"],
        default: "NONE",
      },
      requestedAt: { type: Date },
      reviewedAt: { type: Date },
      reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
      rejectionReason: { type: String },
      notes: { type: String, default: "" },
    },

    // Fecha de reverificación de identidad (para promoción a VERIFIED)
    identityReverifiedAt: { type: Date },
  },
  { timestamps: true }
);

// Índices compuestos para queries de elegibilidad
DeliveryAgentProfileSchema.index({ platformTrustLevel: 1, status: 1 });
DeliveryAgentProfileSchema.index({ approvedServiceTypes: 1, status: 1 });

const DeliveryAgentProfile =
  mongoose.models.DeliveryAgentProfile ||
  mongoose.model("DeliveryAgentProfile", DeliveryAgentProfileSchema);

export default DeliveryAgentProfile;
