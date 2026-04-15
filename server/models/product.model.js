import mongoose from "mongoose";

const { Schema } = mongoose;

const productSchema = new Schema(
   {
      /* =========================
         IDENTIDAD BÁSICA
      ========================= */
      name: { type: String, required: true, trim: true },
      description: { type: String, default: "" },

      details: [{
        key:   { type: String, trim: true, default: "" },
        value: { type: String, trim: true, default: "" },
        _id: false,
      }],

      brand: { type: String, default: "" },

      slug: { type: String, trim: true },

      /* =========================
         MEDIA / HOME
      ========================= */
      images: [{ type: String }],
      bannerimages: [{ type: String }],
      bannerTitleName: { type: String, default: "" },
      isDisplayOnHomeBanner: { type: Boolean, default: false },

      /* =========================
         TIPO DE PRODUCTO
      ========================= */
      productType: {
         type: String,
         enum: ["SIMPLE", "VARIANT"],
         default: "VARIANT",
         index: true,
      },

      /* =========================
         PRECIO BASE
      ========================= */
      basePrice: { type: Number, default: 0 },
      wholesaleEnabled: { type: Boolean, default: false },
      wholesalePrice: { type: Number, default: 0 },
      oldBasePrice: { type: Number, default: 0 },

      /* Precios mayoristas por niveles (para ventas online) */
      wholesaleTiers: {
         enabled: { type: Boolean, default: false },
         tier1: {
            minQty: { type: Number, default: 0 },
            maxQty: { type: Number, default: 0 },
            price:  { type: Number, default: 0 },
         },
         tier2: {
            minQty: { type: Number, default: 0 },
            price:  { type: Number, default: 0 },
         },
      },

      baseCurrency: {
         type: String,
         enum: ["USD", "BOB"],
         default: "USD",
      },

      discount: { type: Number, default: 0 },
      sale: { type: Number, default: 0 },

      /**
       * Margen de ganancia de la plataforma (%).
       * Se aplica sobre basePrice antes de la conversión FX.
       * Ej: marginPct = 15  →  precioFinal = basePrice × 1.15
       */
      marginPct: { type: Number, default: 0, min: 0, max: 500 },

      /* =========================
         IMPORTACIÓN (SERIO)
      ========================= */
      importation: {
         enabled: { type: Boolean, default: false },

         importCode: {
            type: String,
            trim: true,
            // ❌ index removido (se define abajo)
         },

         originCountry: { type: String, default: "" }, // CN, US, etc.
         supplierName: { type: String, default: "" },

         costUsd: { type: Number, default: 0 },
         marginPct: { type: Number, default: 0 },

         logisticsNotes: { type: String, default: "" },
      },

      /* =========================
         CONFIGURACIÓN DE VENTA
      ========================= */
      salesConfig: {
         enableSalesConfig: { type: Boolean, default: false },
         operationType: {
            type: String,
            enum: ["IMPORTED", "MANUFACTURED"],
            default: "IMPORTED",
         },
         imported: {
            importCode:     { type: String, trim: true, default: "" },
            originCountry:  { type: String, default: "" },
            supplier:       { type: String, default: "" },
            baseCost:       { type: Number, default: 0 },
            freight:        { type: Number, default: 0 },
            tariffPct:      { type: Number, default: 0 },
            wastePct:       { type: Number, default: 0 },
            customs:        { type: Number, default: 0 },
            storage:        { type: Number, default: 0 },
            handling:       { type: Number, default: 0 },
            insurance:      { type: Number, default: 0 },
            logisticsNotes: { type: String, default: "" },
            // Campos porcentuales (nueva lógica)
            freightPct:    { type: Number, default: 25 },
            tariffIvaPct:  { type: Number, default: 30 },
            otherCostsPct: { type: Number, default: 7 },
            valorMercancia: { type: Number, default: 0 },
            // Desglose flete (referencia)
            fleteTerrOrigen:  { type: Number, default: 0 },
            fleteMaritimo:    { type: Number, default: 0 },
            fleteTerrDestino: { type: Number, default: 0 },
            // Desglose CIF (referencia)
            gravamenArancelarioPct: { type: Number, default: 0 },
            ivaCifPct:              { type: Number, default: 14.94 },
            // Desglose otros gastos (referencia)
            comisionConsolidacionPct: { type: Number, default: 3 },
            liberacionContenedor:     { type: Number, default: 0 },
            manipuleoOrigen:          { type: Number, default: 0 },
            manipuleoDestino:         { type: Number, default: 0 },
            despachanteAduana:        { type: Number, default: 0 },
            almacenAduana:            { type: Number, default: 0 },
         },
         manufactured: {
            rawMaterials:    { type: Number, default: 0 },
            directLabor:     { type: Number, default: 0 },
            packaging:       { type: Number, default: 0 },
            overhead:        { type: Number, default: 0 },
            qualityControl:  { type: Number, default: 0 },
            logistics:       { type: Number, default: 0 },
            wastePct:        { type: Number, default: 0 },
            productionNotes: { type: String, default: "" },
         },
         marginConfig: {
            marginPct:         { type: Number, default: 30 },
            minMarginPct:      { type: Number, default: 20 },
            wholesaleMarginPct:       { type: Number, default: 38 },
            unitMinMarginPct:         { type: Number, default: 88 },
            unitSuggestedMarginPct:   { type: Number, default: 113 },
            marginUsd:                { type: Number, default: 0 },
            precioMayorista:          { type: Number, default: 0 },
            precioMinUnitario:        { type: Number, default: 0 },
            precioSugerido:           { type: Number, default: 0 },
            costUsd:                  { type: Number, default: 0 },
         },
         taxConfig: {
            ivaPct:           { type: Number, default: 13 },
            ivaEnabled:       { type: Boolean, default: true },
            otherTaxesPct:    { type: Number, default: 3 },
            itEnabled:        { type: Boolean, default: true },
            priceIncludesTax: { type: Boolean, default: false },
            ivaAmount:        { type: Number, default: 0 },
            finalPrice:       { type: Number, default: 0 },
         },
         stats: {
            unitsSoldExpected:  { type: Number, default: 0 },
            projectedRevenue:   { type: Number, default: 0 },
            projectedNetProfit: { type: Number, default: 0 },
         },
      },

      // Legacy field (mantener para compatibilidad)
      shippedBy: {
         type: String,
         enum: ["STORE", "MTZSTORE", "MTZSTORE_EXPRESS", "MTZSTORE_STANDARD"],
         default: "STORE",
      },

      // Nuevo: múltiples métodos de envío habilitados
      shipping: {
         mtzExpress:    { type: Boolean, default: false },
         mtzStandard:   { type: Boolean, default: false },
         storeExpress:  { type: Boolean, default: false },
         storeStandard: { type: Boolean, default: true },
         storeSelf:     { type: Boolean, default: true }, // legacy compat
      },

      // Dimensiones del producto (para cálculo de envío)
      dimensions: {
         weight: { type: Number, default: 0 },  // kg
         length: { type: Number, default: 0 },  // cm
         width:  { type: Number, default: 0 },  // cm
         height: { type: Number, default: 0 },  // cm
      },

      /* =========================
         ATRIBUTOS DEL PRODUCTO
      ========================= */
      attributes: { type: Schema.Types.Mixed, default: {} },

      /* =========================
         CATEGORÍA
      ========================= */
      category: {
         type: Schema.Types.ObjectId,
         ref: "Category",
         index: true,
      },

      // ⛔ Legacy (NO borrar aún)
      catId: { type: String, default: "" },
      catName: { type: String, default: "" },
      subCatId: { type: String, default: "" },
      subCat: { type: String, default: "" },
      thirdsubCatId: { type: String, default: "" },
      thirdsubCat: { type: String, default: "" },

      /* =========================
         TENANT
      ========================= */
      storeId: {
         type: Schema.Types.ObjectId,
         ref: "Store",
         required: false,
         default: null,
         index: true,
      },

      /* =========================
         INVENTARIO BÁSICO
         (SIMPLE PRODUCT)
      ========================= */
      countInStock: { type: Number, default: 0 },
      warehouseStock: { type: Number, default: 0 },  // stock en almacén MTZ
      stockMinimo: { type: Number, default: 0 },

      /* =========================
         METADATA
      ========================= */
      rating: { type: Number, default: 0 },
      isFeatured: { type: Boolean, default: false },

      /* ========================= Trazabilidad ========================= */
      entryDate:      { type: Date, default: null },
      entryType:      { type: String, enum: ["", "MARITIMO", "AEREO", "LOCAL", "OTRO"], default: "" },
      entryReference: { type: String, trim: true, default: "" },

      status: {
         type: String,
         enum: ["draft", "active", "inactive"],
         default: "active",
         index: true,
      },
   },
   { timestamps: true }
);

/* =========================
   ÍNDICES (CENTRALIZADOS)
========================= */
productSchema.index({ storeId: 1, category: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ "importation.importCode": 1 });
productSchema.index({ "salesConfig.imported.importCode": 1 });

/* =========================
   SLUG AUTOMÁTICO
========================= */
productSchema.pre("validate", function (next) {
   if (!this.slug && this.name) {
      this.slug = this.name
         .toLowerCase()
         .trim()
         .replace(/\s+/g, "-")
         .replace(/[^a-z0-9\-]/g, "");
   }
   next();
});

const ProductModel =
   mongoose.models.Product || mongoose.model("Product", productSchema);

export default ProductModel;
export { ProductModel as Product };
