// server/models/cartProduct.model.js
import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema(
   {
      /* =========================
         SNAPSHOT VISUAL
      ========================= */
      productTitle: { type: String, required: true },
      image: { type: String, required: true },
      rating: { type: Number, default: 0 },
      brand: { type: String, default: "" },

      /* =========================
         REFERENCIAS CLAVE
      ========================= */
      productId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Product",
         required: true,
         index: true, // ✔ útil
      },

      /**
       * CLAVE DE VARIANTE
       * - Obligatoria si productType = VARIANT
       */
      variantId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "ProductVariant",
         default: null, // ❌ sin index individual
      },

      productType: {
         type: String,
         enum: ["SIMPLE", "VARIANT"],
         required: true,
         index: true,
      },

      /* =========================
         SNAPSHOT DE ATRIBUTOS
      ========================= */
      size: { type: String, default: "" },
      weight: { type: String, default: "" },
      ram: { type: String, default: "" },
      variantAttrs: { type: mongoose.Schema.Types.Mixed, default: {} },

      /* =========================
         PRECIO SNAPSHOT
      ========================= */
      price: { type: Number, required: true },
      currency: {
         type: String,
         enum: ["USD", "BOB"],
         required: true,
      },
      oldPrice: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },

      /* =========================
         IMPUESTOS SNAPSHOT
      ========================= */
      ivaPct: { type: Number, default: 0 },
      ivaEnabled: { type: Boolean, default: false },
      itPct: { type: Number, default: 0 },
      itEnabled: { type: Boolean, default: false },

      /* =========================
         CANTIDAD
      ========================= */
      quantity: { type: Number, required: true, min: 1 },
      subTotal: { type: Number, required: true },

      /* =========================
         STOCK SNAPSHOT
      ========================= */
      stockSnapshot: { type: Number, required: true },

      /* =========================
         MULTI-TENANT
      ========================= */
      storeId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Store",
         index: true,
         default: null,
      },

      /* =========================
         USUARIO
      ========================= */
      userId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
   },
   { timestamps: true }
);

/* =========================
   VALIDACIÓN DE NEGOCIO
========================= */
cartProductSchema.pre("validate", function (next) {
   if (this.productType === "VARIANT" && !this.variantId) {
      return next(
         new Error("variantId es obligatorio cuando productType = VARIANT")
      );
   }
   next();
});

/* =========================
   ÍNDICES REALES
========================= */

// 🧺 Carrito por usuario
cartProductSchema.index(
   { userId: 1, storeId: 1, createdAt: -1 },
   { name: "idx_cart_user_store_created" }
);

// 🛑 Evita duplicar el mismo producto/variante en carrito
cartProductSchema.index(
   { userId: 1, productId: 1, variantId: 1 },
   { name: "idx_cart_user_product_variant" }
);

const CartProductModel =
   mongoose.models.CartProduct ||
   mongoose.model("CartProduct", cartProductSchema);

export default CartProductModel;
