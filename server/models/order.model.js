// server/models/order.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;

/* ── Sub-schemas ─────────────────────────────────────── */

const fxSnapshotSchema = new Schema(
    {
        bobPerUsd: { type: Number, required: true },
        usedFallback: { type: Boolean, default: false },
        at: { type: Date, default: Date.now },
    },
    { _id: false }
);

const orderProductSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        variantId: { type: Schema.Types.ObjectId, ref: "ProductVariant", default: null },
        productType: { type: String, enum: ["SIMPLE", "VARIANT"], default: "SIMPLE" },

        storeId: { type: Schema.Types.ObjectId, ref: "Store" },
        productTitle: { type: String, default: "" },
        image: { type: String, default: "" },

        size: { type: String, default: null },
        ram: { type: String, default: null },
        weight: { type: String, default: null },

        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        currency: { type: String, enum: ["USD", "BOB"], default: "BOB" },
        subTotal: { type: Number, default: 0 },

        stockSnapshot: { type: Number, default: 0 },
        unitSettleAmount: { type: Number, default: 0 },
        lineTotalSettle: { type: Number, default: 0 },

        // Tax snapshot (per-line)
        ivaEnabled: { type: Boolean, default: false },
        ivaPct: { type: Number, default: 0 },
        itEnabled: { type: Boolean, default: false },
        itPct: { type: Number, default: 0 },

        variantAttrs: { type: Schema.Types.Mixed, default: null },
    },
    { _id: false }
);

/* ── Main schema ─────────────────────────────────────── */

const ORDER_STATUSES = ["created", "confirm", "processing", "shipped", "delivered", "cancelled"];

const orderSchema = new Schema(
    {
        // Multi-tenant
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true },

        // Line items
        products: [orderProductSchema],

        // Payment
        paymentId: { type: String, default: "" },
        payment_status: { type: String, default: "CREATED" },
        paymentMethod: { type: String, default: "" },
        latestPaymentId: { type: Schema.Types.ObjectId, ref: "Payment", default: null },

        // Delivery
        delivery_address: { type: Schema.Types.ObjectId, ref: "address" },
        shippingMethod: { type: String, default: "MTZSTORE_STANDARD" },

        // Order lifecycle
        order_status: {
            type: String,
            enum: ORDER_STATUSES,
            default: "created",
        },

        // Settlement / FX
        settleCurrency: { type: String, enum: ["USD", "BOB"], default: "BOB" },
        subtotalAmt: { type: Number, default: 0 },
        ivaTotal: { type: Number, default: 0 },
        itTotal: { type: Number, default: 0 },
        totalAmt: { type: Number, default: 0 },
        totalUsd: { type: Number, default: 0 },
        totalBob: { type: Number, default: 0 },
        shippingSettle: { type: Number, default: 0 },
        feesSettle: { type: Number, default: 0 },
        fx: { type: fxSnapshotSchema },
    },
    { timestamps: true }
);

/* ── Virtual: legacy `status` alias ──────────────────── */

orderSchema.virtual("status").get(function () {
    return this.order_status;
});

orderSchema.set("toObject", { virtuals: true });
orderSchema.set("toJSON", { virtuals: true });

/* ── Indexes ─────────────────────────────────────────── */

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ storeId: 1, createdAt: -1 });
orderSchema.index({ storeId: 1, order_status: 1 });
orderSchema.index({ "products.storeId": 1 });
orderSchema.index({ payment_status: 1 });

/* ── Model ───────────────────────────────────────────── */

const OrderModel = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default OrderModel;
