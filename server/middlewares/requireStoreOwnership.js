// server/middlewares/requireStoreOwnership.js
import mongoose from 'mongoose';
import { ROLES } from '../config/roles.js';

/**
 * Verifica que el recurso pertenezca a la tienda actual (req.tenant.storeId).
 * - Permite SUPER_ADMIN de plataforma sin chequear propiedad.
 * - Para otros roles, compara el storeId del recurso con el del tenant.
 *
 * @param {(req)=>Promise<string|mongoose.Types.ObjectId|null>|string|null} resourceStoreResolver
 *        Función opcional para obtener el storeId del recurso (ej: buscar Product y leer su storeId).
 *        Si no se provee, intenta con req.body.storeId o req.params.storeId.
 */
export function requireStoreOwnership(resourceStoreResolver) {
  return async (req, res, next) => {
    try {
      // Debe haber pasado por withTenant
      if (!req.tenant) {
        return res.status(500).json({
          error: true,
          message: 'Tenant no resuelto. Asegura withTenant({ required: true }) antes de este middleware.'
        });
      }

      const { storeId: tenantStoreId, role } = req.tenant;

      // SUPER_ADMIN de plataforma: bypass
      if (role === ROLES.SUPER_ADMIN) return next();

      if (!tenantStoreId) {
        return res.status(400).json({ error: true, message: 'storeId del tenant no disponible' });
      }

      // Resolver storeId del recurso
      let resourceStoreId = null;
      if (typeof resourceStoreResolver === 'function') {
        resourceStoreId = await resourceStoreResolver(req);
      }
      if (!resourceStoreId) {
        resourceStoreId = req.body?.storeId || req.params?.storeId || null;
      }

      if (!resourceStoreId || !mongoose.Types.ObjectId.isValid(String(resourceStoreId))) {
        return res.status(400).json({ error: true, message: 'No se pudo determinar storeId del recurso' });
      }

      if (String(resourceStoreId) !== String(tenantStoreId)) {
        return res.status(403).json({ error: true, message: 'Recurso no pertenece a tu tienda' });
      }

      // Roles operativos de tienda (ajusta según tu catálogo real)
      const storeOperators = new Set([
        ROLES.STORE_OWNER,
        ROLES.ADMIN,              // admin de tienda si lo manejas
        ROLES.SELLER,
        ROLES.INVENTORY_MANAGER,
        ROLES.STOCK,
        ROLES.ORDER_MANAGER
      ]);

      if (!storeOperators.has(role)) {
        return res.status(403).json({ error: true, message: 'Rol sin permisos de operación en esta tienda' });
      }

      return next();
    } catch (e) {
      console.error('requireStoreOwnership error:', e);
      return res.status(500).json({ error: true, message: 'Error en verificación de propiedad de tienda' });
    }
  };
}

export default requireStoreOwnership;
