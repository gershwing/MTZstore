// server/models/sellerApplication.model.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const SellerApplicationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // === Datos de la tienda / negocio ===
    storeName: { type: String, required: true, trim: true },
    businessName: { type: String, required: true, trim: true },
    description: { type: String, required: true, default: "", trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },

    // Datos de contacto opcionales
    phone: { type: String, default: "" },
    country: { type: String, default: "" },
    city: { type: String, default: "" },

    // Documento del solicitante
    documentNumber: { type: String, required: true, trim: true },

    // Notas / motivo rechazo
    notes: { type: String, default: "" },

    // Datos extra del formulario
    formData: { type: Object, default: {} },

    // Documentos CI (requeridos)
    idFrontUrl: { type: String, required: true, trim: true },
    idBackUrl: { type: String, required: true, trim: true },

    // Selfie opcional
    selfieUrl: { type: String, default: "", trim: true },

    // Compat: estructura anidada
    documents: {
      frontUrl: { type: String, trim: true },
      backUrl: { type: String, trim: true },
      selfieUrl: { type: String, trim: true },
    },

    // Estado normalizado
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      set: (v) => {
        const raw = String(v || "").trim();
        const up = raw.toUpperCase();
        if (["PENDING", "APPROVED", "REJECTED"].includes(up)) return up;
        const lo = raw.toLowerCase();
        if (["pending", "approved", "rejected"].includes(lo)) return lo.toUpperCase();
        return "PENDING";
      },
    },

    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },

    // Si al aprobar creas tienda, enlázala
    storeId: { type: Schema.Types.ObjectId, ref: "Store", default: null },

    // --- NUEVO: re-aplicaciones ---
    reapplyCount: { type: Number, default: 0 },
    lastReappliedAt: { type: Date, default: null },

    // Borrado lógico (NO uses default:null para índice parcial)
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// ───────────── Compat: sincroniza "documents" y campos planos ─────────────
SellerApplicationSchema.pre("validate", function syncDocuments(next) {
  this.documents = this.documents || {};
  if (this.idFrontUrl) this.documents.frontUrl = this.idFrontUrl;
  if (this.idBackUrl) this.documents.backUrl = this.idBackUrl;
  if (this.selfieUrl) this.documents.selfieUrl = this.selfieUrl;

  if (!this.idFrontUrl && this.documents.frontUrl) this.idFrontUrl = this.documents.frontUrl;
  if (!this.idBackUrl && this.documents.backUrl) this.idBackUrl = this.documents.backUrl;
  if (!this.selfieUrl && this.documents.selfieUrl) this.selfieUrl = this.documents.selfieUrl;
  next();
});

// ───────────── Métodos de instancia ─────────────
// Llama esto cuando el usuario reenvía/actualiza una solicitud.
SellerApplicationSchema.methods.markReapplied = async function markReapplied(notes = "") {
  this.reapplyCount = (this.reapplyCount || 0) + 1;
  this.lastReappliedAt = new Date();
  if (notes) this.notes = String(notes);
  // Al re-aplicar, volvemos a estado pendiente y limpiamos revisión
  this.status = "PENDING";
  this.reviewedAt = null;
  this.reviewedBy = null;
  await this.save();
  return this;
};

// ───────────── Índices explícitos ─────────────
// Historial / búsquedas
SellerApplicationSchema.index({ userId: 1, createdAt: -1 });
SellerApplicationSchema.index({ documentNumber: 1 });
SellerApplicationSchema.index({ status: 1, reviewedAt: -1 });

// (Opcional) Solo una solicitud PENDING por usuario
SellerApplicationSchema.index(
  { userId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "PENDING" } }
);

// Única solicitud “activa” por usuario (no borrada)
SellerApplicationSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { deletedAt: { $exists: false } } }
);

// (Nuevo) Consultas por re-aplicaciones recientes
SellerApplicationSchema.index({ lastReappliedAt: -1 });

// Evita OverwriteModelError en hot-reload
const SellerApplication =
  mongoose.models.SellerApplication ||
  mongoose.model("SellerApplication", SellerApplicationSchema);

export default SellerApplication;
export { SellerApplication };
