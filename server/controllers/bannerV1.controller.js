// server/controllers/bannerV1.controller.js
import BannerV1Model from '../models/bannerV1.model.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { ERR } from '../utils/httpError.js';

// ============ Cloudinary ============
cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

// ============ Helpers ============
// ✅ Preferimos req.tenant.storeId (inyectado por withTenant), y mantenemos compat
function resolveStoreId(req) {
    return req?.tenant?.storeId
        || req.storeId
        || req.user?.storeId
        || req.headers['x-store-id']
        || null;
}

// ¿Es SUPER_ADMIN?
function isSuperAdmin(req) {
    return req.user?.role === 'SUPER_ADMIN';
}

// Filtros seguros para "scope=public" y "status"
function buildVisibilityFilter(req) {
    const f = {};
    const scope = req.query?.scope;
    const statusQ = req.query?.status;

    const has = (k) => Boolean(BannerV1Model?.schema?.paths?.[k]);

    // Si el esquema tiene "status", forzamos 'published' por defecto en público
    if (has('status')) {
        if (statusQ) f.status = statusQ;
        else if (scope === 'public') f.status = 'published';
    }

    // Si existe "isActive" en el esquema, marcamos activo en público
    if (scope === 'public' && has('isActive')) {
        f.isActive = true;
    }

    // Si existe "visibility" en el esquema, marcamos público
    if (scope === 'public' && has('visibility')) {
        f.visibility = 'public';
    }

    return f;
}

