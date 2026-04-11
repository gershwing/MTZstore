// server/controllers/homeSlider.controller.js
import HomeSliderModel from "../models/homeSlider.model.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { ERR } from '../utils/httpError.js';

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

// ============ Helpers comunes (scope/tienda/visibilidad/ventana) ============
// ✅ Preferimos req.tenant.storeId (inyectado por withTenant), y mantenemos compat
function resolveStoreId(req) {
    return req?.tenant?.storeId
        || req.storeId
        || req.user?.storeId
        || req.headers['x-store-id']
        || null;
}

function isSuperAdmin(req) {
    return req.user?.role === 'SUPER_ADMIN';
}

// Filtros seguros para "scope=public" y "status/visibility/isActive"
function buildVisibilityFilter(req) {
    const f = {};
    const scope = (req.query?.scope || '').toLowerCase();
    const statusQ = req.query?.status;
    const has = (k) => Boolean(HomeSliderModel?.schema?.paths?.[k]);

    if (has('status')) {
        f.status = statusQ ? statusQ : (scope === 'public' ? 'published' : undefined);
        if (f.status === undefined) delete f.status;
    }
    if (scope === 'public' && has('isActive')) f.isActive = true;
    if (scope === 'public' && has('visibility')) f.visibility = 'public';

    return f;
}

/**
 * ✅ Respeta ventana temporal en lecturas públicas:
 *  - publishAt: null o <= now
 *  - expireAt:  null o  > now
 *  - (Compat) publishedAt si existiera (ej. Blog)
 */
function enforcePublicWindow(filter, schemaPaths) {
    const now = new Date();
    const has = (k) => Boolean(schemaPaths?.[k]);

    if (has('publishAt')) {
        filter.$and = filter.$and || [];
        filter.$and.push({ $or: [{ publishAt: null }, { publishAt: { $lte: now } }] });
    }
    if (has('expireAt')) {
        filter.$and = filter.$and || [];
        filter.$and.push({ $or: [{ expireAt: null }, { expireAt: { $gt: now } }] });
    }
    if (has('publishedAt')) {
        filter.publishedAt = { $lte: now };
    }
    return filter;
}

function applyPublicCache(res, req) {
    if ((req.query?.scope || '').toLowerCase() === 'public') {
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    }
}

// ============ Upload de imágenes (Cloudinary) ============
export async function uploadImages(req, res, next) {
    try {
        const files = req.files;

        if (!files || files.length === 0) {
            throw ERR.VALIDATION({ files: "No se recibieron imágenes" });
        }

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
            // folder: "mtzstore/home-slider",
        };

        const imagesArr = [];

        for (let i = 0; i < files.length; i++) {
            const result = await cloudinary.uploader.upload(files[i].path, options);
            imagesArr.push(result.secure_url);

            // eliminar archivo local sin romper si falla
            try {
                await fs.promises.unlink(`uploads/${files[i].filename}`);
            } catch (err) {
                console.error("unlink error:", err.message);
            }
        }

        return res.created({
            images: imagesArr,
            storeId: resolveStoreId(req) || null, // listo para multitienda vía withTenant
        });
    } catch (e) { return next(e); }
}

// ============ Crear slide ============
export async function addHomeSlide(req, res, next) {
    try {
        // Esperamos un array de URLs en body.images (proveniente de /uploadImages)
        let { images } = req.body;

        // Permitir single string o array
        if (typeof images === "string") images = [images];

        if (!Array.isArray(images) || images.length === 0) {
            throw ERR.VALIDATION("Provide 'images' as a non-empty array of URLs.");
        }

        // Sanitizar: solo strings no vacíos y únicos
        const cleanImages = [...new Set(images.filter((u) => typeof u === "string" && u.trim() !== ""))];
        if (cleanImages.length === 0) {
            throw ERR.VALIDATION("Images array has no valid URLs.");
        }

        const slide = await HomeSliderModel.create({
            storeId: resolveStoreId(req) || undefined, // multitienda (withTenant lo inyecta)
            images: cleanImages,
        });

        return res.created({ message: "Slide created", slide });
    } catch (e) { return next(e); }
}

