// server/middlewares/withTenant.js
import mongoose from 'mongoose';
import Store from '../models/store.model.js';
import User from '../models/user.model.js';
import { ROLES, isPlatformSuperAdmin, mapLegacyUserRoleToPlatformRole } from '../config/roles.js';

/**
 * options:
 *  - required: boolean (si exige tenantId / auth)  [default: true]
 *  - source: 'param' | 'header' | 'body' | 'query' | 'auto'
 *      'param'  -> req.params.storeId | req.params.tenantId | req.params.idStore
 *      'header' -> X-Store-Id | X-StoreId | X-Tenant-Id | X-TenantId
 *      'body'   -> req.body.storeId
 *      'query'  -> req.query.storeId
 *      'auto'   -> header -> params -> query
 */
export default function withTenant({ required = true, source = 'auto' } = {}) {
  const normalizeId = (v) => {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s.length > 0 ? s : null;
  };

  return async function (req, res, next) {
    try {
      // --------------------------
      // 1) Resolver storeId
      // --------------------------
      const headerStoreIdRaw =
        req.get('x-tenant-id') ||
        req.get('x-tenantid') ||
        req.get('x-store-id') ||
        req.get('x-storeid');

      const pickFromParams = () =>
        req.params.storeId || req.params.tenantId || req.params.idStore || null;

      let tenantIdRaw = null;
      if (source === 'param') tenantIdRaw = pickFromParams();
      else if (source === 'header') tenantIdRaw = headerStoreIdRaw;
      else if (source === 'body') tenantIdRaw = req.body?.storeId;
      else if (source === 'query') tenantIdRaw = req.query?.storeId;
      else tenantIdRaw = headerStoreIdRaw || pickFromParams() || req.query?.storeId || null;

      const tenantId = normalizeId(tenantIdRaw);

      // Exporta forma canónica SIEMPRE
      req.tenantId = tenantId;
      req.storeId = tenantId; // compat
      req.tenant = { storeId: tenantId };

      // =========================================================
      // 2) MODO PÚBLICO (required:false) → NO exige autenticación
      // =========================================================
      if (!required) {
        if (!tenantId) {
          req.tenant = { storeId: null, role: null, membership: null };
          req.storeId = null;
          req.tenantId = null;
          req.store = null;
          return next();
        }

        const looksLikeObjectId = mongoose.Types.ObjectId.isValid(tenantId);
        const storeQuery = looksLikeObjectId
          ? { _id: tenantId, status: 'active' }
          : { slug: tenantId, status: 'active' };

        const store = await Store.findOne(storeQuery, { _id: 1, slug: 1, status: 1 }).lean();
        if (!store) {
          // Store ID inválido/stale → tratar como sin tenant (no bloquear)
          req.tenant = { storeId: null, role: null, membership: null };
          req.storeId = null;
          req.tenantId = null;
          req.store = null;
          return next();
        }

        // Enriquecer rol si hay usuario autenticado (opcional)
        let roleForThisTenant = null;
        let membership = null;

        if (req.userId) {
          const user = await User.findById(req.userId, { role: 1, memberships: 1, email: 1 }).lean();
          if (user) {
            if (isPlatformSuperAdmin(user?.email || user)) {
              roleForThisTenant = ROLES.SUPER_ADMIN;
            } else {
              membership = (user.memberships || []).find(
                m => String(m.storeId) === String(store._id) && m.status === 'active'
              );
              if (membership) {
                const mbRole = Array.isArray(membership.roles) && membership.roles.length
                  ? membership.roles[0]
                  : membership.role;
                roleForThisTenant = mbRole || null;
              }
              // Compat: legacy ADMIN mapeado a STORE_OWNER
              if (!membership && mapLegacyUserRoleToPlatformRole(user.role) === ROLES.STORE_OWNER) {
                roleForThisTenant = ROLES.STORE_OWNER;
              }
            }
          }
        }

        req.tenant = { storeId: String(store._id), role: roleForThisTenant, membership: membership || null };
        req.storeId = String(store._id);
        req.tenantId = String(store._id);
        req.store = store;
        return next();
      }

      // =========================================================
      // 3) MODO PROTEGIDO (required:true) → exige autenticación
      // =========================================================
      if (!req.userId) {
        return res.status(401).json({ error: true, message: 'No autenticado' });
      }

      const user = await User.findById(req.userId, { _id: 1, role: 1, memberships: 1, email: 1 }).lean();
      if (!user) {
        return res.status(401).json({ error: true, message: 'Usuario inválido' });
      }

      const superPlat = isPlatformSuperAdmin(user?.email || user);

      // Sin storeId
      if (!tenantId) {
        if (superPlat) {
          req.tenant = { storeId: null, role: ROLES.SUPER_ADMIN, membership: null };
          req.storeId = null;
          req.tenantId = null;
          req.store = null;
          return next();
        }
        const actives = (user.memberships || []).filter(m => m.status === 'active');
        if (actives.length === 1) {
          const mb = actives[0];
          const mbRole = Array.isArray(mb.roles) && mb.roles.length ? mb.roles[0] : mb.role;
          req.tenant = { storeId: String(mb.storeId), role: mbRole || null, membership: mb };
          req.storeId = String(mb.storeId);
          req.tenantId = String(mb.storeId);
          req.store = null;
          return next();
        }
        // respuesta directa (evitar depender del error middleware)
        return res.status(422).json({ error: true, message: 'storeId/tenantId es requerido' });
      }

      // Con storeId: validar tienda (incluye ownerId para permitir dueños)
      const looksLikeObjectId = mongoose.Types.ObjectId.isValid(tenantId);
      const storeQuery = looksLikeObjectId
        ? { _id: tenantId, status: 'active' }
        : { slug: tenantId, status: 'active' };

      const store = await Store.findOne(storeQuery, { _id: 1, slug: 1, status: 1, ownerId: 1 }).lean();
      if (!store) {
        return res.status(404).json({ error: true, message: 'Tienda no encontrada o suspendida' });
      }

      // SUPER_ADMIN plataforma: pasa sin membresía
      if (superPlat) {
        req.tenant = { storeId: String(store._id), role: ROLES.SUPER_ADMIN, membership: null };
        req.storeId = String(store._id);
        req.tenantId = String(store._id);
        req.store = store;
        return next();
      }

      // Permitir dueño o miembro activo
      const uid = String(user._id);
      const isOwner = String(store.ownerId || '') === uid;

      let membership = null;
      if (!isOwner) {
        membership = (user.memberships || []).find(
          m => String(m.storeId) === String(store._id) && (m.status || 'active') === 'active'
        );
        if (!membership) {
          // Compat: legacy ADMIN => STORE_OWNER
          const legacy = mapLegacyUserRoleToPlatformRole(user.role);
          if (legacy !== ROLES.STORE_OWNER) {
            return res.status(403).json({ error: true, message: 'Forbidden: not a member of this store' });
          }
        }
      }

      const mbRole = isOwner
        ? ROLES.STORE_OWNER
        : (Array.isArray(membership?.roles) && membership.roles.length ? membership.roles[0] : membership?.role) || null;

      req.tenant = { storeId: String(store._id), role: mbRole, membership: membership || null };
      req.storeId = String(store._id);
      req.tenantId = String(store._id);
      req.store = store;
      return next();

    } catch (err) {
      console.error('withTenant error:', err);
      return res.status(500).json({ error: true, message: 'Error de tenant' });
    }
  };
}
