// server/models/logo.model.js
import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Logo multialcance:
 * - scope = 'platform' → logo global (único)
 * - scope = 'store'    → logo por tienda (uno por tienda)
 */
const logoSchema = new Schema(
    {
        scope: {
            type: String,
            enum: ["platform", "store"],
            default: "platform",
            // ❌ index eliminado (evita duplicado)
        },

        // Requerido sólo si scope === 'store'
        storeId: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: function () {
                return this.scope === "store";
            },
            // ❌ index eliminado (se maneja abajo)
        },

        // URLs
        url: { type: String, default: "" },
        secureUrl: { type: String, default: "" },

        // Compatibilidad frontend
        logo: { type: String, default: "" },

        // Metadata
        publicId: { type: String, default: "" },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
        format: { type: String, default: "" },
        bytes: { type: Number, default: 0 },
        etag: { type: String, default: "" },

        // Gestión
        isActive: { type: Boolean, default: true },
        tags: [{ type: String, trim: true }],
        uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

/* ===========================
   ÍNDICES CORRECTOS (SIN DUPLICADOS)
=========================== */

/**
 * 1 ÚNICO logo de plataforma
 */
logoSchema.index(
    { scope: 1 },
    { unique: true, partialFilterExpression: { scope: "platform" } }
);

/**
 * 1 ÚNICO logo por tienda
 */
logoSchema.index(
    { scope: 1, storeId: 1 },
    { unique: true, partialFilterExpression: { scope: "store" } }
);

/* ===========================
   TRANSFORM
=========================== */
logoSchema.set("toJSON", {
    virtuals: false,
    versionKey: false,
    transform: function (doc, ret) {
        ret.logo = ret.secureUrl || ret.url || ret.logo || "";
        return ret;
    },
});

logoSchema.set("toObject", { virtuals: false, versionKey: false });

/* ===========================
   HOOKS
=========================== */
logoSchema.pre("save", function (next) {
    if (!this.logo) {
        this.logo = this.secureUrl || this.url || "";
    }

    if (this.scope === "platform") {
        this.storeId = undefined;
    }
    next();
});

/* ===========================
   STATICS
=========================== */
logoSchema.statics.getEffectiveLogo = async function (storeId) {
    if (storeId) {
        const storeLogo = await this.findOne({
            scope: "store",
            storeId,
            isActive: true,
        }).lean();
        if (storeLogo) return storeLogo;
    }

    return await this.findOne({
        scope: "platform",
        isActive: true,
    }).lean();
};

logoSchema.statics.setPlatformLogo = async function (payload = {}) {
    const update = {
        ...payload,
        scope: "platform",
        storeId: undefined,
    };

    if (!update.logo) {
        update.logo = update.secureUrl || update.url || "";
    }

    return await this.findOneAndUpdate(
        { scope: "platform" },
        update,
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
};

logoSchema.statics.setLogoForStore = async function (storeId, payload = {}) {
    if (!storeId) throw new Error("storeId requerido");

    const update = {
        ...payload,
        scope: "store",
        storeId,
    };

    if (!update.logo) {
        update.logo = update.secureUrl || update.url || "";
    }

    return await this.findOneAndUpdate(
        { scope: "store", storeId },
        update,
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
};

/* ===========================
   MODELO
=========================== */
const LogoModel = mongoose.models.Logo || mongoose.model("Logo", logoSchema);
export default LogoModel;
