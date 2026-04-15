import mongoose from "mongoose";

const { Schema } = mongoose;

const productVariantSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    // Flexible: acepta { color: "Red", size: "XL" } o [{ attributeId, value }]
    attributes: { type: Schema.Types.Mixed, default: {} },

    sku: { type: String, trim: true },
    price: { type: Number },
    wholesalePrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    warehouseStock: { type: Number, default: 0 },  // stock en almacén MTZ
    images: [{ type: Schema.Types.Mixed }],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("ProductVariant", productVariantSchema);
