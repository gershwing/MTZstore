// server/controllers/logo.controller.js
import LogoModel from '../models/logo.model.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { ERR } from '../utils/httpError.js';

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

/* ===========================
 * Helpers
 * =========================== */

const bestUrl = (obj) => (obj?.secure_url || obj?.secureUrl || obj?.url || obj?.logo || '');

const unlinkSafe = async (p) => {
    if (!p) return;
    try {
        await fs.promises.unlink(p);
    } catch (_) { }
};

/** Deriva carpeta destino en Cloudinary según alcance */
function resolveCloudFolder(storeId) {
    if (storeId) return `logos/store_${String(storeId)}`;
    return 'logos/platform';
}

/** Estándar de respuesta para un logo (compat: siempre expone "logo") */
function normalizeLogoDoc(doc) {
    if (!doc) return null;
    return {
        ...doc,
        logo: doc.logo || doc.secureUrl || doc.url || '',
    };
}

/* ===========================
 * Upload de imágenes (Cloudinary)
 * =========================== */
export async function uploadImages(req, res, next) {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            throw ERR.VALIDATION({ files: 'No se recibieron imágenes' });
        }

        const folder = resolveCloudFolder(req.storeId);
        const options = {
            use_filename: true,
            unique_filename: true, // mejor true para evitar colisiones
            overwrite: false,
            folder,
        };

        const out = [];
        for (const f of files) {
            const localPath = f?.path || path.join('uploads', f?.filename || '');
            const result = await cloudinary.uploader.upload(localPath, options);

            out.push({
                secureUrl: result.secure_url || '',
                url: result.url || '',
                publicId: result.public_id || '',
                width: result.width || 0,
                height: result.height || 0,
                format: result.format || '',
                bytes: result.bytes || 0,
                etag: result.etag || '',
                folder,
            });

            await unlinkSafe(localPath);
        }

        return res.created({
            images: out,
            storeId: req.storeId || null,
        });
    } catch (e) {
        return next(e);
    }
}

/* ===========================
 * Crear logo (platform/store) - Idempotente
 * =========================== */
export async function addLogo(req, res, next) {
    try {
        // Puede venir:
        // - body.logo: string URL
        // - body.secureUrl/url/publicId... (payload de Cloudinary)
        let { logo, secureUrl, url, publicId, width, height, format, bytes, etag } = req.body || {};

        const payload = {
            logo: logo || secureUrl || url || '',
            secureUrl: secureUrl || '',
            url: url || '',
            publicId: publicId || '',
            width: Number(width) || 0,
            height: Number(height) || 0,
            format: format || '',
            bytes: Number(bytes) || 0,
            etag: etag || '',
            isActive: true,
        };

        const isStoreScope = Boolean(req.storeId);
        let saved;

        if (isStoreScope) {
            saved = await LogoModel.setLogoForStore(req.storeId, payload);
        } else {
            saved = await LogoModel.setPlatformLogo(payload);
        }

        res.set('Cache-Control', 'no-store');
        return res.created({
            message: 'Logo saved successfully',
            logo: normalizeLogoDoc(saved?.toJSON?.() || saved),
        });
    } catch (e) {
        return next(e);
    }
}

/* ===========================
 * Leer logo(s)
 * =========================== */
export async function getLogo(req, res, next) {
    try {
        const { latest = 'false', effective = 'false', scope } = req.query || {};
        const wantLatest = String(latest).toLowerCase() === 'true';
        const wantEffective = String(effective).toLowerCase() === 'true';

        // 1) effective=true: regresa el logo efectivo (store o platform)
        if (wantEffective) {
            const doc = await LogoModel.getEffectiveLogo(req.storeId || null);
            res.set('Cache-Control', 'no-store');
            return res.ok({ logo: doc ? normalizeLogoDoc(doc) : null });
        }

        // 2) listado filtrado
        const filter = {};
        if (req.storeId) {
            filter.scope = 'store';
            filter.storeId = req.storeId;
        } else if (scope === 'platform') {
            filter.scope = 'platform';
        } else if (scope === 'store') {
            // si piden explícitamente store pero no hay storeId ⇒ no devolvemos nada
            filter.scope = 'store';
            filter.storeId = null; // no matcheará nada
        }
        // si no viene nada, devuelve ambos (platform + store) ordenados por fecha

        const logos = await LogoModel.find(filter).sort({ createdAt: -1 }).lean();
        res.set('Cache-Control', 'no-store');

        if (wantLatest) {
            const latestDoc = logos[0] || null;
            return res.ok({ logo: latestDoc ? normalizeLogoDoc(latestDoc) : null });
        }

        return res.ok({ logo: logos.map((d) => normalizeLogoDoc(d)) });
    } catch (e) {
        return next(e);
    }
}

