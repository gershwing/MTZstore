// server/models/blog.model.js
import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
    {
        // 🔹 Multi-tenant
        storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true, index: true },

        // 🔹 Autoría
        authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

        // 🔹 Contenido principal
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, trim: true }, // único por tienda (ver índice)
        excerpt: { type: String, default: "" },             // resumen corto
        content: { type: String, default: "" },             // HTML/Markdown (según tu editor)

        // 🔹 Medios
        coverImage: { type: String, default: "" },          // portada
        images: [{ type: String }],                         // galería (Cloudinary IDs/URLs)

        // 🔹 Taxonomías
        tags: [{ type: String, trim: true, lowercase: true, index: true }],
        category: { type: String, default: "", index: true }, // simple; si luego usas ref -> CategoryBlog, se cambia

        // 🔹 Publicación
        status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
        visibility: { type: String, enum: ["public", "unlisted", "private"], default: "public", index: true },
        publishedAt: { type: Date },                        // set al publicar
        commentsEnabled: { type: Boolean, default: true },
        pinned: { type: Boolean, default: false, index: true }, // destacar

        // 🔹 SEO
        metaTitle: { type: String, default: "" },
        metaDescription: { type: String, default: "" },

        // 🔹 Analítica básica
        readTimeMin: { type: Number, default: 0 },          // estimación de lectura
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        commentsCount: { type: Number, default: 0 },

        // 🔹 Auditoría
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        deletedAt: { type: Date, default: null },           // soft delete opcional
        language: { type: String, default: "es" },          // i18n básica
    },
    { timestamps: true }
);

// Índice único por tienda para slug (multi-tenant safe)
BlogSchema.index({ storeId: 1, slug: 1 }, { unique: true });

// Búsquedas frecuentes
BlogSchema.index({ storeId: 1, status: 1, visibility: 1, publishedAt: -1 });
BlogSchema.index({ storeId: 1, pinned: 1, publishedAt: -1 });

// Utilidad: normalizar slug si no viene ya formateado
BlogSchema.pre("validate", function (next) {
    if (this.isModified("title") && !this.isModified("slug")) {
        const base = (this.title || "").toString().toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")   // quitar acentos
            .replace(/[^a-z0-9]+/g, "-")                        // no alfanum → guion
            .replace(/(^-|-$)+/g, "");
        if (base) this.slug = base;
    }
    if (this.slug) {
        this.slug = this.slug.toString().toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    }
    next();
});

// Helper de publicación: setea publishedAt si pasa a published
BlogSchema.pre("save", function (next) {
    if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});

const BlogModel = mongoose.model("Blog", BlogSchema);
export default BlogModel;
