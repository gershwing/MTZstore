import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
    url: { type: String, required: true },        // p.ej. Cloudinary secure_url
    publicId: { type: String, default: "" },       // p.ej. Cloudinary public_id
    alt: { type: String, default: "" },
    order: { type: Number, default: 0 },           // para ordenar carrusel
}, { _id: false });

const BannerSchema = new mongoose.Schema({
    // 🔐 Multitienda
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true, index: true },

    // 👤 Trazabilidad (multiusuario)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // 📣 Contenido
    bannerTitle: { type: String, default: "", required: true },
    subtitle: { type: String, default: "" },

    images: { type: [ImageSchema], default: [] },

    // 🧭 Alineación del texto
    alignInfo: {
        type: String,
        enum: ["left", "center", "right"],
        default: "left",
        required: true,
    },

    // 💲 Precio destacado (opcional)
    price: { type: Number, default: 0 },

    // 🔗 Enlaces / destino del banner (opcional)
    linkType: {
        type: String,
        enum: ["none", "category", "subcategory", "thirdsubcategory", "product", "url"],
        default: "none",
    },
    linkTargetId: { type: String, default: "" },   // mantiene compatibilidad si guardas ids como string
    linkUrl: { type: String, default: "" },        // para link externo

    // 🗂️ Compatibilidad con tu modelo actual
    catId: { type: String, default: "" },
    subCatId: { type: String, default: "" },
    thirdsubCatId: { type: String, default: "" },

    // 📱 Visibilidad por dispositivo (opcional)
    visibility: { type: String, enum: ["both", "web", "mobile"], default: "both" },

    // 🚦 Estado de publicación
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
    publishAt: { type: Date },    // publicación programada
    expireAt: { type: Date },     // fecha de expiración (se puede añadir TTL parcial si quieres)

    // 🧮 Orden en el carrusel/lista
    priority: { type: Number, default: 0, index: true },

    // ⚙️ Activación rápida
    isActive: { type: Boolean, default: true, index: true },

}, { timestamps: true });

// Índices compuestos útiles para consultas en panel/tienda
BannerSchema.index({ storeId: 1, status: 1, priority: 1 });
BannerSchema.index({ storeId: 1, isActive: 1 });
BannerSchema.index({ bannerTitle: "text", subtitle: "text" }); // búsqueda

const BannerModel = mongoose.model("Banner", BannerSchema);
export default BannerModel;
