import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Attribute
 * Define un atributo global del catálogo (color, talla, material, etc.)
 * Los valores y opciones se pueblan desde los variantes.js del admin.
 */
const attributeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    // "select" (chips), "image_upload" (vendedor sube foto por opción),
    // "text", "number", "boolean", "multiselect", "color_swatch"
    type: {
      type: String,
      enum: ["text", "number", "select", "multiselect",
             "boolean", "color_swatch", "image_upload"],
      required: true,
    },

    options: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],

    unit: {
      type: String,
      default: "",
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const AttributeModel =
  mongoose.models.Attribute || mongoose.model("Attribute", attributeSchema);

export default AttributeModel;
export { AttributeModel as Attribute };
