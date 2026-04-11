import CategoryModel from '../models/category.model.js';

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { ERR } from '../utils/httpError.js';

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

const ALLOWED_MIME = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

// --- image upload ---
export async function uploadImages(req, res, next) {
    const files = req.files || [];
    const userId = req.userId || null;                 // puede no estar si no exiges auth
    const storeId = req?.tenant?.storeId || req.storeId || null; // preferimos withTenant
    const folder = `mtz/categories/${storeId ? String(storeId) : "global"}`;

    if (!files.length) return next(ERR.VALIDATION({ files: "No se recibieron archivos" }));

    const invalid = files.find(f => !ALLOWED_MIME.has(f.mimetype));
    if (invalid) {
        await Promise.all(files.map(f => f?.path ? fs.promises.unlink(f.path).catch(() => { }) : null));
        return next(ERR.UNSUPPORTED_MEDIA_TYPE(`Tipo de archivo no soportado: ${invalid.mimetype}`));
    }

    const optionsBase = {
        folder,
        use_filename: true,
        unique_filename: false,   // mantiene comportamiento legacy
        overwrite: false,
        resource_type: "image",
        context: {
            storeId: storeId ? String(storeId) : "global",
            uploadedBy: userId ? String(userId) : "unknown",
            scope: "category",
        },
    };

    try {
        const uploaded = await Promise.all(
            files.map(async (file) => {
                const result = await cloudinary.uploader.upload(file.path, optionsBase);
                await fs.promises.unlink(file.path).catch(() => { });
                return {
                    url: result.secure_url,
                    publicId: result.public_id,
                    bytes: result.bytes,
                    format: result.format,
                    width: result.width,
                    height: result.height,
                    folder: result.folder,
                };
            })
        );

        const legacyUrls = uploaded.map(u => u.url);

        return res.created({
            images: legacyUrls,          // payload legacy
            imagesDetailed: uploaded,    // extra opcional
            meta: {
                count: uploaded.length,
                storeId: storeId ? String(storeId) : null,
                folder,
            },
        });
    } catch (e) {
        await Promise.all(files.map(f => f?.path ? fs.promises.unlink(f.path).catch(() => { }) : null));
        return next(ERR.SERVER(e?.message || "Error subiendo imágenes"));
    }
}

// --- create category ---
export async function createCategory(req, res, next) {
    try {
        const storeId = req?.tenant?.storeId || req.storeId || null; // multitienda (compat global)
        const userId = req.userId || null;                          // auditoría ligera

        const { name, parentId = null, parentCatName = "" } = req.body || {};

        let images = Array.isArray(req.body?.images) ? req.body.images : [];
        if ((!images || images.length === 0) && Array.isArray(req.body?.imagesDetailed)) {
            images = req.body.imagesDetailed.map(x => x?.url).filter(Boolean);
        }

        if (!name || typeof name !== "string") throw ERR.VALIDATION({ name: "Nombre de categoría requerido" });

        // Si hay parentId, debe existir en la misma tienda (o global si usas globales)
        if (parentId) {
            const parent = await CategoryModel.findOne({ _id: parentId, storeId });
            if (!parent) throw ERR.VALIDATION("ParentId inválido o pertenece a otra tienda");
        }

        let category = new CategoryModel({
            name: name.trim(),
            images,
            parentId,
            parentCatName,
            storeId,
            createdBy: userId,
        });

        category = await category.save();
        return res.created({ message: "Category created", category });
    } catch (e) {
        // E11000 índice único (por tienda/padre/nombre)
        if (e && e.code === 11000) return next(ERR.CONFLICT("Ya existe una categoría con ese nombre en este nivel"));
        return next(e);
    }
}

// --- get Categories ---
export async function getCategories(req, res, next) {
    try {
        const storeId = req?.tenant?.storeId || req.storeId || null;
        const scope = (req.query?.scope || "").toLowerCase(); // "", "store", "all"

        let storeFilter = {};
        if (scope === "all") {
            storeFilter = {};
        } else if (scope === "store") {
            if (!storeId) throw ERR.VALIDATION("Falta storeId para scope=store (usa x-store-id o /:storeId con withTenant)");
            storeFilter = { storeId };
        } else {
            // Default: si hay tenant, tienda + global; si no, todas
            storeFilter = storeId ? { storeId: { $in: [storeId, null] } } : {};
        }

        const categories = await CategoryModel.find(storeFilter).lean();
        const categoryMap = {};
        categories.forEach(cat => { categoryMap[cat._id] = { ...cat, children: [] }; });

        const rootCategories = [];
        categories.forEach(cat => {
            if (cat.parentId) {
                if (categoryMap[cat.parentId]) categoryMap[cat.parentId].children.push(categoryMap[cat._id]);
                else rootCategories.push(categoryMap[cat._id]); // parent perdido → tratar como raíz
            } else {
                rootCategories.push(categoryMap[cat._id]);
            }
        });

        return res.ok(rootCategories);
    } catch (e) { return next(e); }
}

