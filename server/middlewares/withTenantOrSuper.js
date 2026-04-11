// server/middlewares/withTenantOrSuper.js
import withTenant from './withTenant.js';
import { isPlatformSuperAdmin } from '../config/roles.js';

export default function withTenantOrSuper(opts = {}) {
  const { required = true } = opts;
  const wt = withTenant({ required, ...opts });

  // normaliza id: "", null, undefined o "   " -> null
  const normalizeId = (v) => {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s.length > 0 ? s : null;
  };

  return (req, res, next) => {
    // Señales de súper admin (role o lista .env)
    const role = req.user?.role || req.auth?.role;
    const isPlat =
      role === 'SUPER_ADMIN' ||
      req.user?.isPlatformSuperAdmin === true ||
      isPlatformSuperAdmin(req.user?.email || req.user);

    if (isPlat) {
      // No exigimos X-Store-Id; si viene vacío lo dejamos en null
      const raw = req.headers['x-store-id'];
      const storeId = normalizeId(raw);

      req.tenantId = storeId;
      req.storeId = storeId; // compat
      req.tenant = { storeId, role: 'SUPER_ADMIN', membership: null };
      req.store = null; // global por defecto para súper
      return next();
    }

    // --- Rama no-super: si required=true y no hay X-Store-Id válido, loguea 403 de diagnóstico
    const raw = req.headers['x-store-id'];
    const storeId = normalizeId(raw);
    if (required && !storeId) {
      console.warn('[403] withTenantOrSuper > withTenant(required)', {
        route: `${req.method} ${req.originalUrl}`,
        role: req.user?.role,
        isPlatformSuper: req.isPlatformSuperAdmin || req.user?.isPlatformSuperAdmin,
      });
    }

    // Para el resto, aplica withTenant normal (respetando required)
    return wt(req, res, next);
  };
}
