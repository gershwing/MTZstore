import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * CategoryAttribute
 * Define qué atributos aplica una categoría
 * y cómo se comportan en ella
 */
const categoryAttributeSchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      default: null, // null = global
      index: true,
    },

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    attributeId: {
      type: Schema.Types.ObjectId,
      ref: "Attribute",
      required: true,
    },

    // 📏 reglas por categoría
    required: { type: Boolean, default: false },
    variant: { type: Boolean, default: false },
    affectsPrice: { type: Boolean, default: false },
    affectsStock: { type: Boolean, default: false },

    sortOrder: { type: Number, default: 0 },

    // Mapa modelo → opciones válidas para ese modelo
    // Ej: { "iPhone 16 Pro": ["128-gb", "256-gb", "512-gb", "1-tb"] }
    modelOptions: {
      type: Map,
      of: [String],
      default: undefined,
    },

    // Opciones permitidas para esta categoría (sobreescribe Attribute.options)
    allowedOptions: {
      type: [{ value: String, label: String }],
      default: undefined,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Un atributo no se repite por categoría (por tienda)
categoryAttributeSchema.index(
  { storeId: 1, categoryId: 1, attributeId: 1 },
  { unique: true }
);

export default mongoose.model("CategoryAttribute", categoryAttributeSchema);
