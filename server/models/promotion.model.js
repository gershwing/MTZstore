// server/models/promotion.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * Tipos básicos de promos:
 * - PERCENT: % sobre subtotal aplicable
 * - FIXED: monto fijo de descuento
 * - BOGO: compra X y lleva Y
 * - FREE_SHIPPING: envío gratuito
 */
export const PROMO_TYPES = ["PERCENT", "FIXED", "BOGO", "FREE_SHIPPING"];
export const PROMO_APPLIES_TO = ["ALL", "PRODUCTS", "CATEGORIES"];
export const PROMO_STATUS = ["DRAFT", "ACTIVE", "PAUSED", "EXPIRED"];

const promoSchema = new Schema(
  {
    /* =========================
       MULTI-TENANT
    ========================= */
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    /* =========================
       INFO BÁSICA
    ========================= */
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    /* =========================
       CÓDIGO
    ========================= */
    code: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },

    autoApply: {
      type: Boolean,
      default: false,
    },

    /* =========================
       TIPO Y VALOR
    ========================= */
    type: {
      type: String,
      enum: PROMO_TYPES,
      required: true,
    },

    value: {
      type: Number,
      required: true,
      min: 0,
    },

    /* =========================
       BOGO
    ========================= */
    buyQty: { type: Number, min: 1, default: 0 },
    freeQty: { type: Number, min: 1, default: 0 },

    /* =========================
       ALCANCE
    ========================= */
    appliesTo: {
      type: String,
      enum: PROMO_APPLIES_TO,
      default: "ALL",
    },

    productIds: [
      { type: Schema.Types.ObjectId, ref: "Product" },
    ],

    categoryIds: [
      { type: Schema.Types.ObjectId, ref: "Category" },
    ],

    /* =========================
       REGLAS
    ========================= */
    minOrderAmount: { type: Number, default: 0 },

    baseCurrency: {
      type: String,
      enum: ["USD", "BOB"],
      default: "USD",
    },

    maxUses: { type: Number, default: 0 },
    maxUsesPerUser: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },

    /* =========================
       VIGENCIA
    ========================= */
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },

    /* =========================
       PRIORIDAD Y ESTADO
    ========================= */
    stackable: { type: Boolean, default: false },
    priority: { type: Number, default: 100 },

    status: {
      type: String,
      enum: PROMO_STATUS,
      default: "DRAFT",
      index: true,
    },
  },
  { timestamps: true }
);

/* =========================
   ÍNDICES (SIN DUPLICADOS)
========================= */

// Código por tienda (solo si existe)
promoSchema.index(
  { storeId: 1, code: 1 },
  {
    unique: false,
    partialFilterExpression: {
      code: { $type: "string", $ne: "" },
    },
  }
);

// Búsqueda rápida de promos activas
promoSchema.index({ storeId: 1, status: 1, startAt: 1, endAt: 1 });

// Optimización para filtros por producto / categoría
promoSchema.index({ storeId: 1, productIds: 1 });
promoSchema.index({ storeId: 1, categoryIds: 1 });

const Promotion =
  mongoose.models.Promotion ||
  mongoose.model("Promotion", promoSchema);

export default Promotion;
