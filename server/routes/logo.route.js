// server/routes/logo.route.js
import { Router } from 'express';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import withTenant from '../middlewares/withTenant.js';
import { requirePermission } from '../middlewares/requirePermission.js';
import {
  addLogo,
  getLogo,
  getLogoById,
  removeImageFromCloudinary,
  updatedLogo,
  uploadImages
} from '../controllers/logo.controller.js';
import Logo from '../models/logo.model.js';

const logoRouter = Router();

/**
 * 🏷️ Logo (multitienda opcional)
 * - GET / , GET /:id → públicos (aceptan X-Store-Id opcional)
 * - GET /admin , /admin/:id → lectura interna (auth+perm)
 * - POST/PUT/DELETE → protegidos con auth + permisos
 *
 * Soporte extra:
 * - ?effective=true en GET / y GET /admin
 *   Devuelve { logo: string } resolviendo: tienda -> plataforma -> ""
 */

// Helper común para effective=true
async function resolveEffectiveLogo(req, res) {
  // Asegurar cabeceras anti-caché
  res.set('Vary', 'Origin, X-Store-Id, Authorization');
  res.set('Cache-Control', 'no-store');

  try {
    const forced = req.query.storeId;
    const storeId =
      forced ||
      req?.tenant?.id ||
      req.get('X-Store-Id') ||
      null;

    let url = '';

    if (storeId) {
      const row = await Logo.findOne({ scope: 'store', storeId }).lean();
      url = row?.logo || row?.url || row?.image || '';
    }
    if (!url) {
      const plat = await Logo.findOne({ scope: 'platform' }).lean();
      url = plat?.logo || plat?.url || plat?.image || '';
    }

    return res.status(200).json({ logo: url || '' });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, code: 'LOGO_ERROR', message: 'No se pudo resolver el logo' });
  }
}

/* ─────────── Subida de imágenes (permiso ANTES de subir archivos) ─────────── */
logoRouter.post(
  '/uploadImages',
  auth,
  withTenant({ required: false }),
  requirePermission('logo:create'),
  upload.array('images'),
  uploadImages
);

/* ─────────── Crear logo ─────────── */
logoRouter.post(
  '/add',
  auth,
  withTenant({ required: false }),
  requirePermission('logo:create'),
  addLogo
);

/* ─────────── GET PÚBLICO ───────────
   ?effective=true => { logo: string } resolviendo tienda -> plataforma
   (sin effective) => mantiene tu flujo legacy via controller getLogo
*/
logoRouter.get('/', withTenant({ required: false }), async (req, res, next) => {
  const effective = String(req.query.effective || '').toLowerCase() === 'true';
  if (effective) {
    return resolveEffectiveLogo(req, res);
  }
  // Legacy flow
  return getLogo(req, res, next);
});

/* ─────────── GET ADMIN (solo lectura interna) ───────────
   ?effective=true => { logo: string } pero protegido (auth+perm)
   (sin effective) => usa controller getLogo
*/
logoRouter.get(
  '/admin',
  auth,
  withTenant({ required: false }),
  requirePermission('logo:read'),
  async (req, res, next) => {
    const effective = String(req.query.effective || '').toLowerCase() === 'true';
    if (effective) {
      return resolveEffectiveLogo(req, res);
    }
    // Legacy admin flow
    return getLogo(req, res, next);
  }
);

logoRouter.get(
  '/admin/:id',
  auth,
  withTenant({ required: false }),
  requirePermission('logo:read'),
  getLogoById
);

/* ─────────── GET PÚBLICO por id (al final) ─────────── */
logoRouter.get('/:id', withTenant({ required: false }), getLogoById);

/* ─────────── Eliminar imagen individual en Cloudinary ─────────── */
logoRouter.delete(
  '/delete-image',
  auth,
  withTenant({ required: false }),
  requirePermission('logo:delete'),
  removeImageFromCloudinary
);

/* ─────────── Actualizar logo ─────────── */
logoRouter.put(
  '/:id',
  auth,
  withTenant({ required: false }),
  requirePermission('logo:update'),
  updatedLogo
);

export default logoRouter;
