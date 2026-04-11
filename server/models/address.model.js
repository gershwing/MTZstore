// server/models/address.model.js
import mongoose from "mongoose";

const { Schema, model, models, Types } = mongoose;

const AddressSchema = new Schema(
    {
        // 🔐 Multi-tenant
        storeId: { type: Types.ObjectId, ref: "Store", index: true },

        // 👤 Dueño de la dirección
        userId: { type: Types.ObjectId, ref: "User", required: true, index: true },

        // 🏷️ Info de contacto/envío
        fullName: { type: String, default: "" },
        mobile: { type: String, default: "" },
        email: { type: String, default: "" },

        // 📦 Dirección
        address_line1: { type: String, required: true, trim: true },
        address_line2: { type: String, default: "", trim: true },
        landmark: { type: String, default: "", trim: true },
        city: { type: String, default: "", trim: true, index: true },
        state: { type: String, default: "", trim: true, index: true },
        country: { type: String, default: "Bolivia", trim: true, index: true },
        postalCode: { type: String, default: "" },
        pincode: { type: String, default: "" },

        // 🧭 Geo (opcional)
        location: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null },
        },

        // 🏢 Empresa / facturación (opcional)
        company: { type: String, default: "" },
        taxId: { type: String, default: "" },
        isBilling: { type: Boolean, default: false },

        // 🎛️ Metadatos de uso
        addressType: { type: String, enum: ["home", "office", "other"], default: "home", index: true },
        isDefault: { type: Boolean, default: false, index: true },
        status: { type: Boolean, default: true },
        notes: { type: String, default: "" },

        // 🗑️ Soft delete opcional
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: true,
        // 🔁 Asegura que ambos modelos apunten a la misma colección
        collection: "addresses",
    }
);

// 🔎 Índices útiles
AddressSchema.index({ userId: 1, storeId: 1, isDefault: -1 });
AddressSchema.index({ userId: 1, storeId: 1, createdAt: -1 });

// 🧹 Normalizaciones ligeras
AddressSchema.pre("save", function (next) {
    if (this.addressType) this.addressType = this.addressType.toLowerCase();
    if (!this.postalCode && this.pincode) {
        this.postalCode = this.pincode;
    }
    next();
});

/**
 * ✅ Garantiza UNA sola dirección por usuario+tienda marcada como default.
 */
AddressSchema.post("save", async function (doc, next) {
    try {
        if (doc.isDefault) {
            await doc.constructor.updateMany(
                {
                    _id: { $ne: doc._id },
                    userId: doc.userId,
                    storeId: doc.storeId || { $exists: false },
                },
                { $set: { isDefault: false } }
            );
        }
    } catch (_e) {
        // log si quieres
    }
    next();
});

// ✅ Registro tolerante (evita MissingSchemaError por 'address' en minúsculas)
const AddressModel =
    models.Address || model("Address", AddressSchema);

// Alias en minúsculas si en algún populate usan 'address'
if (!models.address) {
    model("address", AddressSchema);
}

export default AddressModel;
