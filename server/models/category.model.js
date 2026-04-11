import mongoose from "mongoose";

const { Schema } = mongoose;

const categorySchema = new Schema({
    // 🏪 Tenant
    storeId: {
        type: Schema.Types.ObjectId,
        ref: "Store",
        default: null, // null = global (sólo SUPER_ADMIN debería gestionarlas)
        index: true,
    },

    // 📛 Identidad
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },

    // 🖼️ Medios
    images: [{ type: String, default: [] }],

    // 🌳 Jerarquía
    parentId: { type: Schema.Types.ObjectId, ref: "Category", default: null, index: true },
    parentCatName: { type: String, default: "" }, // opcional (compat)
    ancestors: [{
        _id: { type: Schema.Types.ObjectId, ref: "Category" },
        name: String,
        slug: String
    }],
    depth: { type: Number, default: 0 },          // 0 = raíz
    path: { type: String, default: "" },          // p.ej. "accesorios/iluminacion/led"

    // 👀 Visibilidad / orden
    status: { type: String, enum: ["active", "hidden", "archived"], default: "active", index: true },
    sortOrder: { type: Number, default: 0 },

    // 🧾 Auditoría
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },

    // 🗑️ Soft delete (opcional)
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

// 🔁 Slug mínimo (puedes reemplazar por slugify lib)
categorySchema.pre("validate", function (next) {
    if (!this.slug && this.name) {
        this.slug = String(this.name)
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9\-]/g, "");
    }
    next();
});

// 🌳 Mantener ancestors/depth/path coherentes
categorySchema.pre("save", async function (next) {
    if (!this.isModified("parentId") && !this.isModified("name") && !this.isModified("slug")) {
        return next();
    }

    if (!this.parentId) {
        this.ancestors = [];
        this.depth = 0;
        this.path = this.slug;
        return next();
    }

    const Parent = this.constructor;
    const parent = await Parent.findOne({ _id: this.parentId, storeId: this.storeId }, { ancestors: 1, slug: 1, name: 1 });
    if (!parent) {
        return next(new Error("Parent category not found in this store"));
    }

    this.ancestors = [...(parent.ancestors || []), { _id: parent._id, name: parent.name, slug: parent.slug }];
    this.depth = this.ancestors.length;
    this.path = `${this.ancestors.map(a => a.slug).join("/")}/${this.slug}`;
    next();
});

// 🧠 Índices (únicos por tienda)
// Evita nombres repetidos bajo el mismo padre en la misma tienda
categorySchema.index({ storeId: 1, parentId: 1, name: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
// Slug único por tienda dentro del mismo padre para URLs limpias
categorySchema.index({ storeId: 1, parentId: 1, slug: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
// Búsquedas por path dentro de la tienda
categorySchema.index({ storeId: 1, path: 1 });

const CategoryModel = mongoose.model("Category", categorySchema);
export default CategoryModel;
