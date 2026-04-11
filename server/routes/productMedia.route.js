// server/routes/productMedia.route.js
import { Router } from 'express';

import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import withTenant from '../middlewares/withTenant.js';
import { requirePermission } from '../middlewares/requirePermission.js';

import {
  uploadImages,
  uploadBannerImages,
  removeImageFromCloudinary,
} from '../controllers/productMedia.controller.js';

const mediaRouter = Router();

/* ============================================================
   RUTAS ADMIN / SELLER
   - auth obligatorio
   - tenant obligatorio
   ============================================================ */

mediaRouter.use(auth, withTenant({ required: true }));

/* =========================
   Subida de imágenes producto
   ========================= */

mediaRouter.post(
  '/images',
  requirePermission('product:image:upload'),
  upload.array('images'),
  uploadImages
);

/* =========================
   Subida de banners
   ========================= */

mediaRouter.post(
  '/banners',
  requirePermission('product:image:upload'),
  upload.array('bannerimages'),
  uploadBannerImages
);

/* =========================
   Eliminación de imágenes
   ========================= */

// nuevo endpoint limpio
mediaRouter.delete(
  '/image',
  requirePermission('product:image:delete'),
  removeImageFromCloudinary
);

// alias legacy (por compatibilidad)
mediaRouter.delete(
  '/deleteImage',
  requirePermission('product:image:delete'),
  removeImageFromCloudinary
);

mediaRouter.delete(
  '/deteleImage',
  requirePermission('product:image:delete'),
  removeImageFromCloudinary
);

export default mediaRouter;