// ============ Listar slides ============
export async function getHomeSlides(req, res, next) {
    try {
        // scope: "", "store", "all" (legacy) y ahora también "public"
        const scope = (req.query?.scope || "").toLowerCase();

        const storeId = resolveStoreId(req);
        const hasStoreField = !!HomeSliderModel?.schema?.path("storeId");

        // --- Base de scoping por tienda (se mantiene tu comportamiento legacy) ---
        let base = {};
        if (hasStoreField) {
            if (scope === "all") {
                base = {}; // legacy: sin restricción por tienda
            } else if (scope === "store") {
                if (!storeId) {
                    throw ERR.VALIDATION("Falta storeId para scope=store (usa x-store-id o withTenant)");
                }
                base = { storeId };
            } else {
                // default: si hay tenant → tienda actual + global; si no → todas (compat)
                base = storeId ? { storeId: { $in: [storeId, null] } } : {};
            }

            // Si NO es superadmin y hay tenant, reforzamos scoping seguro
            if (!isSuperAdmin(req) && storeId && scope !== "all") {
                // ya está incluido arriba; evitamos tocar legacy "all"
            }
        }

        // --- Visibilidad pública/admin ---
        const vis = buildVisibilityFilter(req);

        // Combinamos
        let filter = { ...base, ...vis };

        // ✅ si es scope público, imponemos ventana temporal
        if (scope === 'public') {
            filter = enforcePublicWindow(filter, HomeSliderModel.schema.paths);
        }

        const slides = await HomeSliderModel.find(filter).sort({ createdAt: -1 }).lean();
        if (!slides || slides.length === 0) {
            throw ERR.NOT_FOUND("slides not found");
        }

        applyPublicCache(res, req);
        return res.ok(slides);
    } catch (e) { return next(e); }
}

// ============ Obtener un slide ============
export async function getSlide(req, res, next) {
    try {
        const { id } = req.params;
        const scope = (req.query?.scope || "").toLowerCase();

        // 🧪 Validar formato del ObjectId para evitar cast errors
        if (!mongoose.isValidObjectId(id)) {
            throw ERR.VALIDATION({ id: "Invalid slide ID format." });
        }

        const storeId = resolveStoreId(req);

        // 🔎 Filtro por ID y, si aplica, por tienda (withTenant inyecta)
        let filter = { _id: id };
        if (!isSuperAdmin(req) && storeId && HomeSliderModel.schema.path("storeId")) {
            // Mantén compat: si no hay tenant configurado, no filtramos por tienda
            filter.storeId = { $in: [storeId, null] };
        }

        // Visibilidad pública/admin
        Object.assign(filter, buildVisibilityFilter(req));

        // ✅ si es scope público, imponemos ventana temporal
        if (scope === 'public') {
            filter = enforcePublicWindow(filter, HomeSliderModel.schema.paths);
        }

        const slide = await HomeSliderModel.findOne(filter).lean();
        if (!slide) throw ERR.NOT_FOUND("The slide with the given ID was not found.");

        applyPublicCache(res, req);
        return res.ok(slide);
    } catch (e) { return next(e); }
}

// ============ Eliminar una imagen de Cloudinary ============
export async function removeImageFromCloudinary(req, res, next) {
    try {
        const imgUrl = req.query.img || req.body?.img || "";
        const explicitPublicId = req.query.public_id || req.body?.public_id || "";

        if (!imgUrl && !explicitPublicId) {
            throw ERR.VALIDATION("Provide ?img=<cloudinary_url> or ?public_id=<public_id>");
        }

        let publicId = explicitPublicId;
        if (!publicId && imgUrl) {
            try {
                const u = new URL(imgUrl);
                const pathname = u.pathname; // /.../image/upload/v123/folder/file.jpg
                const marker = "/upload/";
                const at = pathname.indexOf(marker);
                if (at === -1) throw ERR.VALIDATION("Invalid Cloudinary URL: missing /upload/ segment");
                let after = pathname.substring(at + marker.length); // v123/folder/file.jpg
                after = after.replace(/^v\d+\/+/, "");              // folder/file.jpg
                publicId = after.replace(/\.[^/.]+$/, "");          // folder/file
            } catch {
                throw ERR.VALIDATION("Invalid image URL");
            }
        }

        if (!publicId) throw ERR.VALIDATION("Could not derive public_id from the given parameters");

        const result = await cloudinary.uploader.destroy(publicId);

        // { result: 'ok' } | { result: 'not found' } | { result: 'deleted' }
        if (result?.result === "not found") throw ERR.NOT_FOUND("Image not found in Cloudinary");

        if (result?.result === "ok" || result?.result === "deleted") {
            return res.ok({ message: "Image removed successfully", result });
        }

        throw ERR.SERVER("Unexpected Cloudinary response", result);
    } catch (e) { return next(e); }
}

