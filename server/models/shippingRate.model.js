import mongoose from "mongoose";

const shippingRateSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["MTZSTORE_EXPRESS", "MTZSTORE_STANDARD", "STORE"],
      required: true,
    },
    zone: {
      type: String,
      required: true,
      index: true,
    },
    baseRate: { type: Number, default: 0 },
    perKgRate: { type: Number, default: 0 },
    freeAbove: { type: Number, default: 0 },
    estimatedDays: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 3 },
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

shippingRateSchema.index({ method: 1, zone: 1 }, { unique: true });

const ShippingRateModel =
  mongoose.models.ShippingRate ||
  mongoose.model("ShippingRate", shippingRateSchema);

export default ShippingRateModel;
