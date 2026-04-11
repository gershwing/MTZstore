// server/controllers/blog.controller.js
import BlogModel from '../models/blog.model.js';
import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from "path";
import { ERR } from '../utils/httpError.js';

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

// ===== Helpers =====
function slugify(input = '') {
    return String(input)
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

// ✅ Prioriza storeId desde withTenant (req.tenant), mantiene compat con legacy
function resolveStoreId(req) {
    return req?.tenant?.storeId
        || req.storeId
        || req?.store?.id
        || req?.user?.storeId
        || req.query?.storeId
        || null;
}

// ¿Es SUPER_ADMIN?
function isSuperAdmin(req) {
    return req.user?.role === 'SUPER_ADMIN';
}

function toPublicId(item) {
    if (!item) return null;
    if (typeof item === "object" && item.public_id) return item.public_id;
    if (typeof item !== "string") return null;

    if (!item.startsWith("http")) return item.replace(/\.[a-zA-Z0-9]+$/, "");

    try {
        const u = new URL(item);
        let p = u.pathname.replace(/^\/+/g, "");
        p = p.replace(/^[^/]+\/image\/upload\//, "");
        p = p.replace(/^image\/upload\//, "");
        p = p.replace(/^v\d+\/+/, "");
        p = p.replace(/\.[a-zA-Z0-9]+$/, "");
        return p;
    } catch {
        return item.split("?")[0].replace(/^.*upload\//, "").replace(/\.[^./]+$/, "");
    }
}

// Cache HTTP para lecturas públicas (opcional)
function applyPublicCache(res, req) {
    if ((req.query?.scope || "public").toLowerCase() === "public") {
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    }
}

/** Filtros seguros de visibilidad/estado
 * - si scope=public y hay campos, fuerza status=published y visibility=public
 * - si scope!=public, respeta ?status y ?visibility (coma-separados)
 */
function buildVisibilityFilter(req) {
    const f = {};
    const scope = (req.query?.scope || "public").toLowerCase();
    const schema = BlogModel?.schema?.paths || {};
    const has = (k) => Boolean(schema[k]);

    const statusParam = (req.query?.status || "").trim();
    const visibilityParam = (req.query?.visibility || "").trim();

    if (has('status')) {
        if (scope === 'public') {
            f.status = 'published';
        } else if (statusParam) {
            const arr = statusParam.split(',').map(s => s.trim()).filter(Boolean);
            if (arr.length) f.status = { $in: arr };
        }
    }

    if (has('visibility')) {
        if (scope === 'public') {
            f.visibility = 'public';
        } else if (visibilityParam) {
            const arr = visibilityParam.split(',').map(s => s.trim()).filter(Boolean);
            if (arr.length) f.visibility = { $in: arr };
        }
    }

    return f;
}

/** ✅ Ventana pública:
 * - publishAt: null o <= now (si existe)
 * - expireAt:  null o  > now (si existe)
 * - publishedAt: <= now (Blog)
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
        // Si ya hay publishedAt en rango por parámetros, lo respetamos y sólo
        // agregamos el límite superior si no existe
        if (!filter.publishedAt) filter.publishedAt = {};
        if (filter.publishedAt.$lte === undefined) filter.publishedAt.$lte = now;
    }
    return filter;
}

// ===== Upload images =====
export async function uploadImages(req, res, next) {
    try {
        const files = req.files || [];
        const storeId = resolveStoreId(req) || "unknown";
        const scope = (req.query.scope || "common").toString().toLowerCase();

        if (!files.length) {
            throw ERR.VALIDATION({ files: "No se recibieron archivos" });
        }

        const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
        const MAX_SIZE_MB = Number(process.env.MAX_IMAGE_SIZE_MB || 8);

        const tooBig = files.find(f => (f.size || 0) > MAX_SIZE_MB * 1024 * 1024);
        if (tooBig) {
            await Promise.allSettled(files.map(f => f?.path ? fs.unlink(f.path).catch(() => { }) : null));
            throw ERR.PAYLOAD_TOO_LARGE(`Archivo demasiado grande: ${path.basename(tooBig.originalname || tooBig.filename)} (máx ${MAX_SIZE_MB}MB)`);
        }

        const invalid = files.find(f => !ALLOWED_MIME.has(f.mimetype));
        if (invalid) {
            await Promise.allSettled(files.map(f => f?.path ? fs.unlink(f.path).catch(() => { }) : null));
            throw ERR.UNSUPPORTED_MEDIA_TYPE(`Tipo de archivo no permitido: ${invalid.mimetype}`);
        }

        const folder = `mtz/${storeId}/${scope}`;
        const baseOptions = {
            folder,
            use_filename: true,
            unique_filename: false,
            overwrite: false,
            resource_type: "image",
            context: { storeId: String(storeId), scope, uploadedBy: String(req.userId || "") }
        };

        const uploads = await Promise.allSettled(
            files.map(async (file) => {
                const result = await cloudinary.uploader.upload(file.path, baseOptions);
                await fs.unlink(file.path).catch(() => { });
                return {
                    public_id: result.public_id,
                    url: result.secure_url,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                    bytes: result.bytes,
                    folder: result.folder,
                    original_filename: result.original_filename
                };
            })
        );

        const successful = [];
        const failed = [];
        uploads.forEach((r, i) => {
            if (r.status === "fulfilled") successful.push(r.value);
            else {
                failed.push({ file: files[i]?.originalname || files[i]?.filename, reason: r.reason?.message || String(r.reason || "unknown error") });
                files[i]?.path && fs.unlink(files[i].path).catch(() => { });
            }
        });

        if (!successful.length) {
            throw ERR.SERVER("No se pudieron subir las imágenes", { failed });
        }

        return res.ok({ count: successful.length, images: successful, failed: failed.length ? failed : undefined });
    } catch (e) { return next(e); }
}

// ===== Create =====
export async function addBlog(req, res, next) {
    try {
        const {
            title,
            description = '',
            content = '',
            excerpt = '',
            images = [],
            coverImage = '',
            tags = [],
            category = '',
            status = 'draft',
            visibility = 'public',
            slug
        } = req.body || {};

        if (!title || typeof title !== 'string') {
            throw ERR.VALIDATION({ title: 'El título es requerido' });
        }

        // ✅ usa resolveStoreId y mantiene compat con body.storeId
        const storeId = resolveStoreId(req) || req.body.storeId || null;
        const authorId = req.userId || req?.user?._id || null;

        if (!storeId) throw ERR.VALIDATION({ storeId: 'requerido (multi-tienda)' });
        if (!authorId) throw ERR.UNAUTHORIZED('authorId requerido (multiusuario)');

        const normalizedImages = Array.isArray(images)
            ? images.filter(Boolean).map(img => (typeof img === 'string' ? { url: img } : img))
            : [];

        const finalSlug = slug?.trim() ? slugify(slug) : slugify(title);

        const blogDoc = new BlogModel({
            storeId,
            authorId,
            title: title.trim(),
            description,
            content,
            excerpt,
            coverImage,
            images: normalizedImages,
            tags,
            category,
            status,
            visibility,
            slug: finalSlug
        });

        const saved = await blogDoc.save();
        return res.created(saved);
    } catch (e) { return next(e); }
}

// ===== List (public/internal + multitenant) =====
export async function getBlogs(req, res, next) {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const perPageRaw = parseInt(req.query.perPage);
        const perPage = Math.min(Math.max(perPageRaw || 10, 1), 50);

        const storeId = resolveStoreId(req);

        const q = (req.query.q || "").trim();
        const category = (req.query.category || "").trim();
        const tag = (req.query.tag || "").trim();

        const scope = (req.query.scope || "public").toLowerCase();

        const publishedFrom = req.query.publishedFrom ? new Date(req.query.publishedFrom) : null;
        const publishedTo = req.query.publishedTo ? new Date(req.query.publishedTo) : null;

        // --- base multitienda ---
        const base = {};
        if (storeId) base.storeId = storeId;

        // --- visibilidad (status/visibility) ---
        const vis = buildVisibilityFilter(req);

        // --- texto/categoría/tag ---
        const text = {};
        if (category) text.category = category;
        if (tag) text.tags = { $in: [tag.toLowerCase()] };
        if (q) {
            text.$or = [
                { title: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
                { excerpt: { $regex: q, $options: "i" } },
                { tags: { $regex: q, $options: "i" } }
            ];
        }

        // Combinar filtros
        let filter = { ...base, ...vis, ...text };

        // Rango de fechas solicitado por el cliente (sobre publishedAt)
        if (publishedFrom || publishedTo) {
            filter.publishedAt = filter.publishedAt || {};
            if (publishedFrom) filter.publishedAt.$gte = publishedFrom;
            if (publishedTo) filter.publishedAt.$lte = publishedTo;
        }

        // ✅ Si es público, aplicamos ventana temporal
        if (scope === "public") {
            filter = enforcePublicWindow(filter, BlogModel.schema.paths);
        }

        const sortParam = (req.query.sort || "").trim();
        let sort = { pinned: -1, publishedAt: -1, createdAt: -1 };
        if (sortParam) {
            sort = {};
            for (const token of sortParam.split(",")) {
                const [field, dir] = token.split(":");
                if (field) sort[field.trim()] = (dir || "desc").toLowerCase() === "asc" ? 1 : -1;
            }
        }

        const totalPosts = await BlogModel.countDocuments(filter);
        const totalPages = totalPosts ? Math.ceil(totalPosts / perPage) : 0;

        if (totalPages && page > totalPages) {
            throw ERR.NOT_FOUND("Page not found");
        }

        const skip = (page - 1) * perPage;
        const projection = "title slug excerpt coverImage images tags category status visibility publishedAt pinned createdAt";

        const blogs = await BlogModel.find(filter)
            .select(projection)
            .sort(sort)
            .skip(skip)
            .limit(perPage)
            .lean()
            .exec();

        applyPublicCache(res, req);
        return res.ok(blogs, {
            page,
            perPage,
            totalPages,
            totalPosts,
            hasNext: totalPages ? page < totalPages : false,
            hasPrev: page > 1
        });

    } catch (e) { return next(e); }
}

// ===== Get one (public/internal + multitenant) =====
export async function getBlog(req, res, next) {
    try {
        const param = req.params.id;  // ObjectId o slug
        const scope = (req.query.scope || "public").toLowerCase();
        const storeId = resolveStoreId(req);

        // base
        let filter = {};
        if (storeId) filter.storeId = storeId;

        const isObjectId = mongoose.isValidObjectId(param);
        if (isObjectId) filter._id = param;
        else filter.slug = String(param).toLowerCase().trim();

        // visibilidad
        Object.assign(filter, buildVisibilityFilter(req));

        // ventana pública
        if (scope === "public") {
            filter = enforcePublicWindow(filter, BlogModel.schema.paths);
        }

        const projection = null;
        const blog = await BlogModel.findOne(filter).select(projection).lean();

        if (!blog) throw ERR.NOT_FOUND("The blog with the given ID/slug was not found.");

        if (scope === "public") {
            BlogModel.updateOne({ _id: blog._id }, { $inc: { views: 1 } }).catch(() => { });
        }

        applyPublicCache(res, req);
        return res.ok(blog);
    } catch (e) { return next(e); }
}

// ===== Delete =====
export async function deleteBlog(req, res, next) {
    try {
        const { id } = req.params;
        const soft = String(req.query.soft || "false").toLowerCase() === "true";

        if (!mongoose.isValidObjectId(id)) throw ERR.VALIDATION({ id: "inválido" });

        const blog = await BlogModel.findById(id).lean();
        if (!blog) throw ERR.NOT_FOUND("Blog no encontrado");

        // ✅ Verificación multi-tienda con resolveStoreId
        const reqStoreId = resolveStoreId(req);
        if (reqStoreId && blog.storeId && String(blog.storeId) !== String(reqStoreId)) {
            throw ERR.FORBIDDEN("No tienes permiso para borrar este recurso (tienda distinta).");
        }

        if (soft) {
            await BlogModel.updateOne({ _id: id }, { $set: { deletedAt: new Date(), status: "archived" } });
            return res.ok({ message: "Blog archivado (soft delete)." });
        }

        const imageItems = Array.isArray(blog.images) ? blog.images : [];
        const ids = imageItems.map(toPublicId).filter(Boolean);
        const coverId = toPublicId(blog.coverImage);
        if (coverId) ids.push(coverId);

        await Promise.allSettled(ids.map((pid) => cloudinary.uploader.destroy(pid, { resource_type: "image" })));
        await BlogModel.findByIdAndDelete(id);

        return res.ok({ message: "Blog eliminado" });
    } catch (e) { return next(e); }
}

// ===== Update =====
export async function updateBlog(req, res, next) {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) throw ERR.VALIDATION({ id: "inválido" });

        const existing = await BlogModel.findById(id).lean();
        if (!existing) throw ERR.NOT_FOUND("Blog no encontrado");

        // ✅ Multitienda: usa resolveStoreId
        const reqStoreId = resolveStoreId(req);
        if (reqStoreId && existing.storeId && String(existing.storeId) !== String(reqStoreId)) {
            throw ERR.FORBIDDEN("No tienes permiso para actualizar este recurso (tienda distinta).");
        }

        const {
            title, description, content, excerpt,
            tags, category, status, visibility, slug,
            coverImage, images,
        } = req.body || {};

        const $set = {};
        if (typeof title === "string") $set.title = title.trim();
        if (typeof description === "string") $set.description = description;
        if (typeof content === "string") $set.content = content;
        if (typeof excerpt === "string") $set.excerpt = excerpt;
        if (Array.isArray(tags)) $set.tags = tags;
        if (typeof category === "string") $set.category = category;
        if (typeof status === "string") $set.status = status;
        if (typeof visibility === "string") $set.visibility = visibility;
        if (typeof coverImage === "string") $set.coverImage = coverImage;

        if (typeof slug === "string" && slug.trim()) {
            $set.slug = slugify(slug);
        } else if (typeof title === "string" && title.trim() && !existing.slug) {
            $set.slug = slugify(title);
        }

        // Reemplazo de imágenes (y borrado de las removidas)
        let deletePublicIds = [];
        if (Array.isArray(images)) {
            const normalizedNew = images.filter(Boolean).map((x) => (typeof x === "string" ? { url: x } : x));
            $set.images = normalizedNew;

            const oldItems = Array.isArray(existing.images) ? existing.images : [];
            const oldIds = new Set(oldItems.map(toPublicId).filter(Boolean));
            const newIds = new Set(normalizedNew.map(toPublicId).filter(Boolean));
            deletePublicIds = [...oldIds].filter((oid) => !newIds.has(oid));
        }

        const updated = await BlogModel.findByIdAndUpdate(id, { $set }, { new: true });
        if (!updated) throw ERR.SERVER("Blog no pudo actualizarse");

        if (deletePublicIds.length) {
            Promise.allSettled(deletePublicIds.map((pid) => cloudinary.uploader.destroy(pid, { resource_type: "image" }))).catch(() => { });
        }

        return res.ok({ blog: updated, message: "Blog actualizado correctamente" });
    } catch (e) { return next(e); }
}
