// server/controllers/admin.users.controller.js
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import UserModel from "../models/user.model.js";
import StoreModel from "../models/store.model.js";
import { ERR } from "../utils/httpError.js";
import { ALL_ROLES, ROLES, isPlatformSuperAdmin } from "../config/roles.js";
import { escapeRegexExp } from "../utils/escapeRegexExp.js";

/* ========= Helpers ========= */
const isId = (v) => mongoose.Types.ObjectId.isValid(String(v || ""));
const normalizeStr = (s) => String(s || "").trim();
const pickRole = (r) => (ALL_ROLES.includes(r) ? r : null);
const pickStatus = (s) => {
  const x = String(s || "").trim().toLowerCase();
  if (!x) return null;
  if (["disabled", "deactive", "inactive"].includes(x)) return "suspended";
  return ["active", "suspended"].includes(x) ? x : null;
};

// Roles que NO cuentan como "operativos" para el límite de 2
const IMPLICIT_ROLES = ["CUSTOMER", "USER"];
const MAX_OPERATIONAL_ROLES = 2;

/**
 * Cuenta los roles operativos actuales del usuario (excluyendo CUSTOMER/USER).
 * Retorna un Set con los roles operativos únicos.
 */
function getOperationalRoles(user) {
  const ops = new Set();
  const pr = String(user.platformRole || "").trim().toUpperCase();
  if (pr && !IMPLICIT_ROLES.includes(pr)) ops.add(pr);

  const legacy = String(user.role || "").trim().toUpperCase();
  if (legacy && !IMPLICIT_ROLES.includes(legacy) && legacy !== pr) ops.add(legacy);

  if (Array.isArray(user.memberships)) {
    for (const m of user.memberships) {
      const r = String(m?.role || "").trim().toUpperCase();
      if (r && !IMPLICIT_ROLES.includes(r) && String(m?.status || "").toLowerCase() === "active") {
        ops.add(r);
      }
    }
  }
  return ops;
}

/**
 * Valida que agregar newRole no exceda el límite de roles operativos.
 * Lanza error si se excede.
 */
function validateMaxRoles(user, newRole) {
  if (!newRole || IMPLICIT_ROLES.includes(newRole.toUpperCase())) return;
  const current = getOperationalRoles(user);
  // Si ya tiene este rol, no suma
  if (current.has(newRole.toUpperCase())) return;
  if (current.size >= MAX_OPERATIONAL_ROLES) {
    throw ERR.VALIDATION(
      `El usuario ya tiene ${current.size} roles operativos (${[...current].join(", ")}). ` +
      `Máximo permitido: ${MAX_OPERATIONAL_ROLES}. Retire un rol antes de asignar otro.`
    );
  }
}
const normStatusFilter = (s) => {
  const wanted = pickStatus(s);
  return wanted ? { $regex: `^${wanted}$`, $options: "i" } : null;
};