// --- get category count ---
export async function getCategoriesCount(req, res, next) {
    try {
        const rootFilter = { $or: [{ parentId: null }, { parentId: { $exists: false } }] };
        const scope = (req.query?.scope || "").toLowerCase(); // "", "store", "all"
        const storeId = req?.tenant?.storeId || req.storeId || null;

        let storeFilter = {};
        if (scope === "all") {
            storeFilter = {};
        } else if (scope === "store") {
            if (!storeId) throw ERR.VALIDATION("Falta storeId para scope=store (usa x-store-id o /:storeId con withTenant)");
            storeFilter = { storeId };
        } else {
            storeFilter = storeId ? { storeId: { $in: [storeId, null] } } : {};
        }

        const categoryCount = await CategoryModel.countDocuments({ ...rootFilter, ...storeFilter });
        return res.ok({ categoryCount });
    } catch (e) { return next(e); }
}

// --- get sub category count ---
export async function getSubCategoriesCount(req, res, next) {
    try {
        const storeId = req?.tenant?.storeId || req.storeId || null;
        const scope = (req.query?.scope || "").toLowerCase(); // "", "store", "all"

        const subFilter = { parentId: { $exists: true } };

        let storeFilter = {};
        if (scope === "all") {
            storeFilter = {};
        } else if (scope === "store") {
            if (!storeId) throw ERR.VALIDATION("Falta storeId para scope=store (usa x-store-id o /:storeId con withTenant)");
            storeFilter = { storeId };
        } else {
            storeFilter = storeId ? { storeId: { $in: [storeId, null] } } : {};
        }

        const SubCategoryCount = await CategoryModel.countDocuments({ ...subFilter, ...storeFilter });
        return res.ok({ SubCategoryCount });
    } catch (e) { return next(e); }
}


// get single category
export async function getCategory(req, res, next) {
    try {
        const storeId = req?.tenant?.storeId || req.storeId || null;
        const scope = (req.query?.scope || "").toLowerCase();

        const category = await CategoryModel.findById(req.params.id).lean();
        if (!category) throw ERR.NOT_FOUND("The category with the given ID was not found.");

        // ⛑️ Compat: si el schema no tiene storeId, no hacemos control de tenant
        const hasStoreField = Object.prototype.hasOwnProperty.call(category, "storeId");

        if (hasStoreField) {
            if (scope === "all") {
                // legacy: sin restricción por tienda
            } else if (scope === "store") {
                if (!storeId) throw ERR.VALIDATION("Falta storeId para scope=store (usa x-store-id o /:storeId con withTenant)");
                if (String(category.storeId) !== String(storeId)) {
                    throw ERR.FORBIDDEN("La categoría no pertenece a esta tienda");
                }
            } else {
                if (storeId) {
                    const isGlobal = category.storeId == null;
                    const belongsToStore = String(category.storeId) === String(storeId);
                    if (!isGlobal && !belongsToStore) throw ERR.FORBIDDEN("La categoría no pertenece a esta tienda");
                }
            }
        }

        return res.ok(category);
    } catch (e) { return next(e); }
}

export async function removeImageFromCloudinary(req, res, next) {
    try {
        const storeId = req?.tenant?.storeId || req.storeId || null;

        let publicId = (req.query.publicId || "").trim();
        const imgUrl = (req.query.img || "").trim();

        if (!publicId && !imgUrl) throw ERR.VALIDATION("Falta 'publicId' o 'img' en query");

        if (!publicId && imgUrl) {
            const decoded = decodeURIComponent(imgUrl);
            const m = decoded.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
            if (m && m[1]) publicId = m[1];
        }

        if (!publicId) throw ERR.VALIDATION("No se pudo resolver el publicId de la imagen");

        // 🔒 Guardarraíl multitienda (si hay tenant)
        if (storeId) {
            const expectedPrefix = `mtz/categories/${String(storeId)}`;
            if (!publicId.startsWith(expectedPrefix)) throw ERR.FORBIDDEN("La imagen no pertenece a esta tienda");
        }

        const resCld = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
            invalidate: true,
        });

        // Compat: antes devolvías el objeto tal cual; usamos res.ok
        return res.ok(resCld);
    } catch (e) { return next(e); }
}

