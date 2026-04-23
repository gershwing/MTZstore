// server/models/deliveryApplication.model.js
import mongoose from "mongoose";

const { Schema } = mongoose;

// Vehículos considerados motorizados (requieren placa y licencia)
const MOTORIZED = ["Moto", "Auto", "Camioneta"];

/** Subdocumento de historial */
const ReviewEntrySchema = new Schema(
  {
    action: {
      type: String,
      enum: ["SUBMITTED", "APPROVED", "REJECTED"],
      required: true,
      index: true,
    },
    by: { type: Schema.Types.ObjectId, ref: "User", required: true }, // actor
    at: { type: Date, default: Date.now, required: true },
    reason: { type: String }, // solo útil en REJECTED
  },
  { _id: false }
);

/** Subdocumento de revisión por tipo de servicio */
const TypeReviewSchema = new Schema(
  {
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    notes: { type: String },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
  },
  { _id: false }
);

const DeliveryApplicationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // 👈 sin index aquí

    // Datos básicos
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true }, // e.g. "+591 7xxxxxx"
    vehicleType: {
      type: String,
      enum: ["Moto", "Auto", "Camioneta", "Bicicleta", "Otro"],
      default: "Moto",
      required: true,
      index: true,
    },
    city: { type: String, required: true, trim: true }, // capital / zona
    documentNumber: { type: String, required: true, trim: true },

    // Vehículo legacy (placa requerida si es motorizado)
    plateNumber: {
      type: String,
      trim: true,
      set: (v) => String(v || "").trim().toUpperCase(),
    },

    // Archivos (URLs ya subidas vía UploadBox)
    idFrontUrl: { type: String, required: true },
    idBackUrl: { type: String, required: true },
    selfieUrl: { type: String, required: true }, // foto con CI en mano
    licenseUrl: { type: String }, // requerido si es motorizado

    // ─── Delivery V2: tipos de servicio ───
    serviceTypesRequested: {
      type: [String],
      enum: ["express", "standard"],
      default: ["express"],
    },
    approvedServiceTypes: {
      type: [String],
      enum: ["express", "standard"],
      default: [],
    },

    // Vehículo Express (condicional: si postula a express)
    vehicleExpress: {
      vehicleType: { type: String, enum: ["Moto", "Bicicleta", "Otro"] },
      licensePlate: { type: String, trim: true },
      licensePhotoUrl: { type: String },
    },

    // Vehículo Estándar (condicional: si postula a standard)
    vehicleStandard: {
      vehicleType: { type: String, enum: ["Auto", "Camioneta", "Van", "Otro"] },
      licensePlate: { type: String, trim: true },
      licensePhotoUrl: { type: String },
      cargoCapacityKg: { type: Number, min: 0 },
    },

    // Revisión granular por tipo
    reviewNotesByType: {
      express: { type: TypeReviewSchema, default: undefined },
      standard: { type: TypeReviewSchema, default: undefined },
    },
    // ─── Fin Delivery V2 ───

    // Estado de revisión (global: APPROVED si al menos un tipo aprobado)
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    reason: { type: String }, // motivo de rechazo
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" }, // admin que aprobó/rechazó

    // Historial de acciones
    reviews: { type: [ReviewEntrySchema], default: [] },

    // Soft-delete
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// 1 usuario -> 1 postulación (en cualquier estado)
DeliveryApplicationSchema.index({ userId: 1 }, { unique: true });

/* ========= Validaciones condicionales ========= */
// licenseUrl requerido si es motorizado
DeliveryApplicationSchema.path("licenseUrl").validate(function (v) {
  if (MOTORIZED.includes(this.vehicleType)) {
    return Boolean(v && String(v).trim().length > 0);
  }
  return true;
}, "licenseUrl es requerido para vehículos motorizados (Moto/Auto/Camioneta).");

// plateNumber requerido si es motorizado
DeliveryApplicationSchema.path("plateNumber").validate(function (v) {
  if (MOTORIZED.includes(this.vehicleType)) {
    return Boolean(v && String(v).trim().length > 0);
  }
  return true;
}, "plateNumber es requerido para vehículos motorizados (Moto/Auto/Camioneta).");

export default mongoose.model("DeliveryApplication", DeliveryApplicationSchema);
