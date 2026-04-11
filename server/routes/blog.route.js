// server/routes/blog.route.js
import { Router } from 'express';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import withTenant from '../middlewares/withTenant.js';
import { requirePermission } from '../middlewares/requirePermission.js';
import { previewGuard } from '../middlewares/previewGuard.js'; // ⬅️ nuevo

import {
  addBlog,
  deleteBlog,
  getBlog,
  getBlogs,
  updateBlog,
  uploadImages,
} from '../controllers/blog.controller.js';

const blogRouter = Router();

const forcePublicScope = (req, _res, next) => {
  req.query = { ...req.query, scope: 'public', status: 'published' };
  next();
};

/* ─────────── PREVIEW (sin publicar) ─────────── */
// ⚠️ colocar ANTES de '/:id' para no chocar con ese patrón
blogRouter.get(
  '/preview/:id',
  withTenant({ required: false }),
  previewGuard({ resource: 'blog', requirePermission: true }), // valida auth+permiso o token
  getBlog // mismo controller; previewGuard ya pone scope='internal'
);

/* ─────────── RUTAS PÚBLICAS (solo lectura) ─────────── */
blogRouter.get('/', withTenant({ required: false }), forcePublicScope, getBlogs);

blogRouter.get('/:id', withTenant({ required: false }), forcePublicScope, getBlog);

/* ─────────── RUTAS ADMIN (lectura con permisos) ─────────── */
blogRouter.get('/admin', auth, withTenant({ required: false }), requirePermission('blog:read'), getBlogs);

blogRouter.get('/admin/:id', auth, withTenant({ required: false }), requirePermission('blog:read'), getBlog);

/* ─────────── RUTAS PROTEGIDAS (crear/actualizar/borrar) ─────────── */
blogRouter.post(
  '/uploadImages',
  auth,
  requirePermission(['blog:image:upload', 'media:image:upload', 'product:image:upload']),
  upload.array('images', Number(process.env.MAX_FILES_UPLOAD || 10)),
  uploadImages
);

blogRouter.post('/add', auth, withTenant({ required: false }), requirePermission('blog:create'), addBlog);

blogRouter.put('/:id', auth, withTenant({ required: false }), requirePermission('blog:update'), updateBlog);

blogRouter.delete('/:id', auth, withTenant({ required: false }), requirePermission('blog:delete'), deleteBlog);

export default blogRouter;