/* ========= CREATE ========= */
// POST /api/admin/users
// body: { name, email, password?, accountType:'SUPER'|'OWNER'|'STAFF'|'CUSTOMER', role?, storeId?, createStore?, store?:{name,slug} }
export async function createAdminUserController(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      accountType, // 'SUPER' | 'OWNER' | 'STAFF' | 'CUSTOMER'
      role,
      storeId,
      createStore,
      store,
    } = req.body || {};

    if (!name || !email) throw ERR.VALIDATION("name and email are required");
    const normEmail = String(email).trim().toLowerCase();

    const exists = await UserModel.findOne({ email: normEmail }).select("_id");
    if (exists) throw ERR.CONFLICT("Email already in use");

    let passwordHash;
    if (accountType !== "SUPER") {
      if (!password || String(password).length < 8) {
        throw ERR.VALIDATION("Password must be at least 8 characters");
      }
      passwordHash = await bcryptjs.hash(String(password), 10);
    }

    const baseUser = {
      name: String(name).trim(),
      email: normEmail,
      verify_email: true,
      status: "active",
      signUpWithGoogle: false,
    };
    if (passwordHash) baseUser.password = passwordHash;

    const user = await UserModel.create(baseUser);

    // SUPER
    if (accountType === "SUPER") {
      user.role = "SUPER_ADMIN";
      user.roles = Array.isArray(user.roles)
        ? Array.from(new Set([...(user.roles || []), "SUPER_ADMIN"]))
        : ["SUPER_ADMIN"];
      await user.save();
    }

    let createdStore = null;

    // OWNER
    if (accountType === "OWNER") {
      if (createStore) {
        if (!store?.name || !store?.slug) {
          throw ERR.VALIDATION("store.name and store.slug are required when createStore is true");
        }
        const slug = String(store.slug).trim().toLowerCase();
        const dupSlug = await StoreModel.exists({ slug });
        if (dupSlug) throw ERR.CONFLICT("Store slug already in use");

        createdStore = await StoreModel.create({
          name: String(store.name).trim(),
          slug,
        });

        user.memberships = [
          ...(user.memberships || []),
          { storeId: createdStore._id, role: "STORE_OWNER", status: "active" },
        ];
        await user.save();
      } else if (storeId) {
        if (!isId(storeId)) throw ERR.VALIDATION("storeId invalid");
        user.memberships = [
          ...(user.memberships || []),
          { storeId, role: "STORE_OWNER", status: "active" },
        ];
        await user.save();
      }
    }

    // STAFF
    if (accountType === "STAFF") {
      if (!isId(storeId)) throw ERR.VALIDATION("storeId is required for STAFF");
      const staffRole = pickRole(role);
      if (!staffRole) throw ERR.VALIDATION("role is required for STAFF");

      const has = await UserModel.findOne({ _id: user._id, "memberships.storeId": storeId }).lean();
      if (has) {
        await UserModel.updateOne(
          { _id: user._id, "memberships.storeId": storeId },
          { $set: { "memberships.$.role": staffRole, "memberships.$.status": "active" } }
        );
      } else {
        await UserModel.updateOne(
          { _id: user._id },
          { $push: { memberships: { storeId, role: staffRole, status: "active" } } }
        );
      }
    }

    const payload = {
      message: "User created",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || null,
        roles: user.roles || [],
        status: user.status,
        memberships: user.memberships || [],
      },
      store: createdStore
        ? { _id: createdStore._id, name: createdStore.name, slug: createdStore.slug }
        : null,
    };

    return typeof res.created === "function" ? res.created(payload) : res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
}

/* ========= LIST (GET /api/admin/users) ========= */
export async function listUsers(req, res, next) {
  try {
    const q = normalizeStr(req.query.q);
    const role = pickRole(normalizeStr(req.query.role));
    const status = pickStatus(normalizeStr(req.query.status));
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
    const sort = String(req.query.sort || "createdAt:desc");
    const [field, dir = "desc"] = sort.split(":");
    const sortBy = { [field || "createdAt"]: dir === "asc" ? 1 : -1 };

    // ---- filtro seguro
    const filter = {};
    if (q) {
      const raw = String(q).trim();
      const rx = new RegExp(escapeRegexExp(raw), "i");
      const or = [{ name: rx }, { email: rx }];
      if (/^\d+$/.test(raw)) or.push({ mobile: Number(raw) }); // mobile es Number → sin regex
      filter.$or = or;
    }

    // ⚠️ filtra contra ambos campos
    if (role) {
      filter.$or = Array.isArray(filter.$or) ? filter.$or : undefined;
      const base = { $or: [{ platformRole: role }, { role }] };
      // si ya había $or por q, combina con $and
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, base];
        delete filter.$or;
      } else {
        Object.assign(filter, base);
      }
    }

    if (status) filter.status = { $regex: `^${status}$`, $options: "i" };

    const [items, total] = await Promise.all([
      UserModel.find(filter)
        .select("_id name email mobile avatar role platformRole status memberships createdAt") // ⬅️ incluye platformRole
        .sort(sortBy)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(filter),
    ]);

    const resp = { items, total, page, limit };

    // no-cache para evitar respuestas antiguas
    res.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    return typeof res.ok === "function" ? res.ok(resp) : res.json(resp);
  } catch (err) {
    next(err);
  }
}

