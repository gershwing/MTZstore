import mongoose from "mongoose";
import StoreModel from "../models/store.model.js";
import UserModel from "../models/user.model.js";
import SellerApplication from "../models/sellerApplication.model.js";
import { ROLES } from "../config/roles.js";
import { ERR } from "../utils/httpError.js";

const isId = (v) => mongoose.Types.ObjectId.isValid(String(v ?? ""));

// --- Helper: filtro por tenant salvo SUPER_ADMIN ---
function tenantScope(req, extra = {}) {
  if (req.user?.role === "SUPER_ADMIN" || req.tenant?.role === "SUPER_ADMIN") return { ...extra };
  const storeId = req.tenant?.storeId;
  if (!storeId) throw ERR.FORBIDDEN("Sin tienda activa en el tenant");
  return { ...extra, _id: storeId };
}

/* =========================================================================
 *  Listar tiendas del usuario (owner o miembro)
 *  GET /api/store/stores/me
 *  - sin permisos de admin; sólo requiere auth
 *  - respuesta ligera: _id, name, slug
 * ========================================================================= */
export async function listMyStores(req, res, next) {
  try {
    const userId = req.user?._id || req.userId;
    if (!userId) {
      return res.status(401).json({ error: true, message: "No autenticado" });
    }

    // memberships desde req.user o desde DB (sin exigir tenant)
    let memberships = Array.isArray(req.user?.memberships) ? req.user.memberships : [];
    if (!memberships.length) {
      const u = await UserModel.findById(userId).select("memberships").lean().catch(() => null);
      memberships = u?.memberships || [];
    }

    const memberStoreIds = memberships
      .map((m) => m?.storeId)
      .filter(Boolean)
      .map((id) => new mongoose.Types.ObjectId(String(id)));

    // ⚠️ Campo correcto: ownerId (no "owner").
    // Dejamos "owner" como compat si hay datos legacy.
    const query = {
      $or: [{ ownerId: userId }, { owner: userId }, { _id: { $in: memberStoreIds } }],
      ...(StoreModel.schema.paths.deletedAt ? { deletedAt: { $exists: false } } : {}),
    };

    const rows = await StoreModel.find(query)
      .select("_id name slug")
      .sort({ name: 1 })
      .lean();

    // dedupe por si coincide owner y miembro
    const seen = new Set();
    const data = rows.filter((r) => (seen.has(String(r._id)) ? false : seen.add(String(r._id))));

    // Evita cache intermedio
    try {
      res.set("Cache-Control", "no-store");
      res.removeHeader("ETag");
    } catch { }

    return res.json({ data });
  } catch (err) {
    return next(err);
  }
}

/* =========================================================================
 *  Listar (SUPER_ADMIN ve todo; resto sólo su tenant activo)
 * ========================================================================= */
export async function listStores(req, res, next) {
  try {
    const isSuperAdmin = req.user?.role === "SUPER_ADMIN" || req.tenant?.role === "SUPER_ADMIN";
    const base = isSuperAdmin ? {} : tenantScope(req);

    // Búsqueda por nombre o slug
    const q = String(req.query?.q || "").trim();
    const search = q
      ? { $or: [{ name: new RegExp(q, "i") }, { slug: new RegExp(q, "i") }] }
      : {};

    const filter = {
      ...base,
      ...search,
      ...(StoreModel.schema.paths.deletedAt ? { deletedAt: { $exists: false } } : {}),
    };

    // Paginación
    const page = Math.max(1, parseInt(req.query?.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query?.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      StoreModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      StoreModel.countDocuments(filter),
    ]);

    return res.ok
      ? res.ok({ rows, total, page, limit })
      : res.json({ rows, total, page, limit });
  } catch (err) {
    return next(err);
  }
}

/* =========================================================================
 *  Obtener una tienda
 * ========================================================================= */
export async function getStore(req, res, next) {
  try {
    const idOrSlug = req.params?.id;
    if (!idOrSlug) throw ERR.VALIDATION("id es requerido");

    const isObjectId = mongoose.isValidObjectId(idOrSlug);

    // Base: scoping por tenant salvo SUPER_ADMIN
    const base = (req.user?.role === "SUPER_ADMIN" || req.tenant?.role === "SUPER_ADMIN") ? {} : tenantScope(req, {});

    // Si viene id válido, por _id; si no, por slug
    const match = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

    const softDelete = (StoreModel.schema.paths.deletedAt
      ? { deletedAt: { $exists: false } }
      : {});

    const filter = { ...base, ...match, ...softDelete };

    const row = await StoreModel.findOne(filter).lean();
    if (!row) throw ERR.NOT_FOUND("Store not found");
    return res.ok ? res.ok({ row }) : res.json({ row });
  } catch (err) {
    return next(err);
  }
}


