import mongoose from "mongoose";

const { Schema } = mongoose;

const productAttributeValueSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    attributeId: {
      type: Schema.Types.ObjectId,
      ref: "Attribute",
      required: true,
    },

    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

productAttributeValueSchema.index(
  { productId: 1, attributeId: 1 },
  { unique: true }
);

export default mongoose.model(
  "ProductAttributeValue",
  productAttributeValueSchema
);
