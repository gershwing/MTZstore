// server/models/store.model.js
import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    // Identidad
    name: { type: String, required: [true, "Provide store name"], trim: true },
    slug: { type: String, lowercase: true, trim: true },

    // 👇 NUEVO: categoría principal de la tienda
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      index: true,
      default: null,
    },

    // Dueño (opcional: OWNER "de plataforma", distinto de memberships por usuario)
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Tienda oficial de la plataforma (solo 1)
    isPlatformStore: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Estado operativo (lo que usa withTenant para habilitar/denegar)
    status: {
      type: String,
      enum: ["active", "suspended", "archived"],
      default: "active",
    },

    // ⚠️ Compatibilidad legacy: algunas rutas aún mandan `active: true/false`
    // No lo usaremos a futuro; solo sirve para mapear a `status` si llega.
    active: { type: Boolean, default: undefined, select: false },

    // Enrutamiento/tenancy (opcional)
    domain: {
      type: String,
      trim: true,
      index: { name: "idx_store_domain", sparse: true, unique: true },
    },
    subdomain: {
      type: String,
      lowercase: true,
      trim: true,
      index: { name: "idx_store_subdomain", sparse: true, unique: true },
    },

    // Preferencias/branding básicas (extensibles)
    currency: { type: String, enum: ["USD", "BOB"], default: "USD" }, // catálogo
    settlementCurrency: {
      type: String,
      enum: ["USD", "BOB", "USDT"],
      default: "USD",
    }, // órdenes
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    address: {
      country: String,
      state: String,
      city: String,
      street: String,
      zip: String,
    },
    branding: {
      logo: String,
      banner: String,
    },

    // Configuración fiscal y operativa
    config: {
      storeType: {
        type: String,
        enum: ["IMPORTER", "MANUFACTURER", "MIXED"],
        default: "IMPORTER",
      },
      wholesaleEnabled: { type: Boolean, default: false },
      ivaPct:           { type: Number, default: 13 },
      otherTaxesPct:    { type: Number, default: 0 },
      profitTaxPct:     { type: Number, default: 25 },
      defaultMarginPct: { type: Number, default: 30 },
      minMarginPct:     { type: Number, default: 20 },
      commissionPct:    { type: Number, default: 10, min: 0, max: 100 },
    },
  },
  { timestamps: true }
);

/* ====== Compatibilidad: mapear `active` → `status` si llega ====== */
storeSchema.pre("validate", function (next) {
  if (typeof this.active === "boolean" && !this.isModified("status")) {
    this.status = this.active ? "active" : "suspended";
  }
  next();
});

/* ====== Normalización de contacto ====== */
storeSchema.pre("save", function (next) {
  if (!this.slug || this.isModified("name")) {
    const base = (this.name || "").toString().trim().toLowerCase();
    this.slug = base
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // quita acentos
      .replace(/[^a-z0-9]+/g, "-") // separadores
      .replace(/^-+|-+$/g, ""); // bordes
  }
  if (this.isModified("email") && this.email)
    this.email = this.email.toLowerCase().trim();
  if (this.isModified("phone") && this.phone) this.phone = this.phone.trim();
  next();
});

/* ====== Salida limpia ====== */
storeSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.active; // ocultar legacy
    return ret;
  },
});

/* ================== ÍNDICES ================== */
// Unicidad de name con collation para case-insensitive
storeSchema.index(
  { name: 1 },
  {
    unique: true,
    name: "uniq_store_name_ci",
    collation: { locale: "en", strength: 2 },
  }
);
// Slug único (sparse para permitir null/undefined mientras se crea)
storeSchema.index({ slug: 1 }, { unique: true, sparse: true, name: "uniq_store_slug" });
// Otros índices útiles
storeSchema.index({ ownerId: 1 }, { name: "idx_store_owner" });
storeSchema.index({ status: 1 }, { name: "idx_store_status" });
storeSchema.index({ createdAt: -1 }, { name: "idx_store_created_at" });
// Índice por categoría principal
storeSchema.index({ categoryId: 1 }, { name: "idx_store_category" });

/* ============ Modelo (anti-OverwriteModelError) ============ */
const StoreModel =
  mongoose.models.Store || mongoose.model("Store", storeSchema);

export default StoreModel;
export { StoreModel as Store };