/* =========================================================================
 *  Crear tienda
 * ========================================================================= */
export async function createStore(req, res, next) {
  try {
    const payload = { ...req.body };
    const row = await StoreModel.create(payload);
    return res.created ? res.created({ row }) : res.status(201).json({ row });
  } catch (err) {
    if (err?.name === "ValidationError") return next(ERR.VALIDATION(err.message));
    return next(err);
  }
}

/* =========================================================================
 *  Actualizar tienda
 * ========================================================================= */
export async function updateStore(req, res, next) {
  try {
    const id = req.params?.id;
    if (!id) throw ERR.VALIDATION("id es requerido");

    const base = (req.user?.role === "SUPER_ADMIN" || req.tenant?.role === "SUPER_ADMIN") ? {} : tenantScope(req, {});
    const filter = { _id: id, ...base, ...(StoreModel.schema.paths.deletedAt ? { deletedAt: { $exists: false } } : {}) };

    const updated = await StoreModel.findOneAndUpdate(filter, req.body, { new: true }).lean();
    if (!updated) throw ERR.NOT_FOUND("Store not found");
    return res.ok ? res.ok({ row: updated }) : res.json({ row: updated });
  } catch (err) {
    if (err?.name === "ValidationError") return next(ERR.VALIDATION(err.message));
    return next(err);
  }
}

/* =========================================================================
 *  Cambiar estado (active/suspended/archived)
 * ========================================================================= */
export async function setStoreStatus(req, res, next) {
  try {
    const id = req.params?.id;
    if (!id) throw ERR.VALIDATION("id es requerido");
    const { status } = req.body;

    const allowed = new Set(["active", "suspended", "archived"]);
    if (!allowed.has(String(status))) throw ERR.VALIDATION("status inválido");

    const base = (req.user?.role === "SUPER_ADMIN" || req.tenant?.role === "SUPER_ADMIN") ? {} : tenantScope(req, {});
    const filter = { _id: id, ...base, ...(StoreModel.schema.paths.deletedAt ? { deletedAt: { $exists: false } } : {}) };

    const updated = await StoreModel.findOneAndUpdate(filter, { status }, { new: true }).lean();
    if (!updated) throw ERR.NOT_FOUND("Store not found");
    return res.ok ? res.ok({ row: updated }) : res.json({ row: updated });
  } catch (err) {
    return next(err);
  }
}

/* =========================================================================
 *  Borrar tienda + sanear referencias
 * ========================================================================= */
export async function deleteStore(req, res, next) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Autorización (ajústala a tu sistema de permisos)
    if (req.user?.role !== "SUPER_ADMIN" && !req.effectivePerms?.includes?.("store:delete")) {
      throw ERR.FORBIDDEN("Forbidden");
    }

    const id = req.params?.id;
    if (!isId(id)) throw ERR.VALIDATION("id inválido");

    // 1) Traer tienda
    const store = await StoreModel.findById(id).session(session);
    if (!store) throw ERR.NOT_FOUND("Store not found");

    // Si prefieres soft-delete:
    // store.deletedAt = new Date();
    // await store.save({ session });
    // Si es delete físico:
    await StoreModel.deleteOne({ _id: id }, { session });

    // 2) Quitar membership de todos los usuarios que la tengan
    const pullRes = await UserModel.updateMany(
      { "memberships.storeId": id },
      { $pull: { memberships: { storeId: id } } },
      { session }
    );

    // 3) Limpiar defaultStoreId que apunten a esta tienda
    const unsetDefaultRes = await UserModel.updateMany(
      { defaultStoreId: id },
      { $unset: { defaultStoreId: "" } },
      { session }
    );

    // 4) Bajar a PENDING cualquier SellerApplication que apuntaba a esta tienda
    const appsRes = await SellerApplication.updateMany(
      { storeId: id, deletedAt: { $exists: false } },
      { $set: { status: "PENDING" }, $unset: { storeId: "" } },
      { session }
    );

    // 5) (Opcional) Quitar rol STORE_OWNER si ya no tiene memberships con ese rol
    const OWNER = ROLES?.STORE_OWNER || "STORE_OWNER";
    const affectedUsers = await UserModel.find({
      $or: [{ "memberships.storeId": id }, { defaultStoreId: id }],
    }).session(session);

    for (const u of affectedUsers) {
      const hasOwner = (u.memberships || []).some((m) => m.role === OWNER);
      if (!hasOwner && Array.isArray(u.roles) && u.roles.includes(OWNER)) {
        u.roles = u.roles.filter((r) => r !== OWNER);
        await u.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({
      ok: true,
      message: "Store deleted and references cleaned",
      stats: {
        usersMembershipsPulled: pullRes.modifiedCount,
        usersDefaultUnset: unsetDefaultRes.modifiedCount,
        appsResetToPending: appsRes.modifiedCount,
      },
    });
  } catch (err) {
    await session.abortTransaction().catch(() => { });
    session.endSession();
    return next(err);
  }
}