/* ========= LIST (GET /api/admin/users) — versión unificada para admin ========= */
// ✅ Compatible con platformRole o role y sin regex sobre `mobile:Number`
export async function listAdminUsersController(req, res, next) {
  try {
    const { q = "", role = "", status = "", page = 1, limit = 20 } = req.query;

    const p = Math.max(1, parseInt(page, 10));
    const l = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const and = [];

    // Búsqueda por nombre / email (regex seguro) y móvil (solo si q es numérico)
    if (q && String(q).trim()) {
      const raw = String(q).trim();
      const safe = escapeRegexExp(raw);
      const rx = new RegExp(safe, "i");

      const or = [{ name: rx }, { email: rx }];
      if (/^\d+$/.test(raw)) {
        or.push({ mobile: Number(raw) }); // ← sin regex sobre Number
      }
      and.push({ $or: or });
    }

    // Filtro por rol: usa platformRole si existe; si no, role
    if (role) {
      const r = String(role).trim();
      and.push({ $or: [{ platformRole: r }, { role: r }] });
    }

    // Filtro por status (anclado e insensible a mayúsculas)
    if (status) {
      const safeStatus = escapeRegexExp(String(status).trim());
      and.push({ status: new RegExp(`^${safeStatus}$`, "i") });
    }

    const filter = and.length === 0 ? {} : and.length === 1 ? and[0] : { $and: and };

    const [rows, total] = await Promise.all([
      UserModel.find(filter)
        .select("name email mobile avatar status platformRole role memberships createdAt")
        .sort({ createdAt: -1 })
        .skip((p - 1) * l)
        .limit(l)
        .lean(),
      UserModel.countDocuments(filter),
    ]);

    return res.json({ total, page: p, limit: l, data: rows });
  } catch (err) {
    return next(ERR.SERVER("No se pudo listar usuarios"));
  }
}

/* ========= UPDATE platformRole con reglas de seguridad ========= */
// POST /api/admin/users/platform-role { userId, role }
export async function updateUserPlatformRoleController(req, res, next) {
  try {
    const { userId, role } = req.body; // target
    if (!userId || !role) throw ERR.VALIDATION("userId y role son requeridos");

    // 1) Si están intentando poner SUPER_ADMIN…
    if (role === ROLES.SUPER_ADMIN) {
      // …solo alguien de la lista .env puede hacerlo:
      if (!isPlatformSuperAdmin(req.user?.email || req.user)) {
        throw ERR.FORBIDDEN("Solo super admins de plataforma pueden asignar SUPER_ADMIN");
      }
      // …y solo si el destinatario también está en la lista .env:
      const target = await UserModel.findById(userId).select("email").lean();
      if (!target) throw ERR.NOT_FOUND("Usuario no encontrado");
      if (!isPlatformSuperAdmin(target.email)) {
        throw ERR.VALIDATION("Este email no está autorizado como SUPER_ADMIN");
      }
    }

    // 2) Validar límite de roles operativos
    const target = await UserModel.findById(userId)
      .select("name email platformRole role memberships status")
      .lean();
    if (!target) throw ERR.NOT_FOUND("Usuario no encontrado");
    validateMaxRoles(target, role);

    // 3) Actualizar
    const doc = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { platformRole: role } },
      { new: true }
    )
      .select("name email platformRole status")
      .lean();

    return res.json({ ok: true, user: doc });
  } catch (err) {
    next(err);
  }
}

