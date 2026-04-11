// server/routes/category.route.js
import { Router } from 'express';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import withTenant from '../middlewares/withTenant.js';
import { requirePermission } from '../middlewares/requirePermission.js';
import {
  createCategory, deleteCategory, getCategories, getCategoriesCount,
  getCategory, getSubCategoriesCount, removeImageFromCloudinary,
  updatedCategory, uploadImages
} from '../controllers/category.controller.js';

const categoryRouter = Router();

/**
 * Política:
 * - GET públicos: sin auth, con tenant opcional (x-tenant-id).
 * - GET admin (solo lectura interna): auth + requirePermission('catalog:read').
 * - Escrituras: auth + permisos + tenant (requerido).
 */

// ⬆️ Subir imágenes (auth + tenant requerido)
categoryRouter.post(
  '/uploadImages',
  auth,
  withTenant({ required: true, source: 'header' }),
  requirePermission('category:image:upload'),
  upload.array('images', 10),
  uploadImages
);

// ➕ Crear categoría (auth + tenant requerido)
categoryRouter.post(
  '/create',
  auth,
  withTenant({ required: true, source: 'header' }),
  requirePermission('category:create'),
  createCategory
);

/* ─────────── GET PÚBLICOS ─────────── */
// 🌳 Listado/árbol
categoryRouter.get(
  '/',
  withTenant({ required: false, source: 'header' }),
  getCategories
);

// #️⃣ Conteos
categoryRouter.get(
  '/get/count',
  withTenant({ required: false, source: 'header' }),
  getCategoriesCount
);
categoryRouter.get(
  '/get/count/subCat',
  withTenant({ required: false, source: 'header' }),
  getSubCategoriesCount
);

// 🔎 Detalle
categoryRouter.get(
  '/:id',
  withTenant({ required: false, source: 'header' }),
  getCategory
);

/* ─────────── GET ADMIN (solo lectura interna) ─────────── */
categoryRouter.get(
  '/admin',
  auth,
  withTenant({ required: false, source: 'header' }),
  requirePermission('catalog:read'),
  getCategories
);
categoryRouter.get(
  '/admin/count',
  auth,
  withTenant({ required: false, source: 'header' }),
  requirePermission('catalog:read'),
  getCategoriesCount
);
categoryRouter.get(
  '/admin/count/subCat',
  auth,
  withTenant({ required: false, source: 'header' }),
  requirePermission('catalog:read'),
  getSubCategoriesCount
);
categoryRouter.get(
  '/admin/:id',
  auth,
  withTenant({ required: false, source: 'header' }),
  requirePermission('catalog:read'),
  getCategory
);

/* ─────────── DELETE imagen Cloudinary ─────────── */
// Legado: /deteleImage (typo) + nuevo /deleteImage
categoryRouter.delete(
  '/deteleImage',
  auth,
  withTenant({ required: true, source: 'header' }),
  requirePermission('category:image:delete'),
  removeImageFromCloudinary
);
categoryRouter.delete(
  '/deleteImage',
  auth,
  withTenant({ required: true, source: 'header' }),
  requirePermission('category:image:delete'),
  removeImageFromCloudinary
);

/* ─────────── DELETE/PUT categoría ─────────── */
categoryRouter.delete(
  '/:id',
  auth,
  withTenant({ required: true, source: 'header' }),
  requirePermission('category:delete'),
  deleteCategory
);

categoryRouter.put(
  '/:id',
  auth,
  withTenant({ required: true, source: 'header' }),
  requirePermission('category:update'),
  updatedCategory
);

export default categoryRouter;
