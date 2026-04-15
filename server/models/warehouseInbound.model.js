import mongoose from 'mongoose';
const { Schema } = mongoose;

const lineItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
  sku: { type: String, default: '' },
  productName: { type: String, required: true },
  variantLabel: { type: String, default: '' }, // e.g. "Rojo / XL"
  qty: { type: Number, required: true, min: 1 },
  qtyReceived: { type: Number, default: 0, min: 0 },
  productImage: { type: String, default: '' },  // main product image snapshot
}, { _id: true });

const warehouseInboundSchema = new Schema({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'RECEIVED'], default: 'PENDING' },
  lineItems: { type: [lineItemSchema], required: true, validate: v => v.length > 0 },
  notes: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  shipmentImages: [{ type: String }],   // photos of the shipment (uploaded by seller)
  reviewImages: [{ type: String }],     // photos from warehouse review (uploaded by admin)
  reviewNotes: { type: String, default: '' },  // admin message on approve/reject
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  deletedAt: { type: Date },
}, { timestamps: true });

warehouseInboundSchema.index({ storeId: 1, createdAt: -1 });
warehouseInboundSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('WarehouseInbound', warehouseInboundSchema);
