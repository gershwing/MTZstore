// server/routes/homeSlider.route.js
import { Router } from 'express';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import withTenant from '../middlewares/withTenant.js';
import { requirePermission } from '../middlewares/requirePermission.js';
import { previewGuard } from '../middlewares/previewGuard.js'; // ⬅️ NUEVO
import { ERR } from '../utils/httpError.js';

import {
  addHomeSlide,
  deleteMultipleSlides,
  deleteSlide,
  getHomeSlides,
  getSlide,
  removeImageFromCloudinary,
  updatedSlide,
  uploadImages
} from '../controllers/homeSlider.controller.js';

const homeSlidesRouter = Router();

/** Fuerza alcance público en GET sin auth */
const forcePublicScope = (req, _res, next) => {
  req.query = { ...req.query, scope: 'public', status: 'published' };
  next();
};

/** Escrituras: exige tenant por header o cae a storeId del usuario */
const ensureTenantWrite = (req, _res, next) => {
  if (!req.tenantId) {
    const userStore = req?.user?.storeId;
    if (userStore) {
      req.tenantId = String(userStore);
      return next();
    }
    return next(ERR.VALIDATION({ storeId: 'x-tenant-id requerido o usuario sin storeId' }));
  }
  next();
};

/* ─────────── PREVIEW (sin publicar) ─────────── */
// Importante: colocar ANTES de '/:id' para evitar conflictos
homeSlidesRouter.get(
  '/preview/:id',
  withTenant({ required: false, source: 'header' }),
  previewGuard({ resource: 'homeSlider', requirePermission: true }), // valida auth+permiso o token
  getSlide // mismo controller; previewGuard ya pone scope='internal'
);

/* ─────────── GET PÚBLICOS ─────────── */
// Definir /public antes de '/:id' para evitar conflictos
homeSlidesRouter.get(
  '/public',
  withTenant({ required: false, source: 'header' }),
  forcePublicScope,
  getHomeSlides
);

homeSlidesRouter.get(
  '/public/:id',
  withTenant({ required: false, source: 'header' }),
  forcePublicScope,
  getSlide
);

/* ─────────── GET ADMIN (solo lectura interna) ─────────── */
homeSlidesRouter.get(
  '/admin',
  auth,
  withTenant({ required: false, source: 'header' }),
  requirePermission('slider:read'),
  getHomeSlides
);

homeSlidesRouter.get(
  '/admin/:id',
  auth,
  withTenant({ required: false, source: 'header' }),
  requirePermission('slider:read'),
  getSlide
);

/* ─────────── RUTAS ADMIN (escritura) ─────────── */
// Subir imágenes (Cloudinary)
homeSlidesRouter.post(
  '/uploadImages',
  auth,
  withTenant({ required: false, source: 'header' }),
  ensureTenantWrite,
  requirePermission('slider:create'),
  upload.array('images', 10),
  uploadImages
);

// Crear un slide
homeSlidesRouter.post(
  '/add',
  auth,
  withTenant({ required: false, source: 'header' }),
  ensureTenantWrite,
  requirePermission('slider:create'),
  addHomeSlide
);

// Borrar imagen individual de Cloudinary (útil al reemplazar) — alias legacy
homeSlidesRouter.delete(
  '/deteleImage',
  auth,
  withTenant({ required: false, source: 'header' }),
  ensureTenantWrite,
  requirePermission('slider:delete'),
  removeImageFromCloudinary
);
homeSlidesRouter.delete(
  '/delete-image',
  auth,
  withTenant({ required: false, source: 'header' }),
  ensureTenantWrite,
  requirePermission('slider:delete'),
  removeImageFromCloudinary
);

// Eliminar un slide
homeSlidesRouter.delete(
  '/:id',
  auth,
  withTenant({ required: false, source: 'header' }),
  ensureTenantWrite,
  requirePermission('slider:delete'),
  deleteSlide
);

// Eliminar múltiples slides
homeSlidesRouter.delete(
  '/bulk',
  auth,
  withTenant({ required: false, source: 'header' }),
  ensureTenantWrite,
  requirePermission('slider:delete'),
  deleteMultipleSlides
);

// Actualizar un slide (reemplaza el array de imágenes)
homeSlidesRouter.put(
  '/:id',
  auth,
  withTenant({ required: false, source: 'header' }),
  ensureTenantWrite,
  requirePermission('slider:update'),
  updatedSlide
);

/* ─────────── GET genéricos (compat) ─────────── */
// Mantén estas dos para compatibilidad con front actual
homeSlidesRouter.get(
  '/',
  withTenant({ required: false, source: 'header' }),
  getHomeSlides
);
homeSlidesRouter.get(
  '/:id',
  withTenant({ required: false, source: 'header' }),
  getSlide
);

export default homeSlidesRouter;
