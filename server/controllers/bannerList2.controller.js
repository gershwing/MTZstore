// server/controllers/bannerList2.controller.js
import BannerList2Model from '../models/bannerList2.model.js';
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
// ✅ Prioriza req.tenant.storeId (withTenant), mantiene compat con legacy
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

/** Deriva public_id desde una URL de Cloudinary (con carpetas y sin extensión) */
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

// Filtros de visibilidad para scope público (solo si el esquema tiene esos campos)
function buildVisibilityFilter(req) {
    const f = {};
    const scope = req.query?.scope;
    const statusQ = req.query?.status;
    const has = (k) => Boolean(BannerList2Model?.schema?.paths?.[k]);

    if (has('status')) {
        f.status = statusQ ? statusQ : (scope === 'public' ? 'published' : undefined);
        if (f.status === undefined) delete f.status;
    }
    if (scope === 'public' && has('isActive')) f.isActive = true;
    if (scope === 'public' && has('visibility')) f.visibility = 'public';

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

function applyPublicCache(res, req) {
    if (req.query?.scope === 'public') {
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    }
}

// ============ Subida de imágenes (Cloudinary) ============
export async function uploadImages(req, res, next) {
    try {
        const files = req.files || [];
        if (!files.length) throw ERR.VALIDATION({ files: 'No se recibieron archivos' });

        const storeId = resolveStoreId(req);
        const folder = storeId ? `banners/list2/${storeId}` : 'banners/list2';
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
        if (!storeId && !isSuperAdmin(req)) {
            throw ERR.VALIDATION({ storeId: 'requerido' });
        }

        const { images = [], catId, subCatId, thirdsubCatId } = req.body;

        const banner = new BannerList2Model({
            storeId: isSuperAdmin(req) ? (req.body.storeId || storeId) : storeId,
            createdBy: req.userId || req.user?._id || null,
            images,
            catId,
            subCatId,
            thirdsubCatId,
        });

        const saved = await banner.save();
        return res.created(saved);
    } catch (e) { return next(e); }
}

// ============ Listar (scoped por tienda + público/admin) ============
export async function getBanners(req, res, next) {
    try {
        const storeId = resolveStoreId(req);
        const base = isSuperAdmin(req)
            ? {}
            : { storeId: storeId ?? null }; // permite banners globales (storeId null)

        // status/visibility/activo
        const vis = buildVisibilityFilter(req);

        // combinamos base + visibilidad
        let filter = { ...base, ...vis };

        // ✅ si es scope público, imponemos ventana temporal
        if (req.query?.scope === 'public') {
            filter = enforcePublicWindow(filter, BannerList2Model.schema.paths);
        }

        const banners = await BannerList2Model
            .find(filter)
            .sort({ createdAt: -1 });

        applyPublicCache(res, req);
        return res.ok(banners);
    } catch (e) { return next(e); }
}

// ============ Obtener uno (scoped + público/admin) ============
export async function getBanner(req, res, next) {
    try {
        const storeId = resolveStoreId(req);

        let filter = { _id: req.params.id };
        if (!isSuperAdmin(req)) {
            filter.storeId = storeId ?? null;
        }

        // status/visibility/activo
        Object.assign(filter, buildVisibilityFilter(req));

        // ✅ si es scope público, imponemos ventana temporal
        if (req.query?.scope === 'public') {
            filter = enforcePublicWindow(filter, BannerList2Model.schema.paths);
        }

        const banner = await BannerList2Model.findOne(filter);
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

        const banner = await BannerList2Model.findOne(filter);
        if (!banner) throw ERR.NOT_FOUND('Banner not found!');

        const images = Array.isArray(banner.images) ? banner.images : [];
        await Promise.all(images.map((imgUrl) => {
            const publicId = publicIdFromUrl(imgUrl);
            return publicId ? cloudinary.uploader.destroy(publicId).catch(() => { }) : Promise.resolve();
        }));

        await BannerList2Model.deleteOne({ _id: banner._id });
        return res.ok({ message: 'Banner Deleted!' });
    } catch (e) { return next(e); }
}

// ============ Actualizar (scoped + auditoría) ============
export async function updatedBanner(req, res, next) {
    try {
        const storeId = resolveStoreId(req);
        const filter = { _id: req.params.id };
        if (!isSuperAdmin(req)) filter.storeId = storeId ?? null;

        const { images, catId, subCatId, thirdsubCatId } = req.body;

        const updateDoc = {
            ...(Array.isArray(images) ? { images } : {}),
            ...(catId !== undefined ? { catId } : {}),
            ...(subCatId !== undefined ? { subCatId } : {}),
            ...(thirdsubCatId !== undefined ? { thirdsubCatId } : {}),
            updatedBy: req.userId || req.user?._id || null,
        };

        const banner = await BannerList2Model.findOneAndUpdate(filter, updateDoc, { new: true, runValidators: true });
        if (!banner) throw ERR.NOT_FOUND('banner cannot be updated!');

        return res.ok({ banner, message: 'banner updated successfully' });
    } catch (e) { return next(e); }
}