// ============ Eliminar un slide (y sus imágenes) ============
export async function deleteSlide(req, res, next) {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) throw ERR.VALIDATION({ id: "Invalid slide ID format." });

        const storeId = resolveStoreId(req);

        const filter = { _id: id };
        if (!isSuperAdmin(req) && storeId && HomeSliderModel.schema.path("storeId")) {
            filter.storeId = { $in: [storeId, null] };
        }

        const slide = await HomeSliderModel.findOne(filter).lean();
        if (!slide) throw ERR.NOT_FOUND("slide not found!");

        const toPublicId = (imgUrl) => {
            try {
                const u = new URL(imgUrl);
                const marker = "/upload/";
                const idx = u.pathname.indexOf(marker);
                if (idx === -1) return null;
                let after = u.pathname.substring(idx + marker.length); // v1692/folder/file.jpg
                after = after.replace(/^v\d+\/+/, "");                 // folder/file.jpg
                return after.replace(/\.[^/.]+$/, "");                 // folder/file
            } catch { return null; }
        };

        const uniqueImages = Array.from(new Set(slide.images || []));
        const destroyResults = await Promise.allSettled(
            uniqueImages.map(async (imgUrl) => {
                const publicId = toPublicId(imgUrl);
                if (!publicId) return { result: "skip_invalid_url" };
                return await cloudinary.uploader.destroy(publicId);
            })
        );

        await HomeSliderModel.deleteOne({ _id: slide._id });

        return res.ok({
            message: "slide Deleted!",
            cloudinary: destroyResults.map((r) =>
                r.status === "fulfilled" ? r.value : { error: r.reason?.message || "destroy_failed" }
            ),
        });
    } catch (e) { return next(e); }
}

// ============ Actualizar imágenes de un slide ============
export async function updatedSlide(req, res, next) {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) throw ERR.VALIDATION({ id: "Invalid slide ID format." });

        let { images } = req.body;
        if (typeof images === "string") images = [images];
        if (!Array.isArray(images) || images.length === 0) {
            throw ERR.VALIDATION("Provide 'images' as a non-empty array of URLs.");
        }

        const cleanImages = [...new Set(images.filter(u => typeof u === "string" && u.trim() !== ""))];
        if (cleanImages.length === 0) throw ERR.VALIDATION("Images array has no valid URLs.");

        const storeId = resolveStoreId(req);

        const filter = { _id: id };
        if (!isSuperAdmin(req) && storeId && HomeSliderModel.schema.path("storeId")) {
            filter.storeId = { $in: [storeId, null] };
        }

        const updated = await HomeSliderModel.findOneAndUpdate(
            filter,
            { $set: { images: cleanImages, updatedBy: req.userId || req.user?._id || null } },
            { new: true, runValidators: true }
        );
        if (!updated) throw ERR.NOT_FOUND("slide not found or not accessible for this store.");

        return res.ok({ slide: updated, message: "slide updated successfully" });
    } catch (e) { return next(e); }
}

// ============ Eliminar múltiples slides (y sus imágenes) ============
export async function deleteMultipleSlides(req, res, next) {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            throw ERR.VALIDATION("Invalid input: 'ids' must be a non-empty array.");
        }

        const validIds = ids.filter((id) => mongoose.isValidObjectId(id));
        if (validIds.length === 0) throw ERR.VALIDATION("No valid MongoDB ObjectIds provided.");

        const storeId = resolveStoreId(req);

        const filter = { _id: { $in: validIds } };
        if (!isSuperAdmin(req) && storeId && HomeSliderModel.schema.path("storeId")) {
            // Restringe a la tienda actual + global
            filter.storeId = { $in: [storeId, null] };
        }

        const slides = await HomeSliderModel.find(filter).select("images").lean();
        if (!slides || slides.length === 0) {
            throw ERR.NOT_FOUND("No slides found for the provided IDs (or not accessible for this store).");
        }

        const toPublicId = (imgUrl) => {
            try {
                const u = new URL(imgUrl);
                const marker = "/upload/";
                const idx = u.pathname.indexOf(marker);
                if (idx === -1) return null;
                let after = u.pathname.substring(idx + marker.length);
                after = after.replace(/^v\d+\/+/, "");
                return after.replace(/\.[^/.]+$/, "");
            } catch { return null; }
        };

        const imageUrls = new Set();
        for (const s of slides) {
            (s.images || []).forEach((url) => {
                if (typeof url === "string" && url.trim()) imageUrls.add(url);
            });
        }

        const destroyResults = await Promise.allSettled(
            [...imageUrls].map(async (imgUrl) => {
                const publicId = toPublicId(imgUrl);
                if (!publicId) return { result: "skip_invalid_url" };
                return await cloudinary.uploader.destroy(publicId);
            })
        );

        const delResult = await HomeSliderModel.deleteMany({ _id: { $in: validIds } });

        const foundIds = new Set(slides.map((s) => s._id.toString()));
        const missingIds = validIds.filter((id) => !foundIds.has(id));

        return res.ok({
            message: "Slides deleted successfully",
            deletedCount: delResult?.deletedCount || 0,
            missingIds,
            cloudinary: destroyResults.map((r) =>
                r.status === "fulfilled" ? r.value : { error: r.reason?.message || "destroy_failed" }
            ),
        });
    } catch (e) { return next(e); }
}
