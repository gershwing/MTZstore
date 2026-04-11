// server/models/auditLog.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const AuditLogSchema = new Schema(
  {
    /* =========================
       TIEMPO
    ========================= */
    at: {
      type: Date,
      default: Date.now,
      index: true,
    },

    /* =========================
       ACTOR
    ========================= */
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    actorRole: {
      type: String,
      default: "",
    },

    /* =========================
       MULTI-TENANT
    ========================= */
    tenantStoreId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      default: null,
      index: true,
    },

    /* =========================
       EVENTO
    ========================= */
    action: {
      type: String,
      required: true,
      index: true, // se consulta mucho
    },

    entity: {
      type: String,
      required: true,
      index: true,
    },

    entityId: {
      type: String,
      default: "",
      index: true,
    },

    status: {
      type: String,
      enum: ["OK", "ERROR"],
      default: "OK",
      index: true,
    },

    /* =========================
       CONTEXTO
    ========================= */
    ip: { type: String, default: "" },
    ua: { type: String, default: "" },

    /* =========================
       METADATA
       ⚠️ objeto plano (NO Mixed)
    ========================= */
    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   ÍNDICES (SIN DUPLICADOS)
========================= */

// Búsqueda por acción + fecha
AuditLogSchema.index({ action: 1, at: -1 });

// Auditoría por tienda
AuditLogSchema.index({ tenantStoreId: 1, at: -1 });

// Búsqueda rápida por entidad
AuditLogSchema.index({ entity: 1, entityId: 1, at: -1 });

// Auditoría por usuario
AuditLogSchema.index({ actorId: 1, at: -1 });

const AuditLog =
  mongoose.models.AuditLog ||
  mongoose.model("AuditLog", AuditLogSchema);

export default AuditLog;
