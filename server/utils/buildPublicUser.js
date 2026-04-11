// server/utils/buildPublicUser.js
import User from "../models/user.model.js";
import StoreModel from "../models/store.model.js";
import { isPlatformSuperAdmin } from "../config/roles.js";
import { PERMISSIONS } from "../config/permissions.js";

/**
 * Dado un array de storeIds, retorna un Set con los IDs que realmente existen en BD.
 */
async function getExistingStoreIds(storeIds) {
  if (!storeIds.length) return new Set();
  const docs = await StoreModel.find({ _id: { $in: storeIds } }, { _id: 1 }).lean();
  return new Set(docs.map((d) => String(d._id)));
}

/**
 * Carga un usuario (lean) si te pasan un ID; si ya es doc/POJO, lo normaliza.
 */
async function ensureUserDoc(userOrId) {
  if (!userOrId) return null;

  // Si ya viene un lean/doc plano con _id, úsalo tal cual
  if (typeof userOrId === "object" && userOrId._id) {
    const u = userOrId;
    const isLeanLike =
      !u.$__ &&
      (typeof u.toObject !== "function" || false);

    const base = isLeanLike ? u : (typeof u.toObject === "function" ? u.toObject() : u);

    const needReload =
      base.defaultStoreId === undefined ||
      base.activeStoreId === undefined ||
      base.platformRole === undefined ||
      base.memberships === undefined;

    if (!needReload) return base;

    const reloaded = await User.findById(u._id)
      .select(
        "name email avatar mobile status role platformRole memberships defaultStoreId activeStoreId"
      )
      .lean();
    return reloaded;
  }

  // Caso string/ObjectId → busca en DB
  return await User.findById(userOrId)
    .select("name email avatar mobile status role platformRole memberships defaultStoreId activeStoreId")
    .lean();
}

/**
 * Construye el payload público del usuario para el frontend.
 * Incluye defaultStoreId / activeStoreId y agrega roles desde memberships activas.
 */