export async function deleteCategory(req, res, next) {
    try {
        const storeId = req?.tenant?.storeId || req.storeId || null;
        const id = req.params.id;

        const baseFilter = { _id: id };
        const category = await CategoryModel.findOne(baseFilter).lean();
        if (!category) throw ERR.NOT_FOUND("Category not found!");

        const hasStoreField = Object.prototype.hasOwnProperty.call(category, "storeId");
        if (hasStoreField && storeId) {
            if (String(category.storeId) !== String(storeId)) {
                throw ERR.FORBIDDEN("La categoría no pertenece a esta tienda");
            }
        }

        // Subcategorías (nivel 1)
        const subCategory = await CategoryModel.find({
            parentId: id,
            ...(hasStoreField && storeId ? { storeId } : {}),
        }).lean();

        // Tercer nivel (nivel 2)
        const subIds = subCategory.map((s) => String(s._id));
        let thirdsubCategory = [];
        if (subIds.length) {
            thirdsubCategory = await CategoryModel.find({
                parentId: { $in: subIds },
                ...(hasStoreField && storeId ? { storeId } : {}),
            }).lean();
        }

        // Reunir imágenes para borrado en Cloudinary
        const allDocs = [category, ...subCategory, ...thirdsubCategory];
        const allImages = [];
        for (const doc of allDocs) {
            const imgs = Array.isArray(doc?.images) ? doc.images : [];
            for (const url of imgs) {
                if (!url) continue;
                let pid = null;
                try {
                    const decoded = decodeURIComponent(url);
                    const m = decoded.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
                    if (m && m[1]) pid = m[1];
                } catch { }
                if (!pid) {
                    const parts = String(url).split("/");
                    const last = parts[parts.length - 1] || "";
                    pid = last.split(".")[0];
                }
                if (pid) allImages.push(pid);
            }
        }

        await Promise.all(
            allImages.map((pid) =>
                cloudinary.uploader.destroy(pid, { resource_type: "image", invalidate: true }).catch(() => ({}))
            )
        );

        // Borrar terceras y segundas
        const thirdIdsToDelete = thirdsubCategory.map((t) => t._id);
        if (thirdIdsToDelete.length) await CategoryModel.deleteMany({ _id: { $in: thirdIdsToDelete } });
        if (subIds.length) await CategoryModel.deleteMany({ _id: { $in: subIds } });

        // Borrar raíz
        const deletedCat = await CategoryModel.findByIdAndDelete(id);
        if (!deletedCat) throw ERR.NOT_FOUND("Category not found!");

        return res.ok({ message: "Category Deleted!" });
    } catch (e) { return next(e); }
}

export async function updatedCategory(req, res, next) {
    try {
        const id = req.params.id;
        const storeId = req?.tenant?.storeId || req.storeId || null;
        const userId = req.userId || null;

        const existing = await CategoryModel.findById(id).lean();
        if (!existing) throw ERR.SERVER("Category cannot be updated!");

        const hasStoreField = Object.prototype.hasOwnProperty.call(existing, "storeId");
        if (hasStoreField && storeId) {
            if (String(existing.storeId) !== String(storeId)) {
                throw ERR.FORBIDDEN("La categoría no pertenece a esta tienda");
            }
        }

        const {
            name,
            parentId = existing.parentId ?? null,
            parentCatName = req.body.parentCatName ?? existing.parentCatName ?? "",
        } = req.body || {};

        let images = req.body?.images;
        if (!images || (Array.isArray(images) && images.length === 0)) {
            if (Array.isArray(req.body?.imagesDetailed)) {
                images = req.body.imagesDetailed.map(x => x?.url).filter(Boolean);
            }
        }

        if (name && typeof name !== "string") throw ERR.VALIDATION({ name: "Nombre inválido" });
        if (parentId && String(parentId) === String(id)) throw ERR.VALIDATION("parentId no puede ser la misma categoría");

        if (parentId) {
            const parent = await CategoryModel.findById(parentId).lean();
            if (!parent) throw ERR.VALIDATION("ParentId inválido");
            if (hasStoreField && storeId) {
                if (String(parent.storeId) !== String(storeId)) {
                    throw ERR.FORBIDDEN("El parentId pertenece a otra tienda");
                }
            }
        }

        const updateDoc = {};
        if (typeof name === "string") updateDoc.name = name.trim();
        if (typeof parentCatName === "string") updateDoc.parentCatName = parentCatName;
        if (Object.prototype.hasOwnProperty.call(req.body, "parentId")) {
            updateDoc.parentId = parentId || null;
        }
        if (typeof images !== "undefined") updateDoc.images = images;
        if (userId) updateDoc.updatedBy = userId;

        const category = await CategoryModel.findByIdAndUpdate(id, updateDoc, { new: true });
        if (!category) throw ERR.SERVER("Category cannot be updated!");

        return res.ok({ category, message: "Category updated successfully" });
    } catch (e) {
        if (e && e.code === 11000) return next(ERR.CONFLICT("Ya existe una categoría con ese nombre en este nivel"));
        return next(e);
    }
}