/* ========= BULK ops ========= */
// POST /api/admin/users/bulk/status { ids:[], status:"active"|"suspended" }
export async function bulkStatus(req, res, next) {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(isId) : [];
    const status = pickStatus(req.body?.status);
    if (!ids.length) throw ERR.VALIDATION("ids required");
    if (!status) throw ERR.VALIDATION("status invalid");

    const r = await UserModel.updateMany({ _id: { $in: ids } }, { $set: { status } });
    const resp = { updated: ids.length, status, modified: r.modifiedCount };
    return typeof res.ok === "function" ? res.ok(resp) : res.json(resp);
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/users/bulk/role { ids:[], role:"STORE_OWNER"|... }
export async function bulkRole(req, res, next) {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(isId) : [];
    const role = pickRole(req.body?.role);
    if (!ids.length) throw ERR.VALIDATION("ids required");
    if (!role) throw ERR.VALIDATION("role invalid");

    const r = await UserModel.updateMany({ _id: { $in: ids } }, { $set: { role } });
    const resp = { updated: ids.length, role, modified: r.modifiedCount };
    return typeof res.ok === "function" ? res.ok(resp) : res.json(resp);
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/users/bulk/membership { ids:[], storeId, role }
export async function bulkMembership(req, res, next) {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(isId) : [];
    const storeId = req.body?.storeId;
    const storeRole = pickRole(req.body?.role);
    if (!ids.length) throw ERR.VALIDATION("ids required");
    if (!isId(storeId)) throw ERR.VALIDATION("storeId invalid");
    if (!storeRole) throw ERR.VALIDATION("role invalid");

    const opsAdd = ids.map((_id) =>
      UserModel.updateOne(
        { _id, "memberships.storeId": { $ne: storeId } },
        { $push: { memberships: { storeId, role: storeRole, status: "active" } } }
      )
    );
    const opsUpd = ids.map((_id) =>
      UserModel.updateOne(
        { _id, "memberships.storeId": storeId },
        { $set: { "memberships.$.role": storeRole, "memberships.$.status": "active" } }
      )
    );

    const results = await Promise.all([...opsAdd, ...opsUpd]);
    const modified = results.reduce((acc, r) => acc + (r.modifiedCount || 0), 0);

    const resp = { updated: ids.length, storeId, role: storeRole, modified };
    return typeof res.ok === "function" ? res.ok(resp) : res.json(resp);
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/users/bulk/delete { ids:[] }
export async function bulkDelete(req, res, next) {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(isId) : [];
    if (!ids.length) throw ERR.VALIDATION("ids required");

    const r = await UserModel.deleteMany({ _id: { $in: ids } });
    const resp = { deleted: r.deletedCount };
    return typeof res.ok === "function" ? res.ok(resp) : res.json(resp);
  } catch (err) {
    next(err);
  }
}

/* ========= Single ops ========= */
// PATCH /api/admin/users/:id/status { status }
export async function updateStatus(req, res, next) {
  try {
    const id = req.params.id;
    const status = pickStatus(req.body?.status);
    if (!isId(id)) throw ERR.NOT_FOUND("user not found");
    if (!status) throw ERR.VALIDATION("status invalid");

    const r = await UserModel.updateOne({ _id: id }, { $set: { status } });
    const resp = { id, status, modified: r.modifiedCount };
    return typeof res.ok === "function" ? res.ok(resp) : res.json(resp);
  } catch (err) {
    next(err);
  }
}

// === BULK: actualizar platformRole para varios usuarios ===
// POST /api/admin/users/bulk/platform-role  { ids: string[], role: string }
export async function bulkPlatformRole(req, res, next) {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const role = String(req.body?.role || "").trim();

    if (!ids.length) throw ERR.VALIDATION("ids requeridos");
    if (!role) throw ERR.VALIDATION("role requerido");
    if (!ALL_ROLES.includes(role)) throw ERR.VALIDATION("role inválido");

    // Si quieren poner SUPER_ADMIN:
    if (role === ROLES.SUPER_ADMIN) {
      // …solo alguien en la lista .env puede hacerlo
      const requester = req.user?.email || req.user;
      if (!isPlatformSuperAdmin(requester)) {
        throw ERR.FORBIDDEN("Solo super admins de plataforma pueden asignar SUPER_ADMIN");
      }

      // …y solo a destinatarios en la lista .env
      const targets = await UserModel.find({ _id: { $in: ids } })
        .select("_id email")
        .lean();

      const notAllowed = targets.filter((t) => !isPlatformSuperAdmin(t.email));
      if (notAllowed.length) {
        const emails = notAllowed.map((t) => t.email).join(", ");
        throw ERR.VALIDATION(
          `Estos emails no están autorizados como SUPER_ADMIN: ${emails}`
        );
      }
    }

    const r = await UserModel.updateMany(
      { _id: { $in: ids } },
      { $set: { platformRole: role } }
    );

    return res.json({
      ok: true,
      updated: ids.length,
      modified: r.modifiedCount || 0,
      role,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/users/:id/role { role }
export async function updateRole(req, res, next) {
  try {
    const id = req.params.id;
    const role = pickRole(req.body?.role);
    if (!isId(id)) throw ERR.NOT_FOUND("user not found");
    if (!role) throw ERR.VALIDATION("role invalid");

    // Validar límite de roles operativos
    const user = await UserModel.findById(id).select("platformRole role memberships").lean();
    if (!user) throw ERR.NOT_FOUND("user not found");
    validateMaxRoles(user, role);

    const r = await UserModel.updateOne({ _id: id }, { $set: { role } });
    const resp = { id, role, modified: r.modifiedCount };
    return typeof res.ok === "function" ? res.ok(resp) : res.json(resp);
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/users/:id/memberships { storeId, role }
export async function addMembership(req, res, next) {
  try {
    const id = req.params.id;
    const storeId = req.body?.storeId;
    const storeRole = pickRole(req.body?.role);
    if (!isId(id)) throw ERR.NOT_FOUND("user not found");
    if (!isId(storeId)) throw ERR.VALIDATION("storeId invalid");
    if (!storeRole) throw ERR.VALIDATION("role invalid");

    const user = await UserModel.findById(id)
      .select("platformRole role memberships")
      .lean();
    if (!user) throw ERR.NOT_FOUND("user not found");

    // Validar límite de roles operativos (solo si es un rol nuevo, no update)
    const existingMembership = user.memberships?.find(
      (m) => String(m.storeId) === String(storeId)
    );
    if (!existingMembership) {
      validateMaxRoles(user, storeRole);
    }

    if (existingMembership) {
      const r = await UserModel.updateOne(
        { _id: id, "memberships.storeId": storeId },
        { $set: { "memberships.$.role": storeRole, "memberships.$.status": "active" } }
      );
      const resp = { id, storeId, role: storeRole, modified: r.modifiedCount };
      return typeof res.ok === "function" ? res.ok(resp) : res.json(resp);
    } else {
      const r = await UserModel.updateOne(
        { _id: id },
        { $push: { memberships: { storeId, role: storeRole, status: "active" } } }
      );
      const resp = { id, storeId, role: storeRole, modified: r.modifiedCount };
      return typeof res.ok === "function" ? res.ok(resp) : res.json(resp);
    }
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/users/:id/memberships/:storeId
export async function removeMembership(req, res, next) {
  try {
    const id = req.params.id;
    const storeId = req.params.storeId;
    if (!isId(id)) throw ERR.NOT_FOUND("user not found");
    if (!isId(storeId)) throw ERR.VALIDATION("storeId invalid");

    const r = await UserModel.updateOne(
      { _id: id },
      { $pull: { memberships: { storeId } } }
    );
    const resp = { id, storeId, removed: true, modified: r.modifiedCount };
    return typeof res.ok === "function" ? res.ok(resp) : res.json(resp);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/users/:id
export async function removeUser(req, res, next) {
  try {
    const id = req.params.id;
    if (!isId(id)) throw ERR.NOT_FOUND("user not found");
    const r = await UserModel.deleteOne({ _id: id });
    const resp = { id, deleted: true, deletedCount: r.deletedCount };
    return typeof res.ok === "function" ? res.ok(resp) : res.json(resp);
  } catch (err) {
    next(err);
  }
}
