import mongoose from "mongoose";

const bannerList2Schema = new mongoose.Schema({
    // 🔐 Multitienda
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true, index: true },

    // 👤 Auditoría
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // 🖼️ Mantengo compatibilidad: array de URLs (string)
    images: [{ type: String }],

    // 🗂️ Compatibilidad con tu modelo actual
    catId: { type: String, default: "" },
    subCatId: { type: String, default: "" },
    thirdsubCatId: { type: String, default: "" },

    // ⚙️ Estado y visibilidad (scheduling)
    status: {
        type: String,
        enum: ["draft", "scheduled", "published", "archived"],
        default: "draft",
        index: true
    },
    visibility: {
        type: String,
        enum: ["public", "private", "unlisted"],
        default: "public"
    },
    publishAt: { type: Date, default: null },
    expireAt: { type: Date, default: null },

    // ⚙️ Extras útiles
    isActive: { type: Boolean, default: true, index: true },
    priority: { type: Number, default: 0, index: true },

}, {
    timestamps: true
});

// 📊 Índices típicos para panel/tienda
bannerList2Schema.index({ storeId: 1, status: 1, priority: 1 });
bannerList2Schema.index({ storeId: 1, isActive: 1 });

const BannerList2Model = mongoose.model("bannerList2", bannerList2Schema);
export default BannerList2Model;