export default async function buildPublicUser(userOrId) {
  const u = await ensureUserDoc(userOrId);
  if (!u) return null;

  const toStrOrNull = (val) => (val ? String(val) : null);

  // ===== Validar memberships contra tiendas existentes =====
  const rawMemberships = Array.isArray(u.memberships) ? u.memberships : [];
  const rawDefaultStoreId = toStrOrNull(u.defaultStoreId);
  const rawActiveStoreId = toStrOrNull(u.activeStoreId);

  // Recolectar todos los storeIds referenciados
  const referencedIds = new Set();
  rawMemberships.forEach((m) => {
    if (m?.storeId) referencedIds.add(String(m.storeId));
  });
  if (rawDefaultStoreId) referencedIds.add(rawDefaultStoreId);
  if (rawActiveStoreId) referencedIds.add(rawActiveStoreId);

  // Solo consultar BD si hay referencias a tiendas
  let memberships = rawMemberships;
  let defaultStoreId = rawDefaultStoreId;
  let activeStoreId = rawActiveStoreId;
  let hadOrphans = false;

  if (referencedIds.size > 0) {
    const existingIds = await getExistingStoreIds([...referencedIds]);

    // Filtrar memberships a solo tiendas existentes
    memberships = rawMemberships.filter((m) => {
      const sid = m?.storeId ? String(m.storeId) : null;
      return sid && existingIds.has(sid);
    });

    // Anular defaultStoreId / activeStoreId si apuntan a tiendas inexistentes
    if (defaultStoreId && !existingIds.has(defaultStoreId)) {
      defaultStoreId = null;
    }
    if (activeStoreId && !existingIds.has(activeStoreId)) {
      activeStoreId = null;
    }

    hadOrphans =
      memberships.length !== rawMemberships.length ||
      defaultStoreId !== rawDefaultStoreId ||
      activeStoreId !== rawActiveStoreId;
  }

  // Fire-and-forget: limpiar datos huérfanos en BD para futuras llamadas
  if (hadOrphans) {
    const updateOp = {
      $set: { memberships },
    };
    if (!defaultStoreId) {
      updateOp.$unset = { ...updateOp.$unset, defaultStoreId: "" };
    } else {
      updateOp.$set.defaultStoreId = defaultStoreId;
    }
    if (!activeStoreId) {
      updateOp.$unset = { ...updateOp.$unset, activeStoreId: "" };
    } else {
      updateOp.$set.activeStoreId = activeStoreId;
    }

    User.updateOne({ _id: u._id }, updateOp).catch((err) => {
      console.error("[buildPublicUser] Error limpiando datos huérfanos:", err);
    });
  }

  // ===== Auto-degradación de STORE_OWNER huérfano =====
  // Si el usuario tiene platformRole STORE_OWNER pero NO tiene memberships
  // activas con rol STORE_OWNER, degradar a CUSTOMER automáticamente.
  const hasActiveStoreOwnership = memberships.some(
    (m) =>
      String(m?.role || "").toUpperCase() === "STORE_OWNER" &&
      String(m?.status || "").toLowerCase() === "active"
  );

  let effectivePlatformRole = u.platformRole ? String(u.platformRole) : null;
  let effectiveLegacyRole = u.role ? String(u.role) : null;

  if (
    effectivePlatformRole === "STORE_OWNER" &&
    !hasActiveStoreOwnership
  ) {
    effectivePlatformRole = "CUSTOMER";
    // Fire-and-forget: corregir en BD
    User.updateOne(
      { _id: u._id },
      { $set: { platformRole: "CUSTOMER" } }
    ).catch((err) => {
      console.error("[buildPublicUser] Error degradando STORE_OWNER huérfano:", err);
    });
  }

  // ===== Unificación de roles =====
  const roles = new Set();
  if (effectivePlatformRole) roles.add(effectivePlatformRole);
  if (effectiveLegacyRole) roles.add(effectiveLegacyRole);

  memberships.forEach((m) => {
    if (String(m?.status || "").toLowerCase() === "active") {
      if (Array.isArray(m?.roles) && m.roles.length) {
        m.roles.forEach((r) => roles.add(String(r)));
      }
      if (m?.role) roles.add(String(m.role));
    }
  });

  // ===== Suprimir CUSTOMER si hay roles operativos =====
  // CUSTOMER es implícito — todos pueden comprar. Solo se muestra
  // si es el único rol del usuario.
  const IMPLICIT_ROLES = ["CUSTOMER", "USER"];
  const hasOperationalRole = [...roles].some(
    (r) => !IMPLICIT_ROLES.includes(r.toUpperCase())
  );
  if (hasOperationalRole) {
    for (const ir of IMPLICIT_ROLES) {
      roles.delete(ir);
    }
  }

  // Resolver permisos desde roles (incluir CUSTOMER siempre para permisos básicos)
  const permissionRoles = new Set(roles);
  permissionRoles.add("CUSTOMER"); // Siempre incluir permisos de cliente
  const permissions = new Set();
  for (const role of permissionRoles) {
    const perms = PERMISSIONS[role] || [];
    perms.forEach((p) => permissions.add(p));
  }

  return {
    // Compat
    id: String(u._id),
    _id: String(u._id),

    name: u.name || "",
    email: u.email || "",
    avatar: u.avatar || "",
    mobile: u.mobile || "",
    status: u.status || "active",

    // Roles "legacy" + agregados
    role: effectiveLegacyRole || null,
    platformRole: effectivePlatformRole || null,
    roles: Array.from(roles),
    permissions: Array.from(permissions),

    // Tienda por defecto y activa (ya validadas)
    defaultStoreId,
    activeStoreId,

    // Membresías filtradas (solo tiendas existentes)
    memberships: memberships.map((m) => ({
      storeId: m?.storeId ? String(m.storeId) : null,
      roles: Array.isArray(m?.roles) ? m.roles.map(String) : [],
      status: m?.status || "ACTIVE",
      role: m?.role || null,
      assignedAt: m?.assignedAt || null,
      assignedBy: toStrOrNull(m?.assignedBy),
    })),

    // Flags de plataforma
    isPlatformSuperAdmin: isPlatformSuperAdmin(u.email),
    isSuper:
      !!u.isSuper ||
      Array.from(roles).includes("SUPER_ADMIN") ||
      u.platformRole === "SUPER_ADMIN" ||
      u.role === "SUPER_ADMIN",
  };
}