/* ===========================
 * Leer por ID (validando tienda)
 * =========================== */
export async function getLogoById(req, res, next) {
    try {
        const { id } = req.params;
        const filter = { _id: id };

        // Si viene store en req, garantizamos que el doc pertenece a esa tienda o es platform:
        if (req.storeId) {
            // permitimos leer platform también, por si quieres usarlo como fallback
            // Si quieres restringir estrictamente a la tienda, en vez de $or usa:
            //   filter.storeId = req.storeId; filter.scope = 'store';
            Object.assign(filter, { $or: [{ scope: 'store', storeId: req.storeId }, { scope: 'platform' }] });
        }

        const doc = await LogoModel.findOne(filter).lean();
        if (!doc) throw ERR.NOT_FOUND('The logo with the given ID was not found.');

        res.set('Cache-Control', 'no-store');
        return res.ok({ logo: normalizeLogoDoc(doc) });
    } catch (e) {
        return next(e);
    }
}

/* ===========================
 * Actualizar por ID (validando tienda)
 * =========================== */
export async function updatedLogo(req, res, next) {
    try {
        const { id } = req.params;
        let { logo, secureUrl, url, publicId, width, height, format, bytes, etag, isActive } = req.body || {};

        const set = {};
        const candidate = logo || secureUrl || url || '';
        if (!candidate) throw ERR.VALIDATION("Provide a valid 'logo' (logo | secureUrl | url).");

        set.logo = candidate;
        if (secureUrl !== undefined) set.secureUrl = secureUrl || '';
        if (url !== undefined) set.url = url || '';
        if (publicId !== undefined) set.publicId = publicId || '';
        if (width !== undefined) set.width = Number(width) || 0;
        if (height !== undefined) set.height = Number(height) || 0;
        if (format !== undefined) set.format = format || '';
        if (bytes !== undefined) set.bytes = Number(bytes) || 0;
        if (etag !== undefined) set.etag = etag || '';
        if (typeof isActive === 'boolean') set.isActive = isActive;

        const filter = { _id: id };
        if (req.storeId) {
            // Sólo permite actualizar si pertenece a la tienda (o es platform si decides permitirlo)
            Object.assign(filter, { $or: [{ scope: 'store', storeId: req.storeId }, { scope: 'platform' }] });
        }

        const updated = await LogoModel.findOneAndUpdate(filter, { $set: set }, { new: true, runValidators: true }).lean();
        if (!updated) throw ERR.NOT_FOUND('Logo not found or not accessible for this store.');

        res.set('Cache-Control', 'no-store');
        return res.ok({ logo: normalizeLogoDoc(updated), message: 'Logo updated successfully' });
    } catch (e) {
        return next(e);
    }
}

/* ===========================
 * Borrar imagen en Cloudinary
 * =========================== */
export async function removeImageFromCloudinary(req, res, next) {
    try {
        const imgUrl = req.query.img;
        if (!imgUrl) throw ERR.VALIDATION('Image URL is required in query (?img=...)');

        // Extraer public_id robusto
        let publicId = null;
        try {
            const u = new URL(imgUrl);
            const marker = '/upload/';
            const idx = u.pathname.indexOf(marker);
            if (idx === -1) throw new Error('no-upload-marker');

            let after = u.pathname.substring(idx + marker.length); // v123/folder/file.jpg
            after = after.replace(/^v\d+\/+/, ''); // folder/file.jpg
            publicId = after.replace(/\.[^/.]+$/, ''); // folder/file
        } catch {
            // fallback legacy: último segmento sin extensión
            const image = (imgUrl.split('/').pop() || '').split('?')[0];
            publicId = image.replace(/\.[^/.]+$/, '');
        }

        if (!publicId) throw ERR.VALIDATION('Invalid image URL format');

        const result = await cloudinary.uploader.destroy(publicId);
        if (result?.result === 'not found') throw ERR.NOT_FOUND('Image not found in Cloudinary');

        return res.ok({ message: 'Image removed successfully', result });
    } catch (e) {
        return next(e);
    }
}
