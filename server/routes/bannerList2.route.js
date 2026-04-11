// server/routes/bannerList2.route.js
import { Router } from 'express';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import withTenant from '../middlewares/withTenant.js';
import { requirePermission } from '../middlewares/requirePermission.js';
import { previewGuard } from '../middlewares/previewGuard.js'; // ⬅️ NUEVO
import { ERR } from '../utils/httpError.js';

import {
  addBanner,
  deleteBanner,
  getBanner,
  getBanners,
  updatedBanner,
  uploadImages
} from '../controllers/bannerList2.controller.js';

import { removeImageFromCloudinary } from '../controllers/category.controller.js';

const bannerList2Router = Router();

/**
 * Nota:
 * - añadimos GET públicos /public y /public/:id (solo lectura)
 * - añadimos /preview/:id (modo autenticado con permiso o token firmado)
 * - mantenemos endpoints admin existentes (no rompemos el front)
 * - alias /deleteImage además de /deteleImage
 */

// Fuerza alcance público en GET sin auth
const forcePublicScope = (req, _res, next) => {
  req.query = { ...req.query, scope: 'public', status: 'published' };
  return next();
};

// Escrituras: exige tenant por header o cae a storeId del usuario (normaliza en req.tenant.storeId)
const ensureTenantWrite = (req, _res, next) => {
  const tStore = req?.tenant?.storeId;
  if (tStore) return next();

  const userStore = req?.user?.storeId;
  if (userStore) {
    req.tenant = { ...(req.tenant || {}), storeId: String(userStore) };
    return next();
  }
  return next(ERR.VALIDATION({ storeId: 'x-tenant-id requerido o usuario sin storeId' }));
};

/* ─────────── PREVIEW (sin publicar) ─────────── */
// Importante: colocar ANTES de '/:id' admin para evitar conflictos de patrón
bannerList2Router.get(
  '/preview/:id',
  withTenant({ required: false, source: 'header' }),
  previewGuard({ resource: 'bannerList2', requirePermission: true }), // valida auth+permiso o token
  getBanner // mismo controller; previewGuard ya pone scope='internal'
);

/* ─────────── RUTAS PÚBLICAS (solo lectura) ─────────── */
// Importante: definir /public antes de '/:id' para evitar conflictos
bannerList2Router.get(
  '/public',
  withTenant({ required: false, source: 'header' }),
  forcePublicScope,
  getBanners
);

bannerList2Router.get(
  '/public/:id',
  withTenant({ required: false, source: 'header' }),
  forcePublicScope,
  getBanner
);

/* ─────────── RUTAS ADMIN (protegidas) ─────────── */

// Subir imágenes (Cloudinary) — carpeta por tienda se maneja en el controller
bannerList2Router.post(
  '/uploadImages',
  auth,
  withTenant({ required: false, source: 'header' }),
  ensureTenantWrite,
  requirePermission('banner:image:upload'),
  upload.array('images', 10),
  uploadImages
);

// Crear bannerList2
bannerList2Router.post(
  '/add',
  auth,
  withTenant({ required: false, source: 'header' }),
  ensureTenantWrite,
  requirePermission('banner:create'),
  addBanner
);

// Listar (scoped por tienda; si envían x-tenant-id se filtra)
bannerList2Router.get(
  '/',
  auth,
  withTenant({ required: false, source: 'header' }),
  requirePermission('banner:read'),
  getBanners
);

// Obtener uno (scoped por tienda)
bannerList2Router.get(
  '/:id',
  auth,
  withTenant({ required: false, source: 'header' }),
  requirePermission('banner:read'),
  getBanner
);

// Eliminar imagen suelta — alias con typo (legado) + nuevo correcto
bannerList2Router.delete(
  '/deteleImage',
  auth,
  withTenant({ required: false, source: 'header' }),
  ensureTenantWrite,
  requirePermission('banner:image:delete'),
  removeImageFromCloudinary
);

bannerList2Router.delete(
  '/deleteImage',
  auth,
  withTenant({ required: false, source: 'header' }),
  ensureTenantWrite,
  requirePermission('banner:image:delete'),
  removeImageFromCloudinary
);

// Actualizar bannerList2
bannerList2Router.put(
  '/:id',
  auth,
  withTenant({ required: false, source: 'header' }),
  ensureTenantWrite,
  requirePermission('banner:update'),
  updatedBanner
);

// Eliminar bannerList2
bannerList2Router.delete(
  '/:id',
  auth,
  withTenant({ required: false, source: 'header' }),
  ensureTenantWrite,
  requirePermission('banner:delete'),
  deleteBanner
);

export default bannerList2Router;