/**
 * ✅ Helper genérico para respetar ventana de publicación en scope público
 * - publishAt: null o <= now
 * - expireAt:  null o  > now
 * - (Compat) publishedAt para Blog; aquí se aplica solo si existe en el schema
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
    if (has('publishedAt')) { // por compatibilidad con Blog
        filter.publishedAt = { $lte: now };
    }
    return filter;
}

// Añade headers de caché solo para lecturas públicas (opcional)
function applyPublicCache(res, req) {
    if (req.query?.scope === 'public') {
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    }
}

// Obtiene el public_id desde una URL de Cloudinary, preservando carpetas.
function publicIdFromUrl(url) {
    try {
        const afterUpload = url.split('/upload/')[1];
        if (!afterUpload) return '';
        const noVersion = afterUpload.replace(/^v\d+\//, '');
        const noExt = noVersion.replace(/\.[^/.]+$/, '');
        return noExt;
    } catch {
        return '';
    }
}

// ============ Subida de imágenes ============
export async function uploadImages(req, res, next) {
    try {
        const files = req.files || [];
        if (!files.length) throw ERR.VALIDATION({ files: 'No se recibieron archivos' });

        const storeId = resolveStoreId(req);
        const folder = storeId ? `banners/${storeId}` : 'banners';
        const options = { folder, use_filename: true, unique_filename: false, overwrite: false };

        const uploads = await Promise.all(files.map((f) => cloudinary.uploader.upload(f.path, options)));
        await Promise.all(files.map((f) => fs.promises.unlink(f.path).catch(() => { })));

        const images = uploads.map((u) => u.secure_url);
        return res.ok({ images });
    } catch (e) { return next(e); }
}

// ============ Crear ============
export async function addBanner(req, res, next) {
    try {
        const storeId = resolveStoreId(req);
        if (!storeId && !isSuperAdmin(req)) throw ERR.VALIDATION({ storeId: 'requerido' });

        const {
            bannerTitle,
            images = [],
            catId,
            subCatId,
            thirdsubCatId,
            price,
            alignInfo,
        } = req.body;

        const doc = new BannerV1Model({
            storeId: isSuperAdmin(req) ? (req.body.storeId || storeId) : storeId,
            createdBy: req.userId || req.user?._id || null,
            bannerTitle,
            images,
            catId,
            subCatId,
            thirdsubCatId,
            price,
            alignInfo,
        });

        const saved = await doc.save();
        return res.created(saved);
    } catch (e) { return next(e); }
}

// ============ Listar (scoped por tienda) ============
export async function getBanners(req, res, next) {
    try {
        const storeId = resolveStoreId(req);

        // Base: SUPER_ADMIN ve todo; resto scoping por tienda (null = global)
        const base = isSuperAdmin(req)
            ? {}
            : { storeId: storeId ?? null };

        // Visibilidad pública/admin en función del query + esquema
        const vis = buildVisibilityFilter(req);

        // combinamos base + visibilidad
        let filter = { ...base, ...vis };

        // ✅ si es scope público, imponemos ventana temporal
        if (req.query?.scope === 'public') {
            filter = enforcePublicWindow(filter, BannerV1Model.schema.paths);
        }

        const banners = await BannerV1Model
            .find(filter)
            .sort({ createdAt: -1 });

        applyPublicCache(res, req);
        return res.ok(banners);
    } catch (e) { return next(e); }
}

// ============ Obtener uno (scoped) ============
export async function getBanner(req, res, next) {
    try {
        const storeId = resolveStoreId(req);

        // Base por id + scoping de tienda
        let filter = { _id: req.params.id };
        if (!isSuperAdmin(req)) {
            filter.storeId = storeId ?? null;
        }

        // Si es público y el esquema lo soporta, aplicamos visibilidad/estado
        Object.assign(filter, buildVisibilityFilter(req));

        // ✅ si es scope público, imponemos ventana temporal
        if (req.query?.scope === 'public') {
            filter = enforcePublicWindow(filter, BannerV1Model.schema.paths);
        }

        const banner = await BannerV1Model.findOne(filter);
        if (!banner) throw ERR.NOT_FOUND('The banner with the given ID was not found.');

        applyPublicCache(res, req);
        return res.ok(banner);
    } catch (e) { return next(e); }
}

// ============ Eliminar (scoped) ============
export async function deleteBanner(req, res, next) {
    try {
        const storeId = resolveStoreId(req);
        const filter = { _id: req.params.id };
        if (!isSuperAdmin(req)) filter.storeId = storeId ?? null;

        const banner = await BannerV1Model.findOne(filter);
        if (!banner) throw ERR.NOT_FOUND('Banner not found!');

        const images = Array.isArray(banner.images) ? banner.images : [];
        await Promise.all(
            images.map((imgUrl) => {
                const publicId = publicIdFromUrl(imgUrl);
                return publicId ? cloudinary.uploader.destroy(publicId).catch(() => { }) : Promise.resolve();
            })
        );

        await BannerV1Model.deleteOne({ _id: banner._id });
        return res.ok({ message: 'Banner Deleted!' });
    } catch (e) { return next(e); }
}

// ============ Actualizar (scoped + auditoría) ============
export async function updatedBanner(req, res, next) {
    try {
        const storeId = resolveStoreId(req);
        const filter = { _id: req.params.id };
        if (!isSuperAdmin(req)) filter.storeId = storeId ?? null;

        const {
            bannerTitle,
            images,
            catId,
            subCatId,
            thirdsubCatId,
            price,
            alignInfo,
        } = req.body;

        const updateDoc = {
            ...(bannerTitle !== undefined ? { bannerTitle } : {}),
            ...(Array.isArray(images) ? { images } : {}),
            ...(catId !== undefined ? { catId } : {}),
            ...(subCatId !== undefined ? { subCatId } : {}),
            ...(thirdsubCatId !== undefined ? { thirdsubCatId } : {}),
            ...(price !== undefined ? { price } : {}),
            ...(alignInfo !== undefined ? { alignInfo } : {}),
            updatedBy: req.userId || req.user?._id || null,
        };

        const banner = await BannerV1Model.findOneAndUpdate(filter, updateDoc, { new: true, runValidators: true });
        if (!banner) throw ERR.NOT_FOUND('banner cannot be updated!');

        return res.ok({ banner, message: 'banner updated successfully' });
    } catch (e) { return next(e); }
}
