// server/routes/bannerV1.route.js
import { Router } from 'express';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import withTenant from '../middlewares/withTenant.js';
import { requirePermission } from '../middlewares/requirePermission.js';
import { previewGuard } from '../middlewares/previewGuard.js'; // ⬅️ NUEVO
import {
  addBanner,
  deleteBanner,
  getBanner,
  getBanners,
  updatedBanner,
  uploadImages
} from '../controllers/bannerV1.controller.js';
import { removeImageFromCloudinary } from '../controllers/category.controller.js';

const bannerV1Router = Router();

/**
 * Nota:
 * - Se agregan rutas públicas /public y /public/:id (solo lectura)
 * - Se añade /preview/:id (modo autenticado con permiso o token firmado)
 * - Se mantienen intactas las rutas existentes (admin) con auth + permisos
 * - Alias /deleteImage además de /deteleImage
 */

// Forzar alcance público en GET sin auth
const forcePublicScope = (req, _res, next) => {
  req.query = { ...req.query, scope: 'public', status: 'published' };
  next();
};

/* ─────────── PREVIEW (sin publicar) ─────────── */
// Importante: colocar ANTES de '/:id' para no chocar con ese patrón
bannerV1Router.get(
  '/preview/:id',
  withTenant({ required: false }),
  previewGuard({ resource: 'bannerV1', requirePermission: true }), // valida auth+permiso o token
  getBanner // mismo controller; previewGuard ya pone scope='internal'
);

/* ─────────── RUTAS PÚBLICAS (solo lectura) ─────────── */
bannerV1Router.get(
  '/public',
  withTenant({ required: false }),  // acepta x-store-id si viene
  forcePublicScope,
  getBanners
);

bannerV1Router.get(
  '/public/:id',
  withTenant({ required: false }),
  forcePublicScope,
  getBanner
);

/* ─────────── RUTAS ADMIN (protegidas) ─────────── */

// Subida de imágenes (Cloudinary) — carpeta por tienda se maneja en el controller
bannerV1Router.post(
  '/uploadImages',
  auth,
  requirePermission('banner:image:upload'),
  upload.array('images'),
  uploadImages
);

// Crear banner
bannerV1Router.post(
  '/add',
  auth,
  requirePermission('banner:create'),
  addBanner
);

// Listar banners (multitienda → requiere auth para resolver storeId)
bannerV1Router.get(
  '/',
  auth,
  requirePermission('banner:read'),
  getBanners
);

// Obtener un banner por id (scoped por tienda)
bannerV1Router.get(
  '/:id',
  auth,
  requirePermission('banner:read'),
  getBanner
);

// Eliminar imagen (reusa tu controlador de categorías) — alias legado + correcto
bannerV1Router.delete(
  '/deteleImage',
  auth,
  requirePermission('banner:image:delete'),
  removeImageFromCloudinary
);
bannerV1Router.delete(
  '/deleteImage',
  auth,
  requirePermission('banner:image:delete'),
  removeImageFromCloudinary
);

// Eliminar banner
bannerV1Router.delete(
  '/:id',
  auth,
  requirePermission('banner:delete'),
  deleteBanner
);

// Actualizar banner
bannerV1Router.put(
  '/:id',
  auth,
  requirePermission('banner:update'),
  updatedBanner
);

export default bannerV1Router;