/* =========================================================================
 *  Actualizar ajustes rápidos de la tienda (nombre, banner, etc.)
 *  PATCH /api/store/settings
 *  - Usa el tenant actual (req.tenant.storeId) salvo SUPER_ADMIN
 * ========================================================================= */
export async function updateStoreSettings(req, res, next) {
  try {
    // --- Determinar filtro base según tenant/rol ---
    let filter;

    if (req.user?.role === "SUPER_ADMIN") {
      // Para SUPER_ADMIN permitimos elegir tienda explícita
      const explicitId =
        req.tenant?.storeId ||
        req.body?.storeId ||
        req.query?.storeId ||
        req.params?.id;

      if (!explicitId || !isId(explicitId)) {
        throw ERR.VALIDATION("storeId requerido para SUPER_ADMIN");
      }

      filter = { _id: explicitId };
    } else {
      // Para resto de roles usamos el tenantScope normal
      // tenantScope ya valida que haya tienda activa en req.tenant.storeId
      filter = tenantScope(req);
    }

    // Soft-delete (si el esquema tiene deletedAt)
    if (StoreModel.schema.paths.deletedAt) {
      filter = { ...filter, deletedAt: { $exists: false } };
    }

    // --- Campos que vamos a actualizar ---
    const { bannerUrl, name } = req.body || {};
    const $set = {};

    if (typeof name === "string" && name.trim()) {
      $set.name = name.trim();
    }

    if (bannerUrl && typeof bannerUrl === "string") {
      // Guardamos en branding.banner
      $set["branding.banner"] = bannerUrl;

      // (Opcional) duplicado en settings.bannerUrl por compatibilidad
      $set["settings.bannerUrl"] = bannerUrl;
    }

    if (!Object.keys($set).length) {
      throw ERR.VALIDATION("No hay campos para actualizar");
    }

    const updated = await StoreModel.findOneAndUpdate(
      filter,
      { $set },
      { new: true }
    ).lean();

    if (!updated) {
      throw ERR.NOT_FOUND("Store not found");
    }

    return res.ok
      ? res.ok({ row: updated })
      : res.json({ row: updated });
  } catch (err) {
    return next(err);
  }
}


/* =========================================================================
 *  Actualizar SOLO el banner de la tienda
 *  - SUPER_ADMIN puede tocar cualquier id
 *  - El resto SOLO puede tocar su propia tienda (tenant.storeId)
 * ========================================================================= */
export async function updateStoreBanner(req, res, next) {
  try {
    const id = req.params?.id;
    const bannerUrl = req.body?.bannerUrl;

    console.log(
      "[updateStoreBanner] IN",
      { id, bannerUrl, userId: req.user?._id || req.userId }
    );

    if (!id) {
      console.warn("[updateStoreBanner] sin id");
      throw ERR.VALIDATION("id es requerido");
    }

    if (!bannerUrl || typeof bannerUrl !== "string") {
      console.warn("[updateStoreBanner] sin bannerUrl válido");
      throw ERR.VALIDATION("bannerUrl es requerido");
    }

    const softDelete = StoreModel.schema.paths.deletedAt
      ? { deletedAt: { $exists: false } }
      : {};

    const filter = { _id: id, ...softDelete };

    const updated = await StoreModel.findOneAndUpdate(
      filter,
      {
        $set: {
          "settings.bannerUrl": bannerUrl,
          "branding.banner": bannerUrl, // compat
        },
      },
      { new: true }
    ).lean();

    if (!updated) {
      console.warn("[updateStoreBanner] store no encontrada", { id });
      throw ERR.NOT_FOUND("Store not found");
    }

    console.log("[updateStoreBanner] OK", {
      id: updated._id,
      bannerUrl: updated.settings?.bannerUrl || updated.branding?.banner,
    });

    return res.json({ row: updated });
  } catch (err) {
    console.error("[updateStoreBanner] ERROR", err);
    return next(err);
  }
}