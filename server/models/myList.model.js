import mongoose from "mongoose";

const { Schema } = mongoose;

const myListSchema = new Schema({
    // 🏪 Multi-tienda
    storeId: {
        type: Schema.Types.ObjectId,
        ref: "Store",
        index: true,
        // no required para no romper data vieja; puedes volverlo required cuando migres
    },

    // 🔗 Referencias (Mongoose castea strings de ObjectId sin problema)
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        index: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    // 📝 Datos “snapshots” del producto (denormalizados)
    productTitle: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },

    rating: { type: Number, required: true, min: 0, max: 5, default: 0 },

    price: { type: Number, required: true, min: 0 },
    // Moneda base del price (USD o BOB)
    currency: {
        type: String,
        enum: ["USD", "BOB"],
        required: true,
        uppercase: true,
    },

    oldPrice: { type: Number, required: true, min: 0, default: 0 },

    brand: { type: String, required: true, trim: true, default: "" },

    discount: { type: Number, required: true, min: 0, max: 100, default: 0 },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (_doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            return ret;
        }
    }
});

// 🔒 Evita duplicados por usuario/producto/tienda
// (si aún no usas storeId, se permite un null; cuando migres, podrás hacer required)
myListSchema.index({ userId: 1, productId: 1, storeId: 1 }, { unique: true });

// ✅ Normaliza currency a MAYÚSCULAS sin romper nada
myListSchema.pre("save", function (next) {
    if (this.currency) this.currency = this.currency.toUpperCase();
    next();
});

const MyListModel = mongoose.model("MyList", myListSchema);
export default MyListModel;
