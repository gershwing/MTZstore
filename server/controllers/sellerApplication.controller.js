// server/controllers/sellerApplication.controller.js
import mongoose from 'mongoose';
import slugify from 'slugify';
import { ERR } from '../utils/httpError.js';
import SellerApplication from '../models/sellerApplication.model.js';
import StoreModel from '../models/store.model.js';
import UserModel from '../models/user.model.js';
import { ROLES } from '../config/roles.js';
import { emitToUser } from "../index.js"; // <- Debe mapear userId -> sockets y emitir

// Emails
import sendEmailFun from '../config/sendEmail.js';
import sellerApprovedTemplate from '../utils/emailTemplates/sellerApproved.js';
import sellerRejectedTemplate from '../utils/emailTemplates/sellerRejected.js';
import sellerReceived from '../utils/emailTemplates/sellerReceived.js';

const SHOULD_SEND_EMAILS = String(process.env.SEND_EMAILS ?? 'true') !== 'false';
const DEFAULT_FROM = process.env.EMAIL_FROM || 'MTZstore <no-reply@mtzstore.com>';

// 🔔 Evento de Socket.IO centralizado
const SOCKET_EVENT = "seller-app:status";
const TENANT_EVENT = "tenant:changed";

/* ===== Utils ===== */
const norm = (v) => String(v ?? '').trim();
const isId = (v) => mongoose.Types.ObjectId.isValid(String(v ?? ''));
const toStatusUp = (v) => {
  const x = String(v || '').trim().toUpperCase();
  return ['PENDING', 'APPROVED', 'REJECTED'].includes(x) ? x : undefined;
};
const toInt = (v, d = 1) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : d;
};

/* ========================================================================= */
/* ======================= ADMIN: LISTAR / VER ============================= */
/* ========================================================================= */
export async function listSellerAppsAdmin(req, res, next) {
  try {
    const { page = 1, limit = 20, status, q, userId } = req.query || {};
    const pageN = Math.min(1000000, toInt(page, 1));
    const limitN = Math.min(100, toInt(limit, 20));
    const skip = (pageN - 1) * limitN;

    const $and = [{ deletedAt: { $exists: false } }];
    const statusUp = toStatusUp(status);
    if (statusUp) $and.push({ status: statusUp });
    if (userId && isId(userId)) $and.push({ userId });

    if (q && String(q).trim()) {
      const rx = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      $and.push({
        $or: [
          { storeName: rx },
          { businessName: rx },
          { description: rx },
          { documentNumber: rx },
          { notes: rx },
        ],
      });
    }

    const [items, total] = await Promise.all([
      SellerApplication.find({ $and })
        .populate('userId', 'name email')
        .populate('reviewedBy', 'name email')
        .populate('storeId', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitN)
        .lean(),
      SellerApplication.countDocuments({ $and }),
    ]);

    res.json({
      items,
      total,
      page: pageN,
      limit: limitN,
      totalPages: Math.max(1, Math.ceil(total / limitN)),
      hasNextPage: pageN * limitN < total,
      hasPrevPage: pageN > 1,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSellerAppById(req, res, next) {
  try {
    const id = req.params.id;
    if (!isId(id)) return res.status(400).json({ error: 'Invalid id' });
    const app = await SellerApplication.findOne({ _id: id, deletedAt: { $exists: false } })
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('storeId', 'name slug')
      .lean();
    if (!app) return res.status(404).json({ error: 'Not found' });
    res.json({ data: app });
  } catch (err) {
    next(err);
  }
}

/* ========================================================================= */
/* ======================== ADMIN: APROBAR ================================= */
/* ========================================================================= */
export async function approveSellerApplicationController(req, res, next) {
  // (opcional) define el evento si no lo tienes en constantes globales
  const TENANT_EVENT = typeof globalThis?.TENANT_EVENT === "string" ? globalThis.TENANT_EVENT : "tenant:changed";
  const SOCKET_EVENT = typeof globalThis?.SOCKET_EVENT === "string" ? globalThis.SOCKET_EVENT : "seller-app:status";

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const id = req.params.id;
    const { store, notes } = req.body || {};
    if (!id || !isId(id)) throw ERR.VALIDATION("Valid application id required");

    // 1) Traer solicitud (no borrada)
    const app = await SellerApplication.findOne({ _id: id, deletedAt: { $exists: false } })
      .session(session);

    if (!app) throw ERR.NOT_FOUND("Application not found");

    // 👇 Categoría principal elegida en la solicitud (ObjectId o desde formData)
    const categoryId =
      (app.categoryId && app.categoryId._id ? app.categoryId._id : app.categoryId) ||
      (app.formData && app.formData.categoryId) ||
      null;

    // ─────────────────────────────────────────────────────────────
    // 🛠️ SELF-HEAL si ya estaba APPROVED (antes de exigir PENDING)
    // ─────────────────────────────────────────────────────────────
    if (app.status === "APPROVED") {
      const user = await UserModel.findById(app.userId).session(session);
      if (!user) {
        await session.commitTransaction();
        session.endSession();
        return res.json({
          message: "Application already approved but user missing",
          application: { _id: app._id, status: app.status },
        });
      }

      let createdStore = null;

      if (!app.storeId) {
        const baseName =
          app.formData?.storeName ||
          app.businessName ||
          app.storeName ||
          `Store ${user.name || user.email}`;
        const storeName = (baseName || "Mi Tienda").trim();

        let baseSlug = slugify(storeName, { lower: true, strict: true }) || `store-${user._id}`;
        let storeSlug = baseSlug;
        let i = 1;
        while (await StoreModel.exists({ slug: storeSlug }).session(session)) {
          storeSlug = `${baseSlug}-${i++}`;
        }

        createdStore = await StoreModel.create(
          [
            {
              name: storeName,
              slug: storeSlug,
              ownerId: user._id,
              currency: "BOB",
              ...(categoryId ? { categoryId } : {}),
              status: "active",
              phone: app.phone || user.mobile || "",
              email: user.email || "",
            },
          ],
          { session }
        ).then((r) => r[0]);

        app.storeId = createdStore._id;
        await app.save({ session });
      } else {
        createdStore = await StoreModel.findById(app.storeId).session(session);

        // Si la tienda existe pero no tiene categoryId, lo rellenamos desde la app
        if (createdStore && categoryId && !createdStore.categoryId) {
          createdStore.categoryId = categoryId;
          await createdStore.save({ session });
        }
      }

      // asegurar rol + membership
      const targetRole = ROLES?.STORE_OWNER || "STORE_OWNER";
      const roles = new Set([...(user.roles || [])]);
      roles.add(targetRole);
      user.roles = Array.from(roles);

      // ⬅️⬅️ NUEVO: fijar platformRole si está vacío o sigue en CUSTOMER
      if (!user.platformRole || String(user.platformRole).toUpperCase() === "CUSTOMER") {
        user.platformRole = targetRole;
      }
      user.role = targetRole;

      const memberships = Array.isArray(user.memberships) ? user.memberships : [];
      const has = memberships.some(
        (m) =>
          String(m.storeId) === String(app.storeId) &&
          (m.role === targetRole ||
            (Array.isArray(m.roles) && m.roles.includes(targetRole)))
      );
      if (!has && app.storeId) {
        memberships.push({
          storeId: app.storeId,
          role: targetRole,
          roles: [targetRole], // ← agregado (compat con UI)
          status: "active", // ← mantener minúsculas por tus checks
          assignedBy: req.user?._id || req.userId || null,
          assignedAt: new Date(),
        });
        user.memberships = memberships;
      }

      // ✅ Asegura default/active tenant para auto-selección en el front
      if (app.storeId) {
        user.defaultStoreId = app.storeId; // ← ahora lo fijamos siempre
        if (!user.activeStoreId) user.activeStoreId = app.storeId;
      }

      // ✅ activa el usuario
      user.status = "active";

      await user.save({ session });

      // ✅ Commit antes de emitir
      await session.commitTransaction();
      session.endSession();

      // 🔔 Notificar al usuario (Socket.IO) inmediatamente
      try {
        emitToUser(app.userId, SOCKET_EVENT, {
          status: "APPROVED",
          applicationId: String(app._id),
          storeId: String((createdStore && createdStore._id) || app.storeId),
        });
        emitToUser(app.userId, "role:changed", { at: Date.now() });
        // ➕ Notifica cambio de tenant para que el front fije X-Store-Id
        emitToUser(app.userId, TENANT_EVENT, {
          storeId: String((createdStore && createdStore._id) || app.storeId),
          reason: "seller_approved_selfheal",
        });
      } catch (e) {
        console.error("[socket][seller-app:status] emit failed:", e?.message || e);
      }

      return res.json({
        message: "Application already approved (repaired if needed)",
        application: {
          _id: app._id,
          status: app.status,
          reviewedBy: app.reviewedBy,
          reviewedAt: app.reviewedAt,
          notes: app.notes,
          storeId: app.storeId,
        },
        store: createdStore
          ? { _id: createdStore._id, name: createdStore.name, slug: createdStore.slug }
          : app.storeId
            ? { _id: app.storeId }
            : null,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          platformRole: user.platformRole,
        },
      });
    }

    if (app.status !== "PENDING") {
      throw ERR.VALIDATION("Only PENDING applications can be approved");
    }

    // 2) Traer usuario
    const user = await UserModel.findById(app.userId).session(session);
    if (!user) throw ERR.NOT_FOUND("User not found for this application");

    // 2.1) No aprobar si el usuario no verificó su email
    if (user.verify_email !== true) {
      throw ERR.VALIDATION("Cannot approve: user has not verified their email yet");
    }

    // 3) Determinar nombre y slug de la tienda
    const nameFromForm =
      app.formData?.storeName ||
      app.formData?.businessName ||
      app.formData?.name ||
      app.businessName ||
      app.storeName ||
      "";

    const storeName = norm(
      store?.name || nameFromForm || `Store ${user.name || user.email}`
    );
    if (!storeName) throw ERR.VALIDATION("Store name is required to approve");

    let baseSlug =
      norm(store?.slug) ||
      slugify(storeName, { lower: true, strict: true }) ||
      `store-${user._id}`;
    let storeSlug = baseSlug;
    {
      let i = 1;
      while (await StoreModel.exists({ slug: storeSlug }).session(session)) {
        storeSlug = `${baseSlug}-${i++}`;
      }
    }

    const currency = norm(store?.currency || "BOB");

    // 4) Crear tienda (reusar si existe)
    let createdStore = await StoreModel.findOne({
      ownerId: user._id,
      name: storeName,
    }).session(session);

    if (!createdStore) {
      createdStore = await StoreModel.create(
        [
          {
            name: storeName,
            slug: storeSlug,
            ownerId: user._id,
            ...(currency ? { currency } : {}),
            ...(categoryId ? { categoryId } : {}),
            status: "active",
            phone: app.phone || user.mobile || "",
            email: user.email || "",
          },
        ],
        { session }
      ).then((r) => r[0]);
    } else if (categoryId && !createdStore.categoryId) {
      // Si ya existía la tienda pero sin categoría, la completamos
      createdStore.categoryId = categoryId;
      await createdStore.save({ session });
    }

    // 5) Rol y membresía
    const targetRole = ROLES?.STORE_OWNER || "STORE_OWNER";
    const roles = new Set([...(user.roles || [])]);
    roles.add(targetRole);
    user.roles = Array.from(roles);

    // ⬅️⬅️ NUEVO: fijar platformRole si está vacío o en CUSTOMER
    if (
      !user.platformRole ||
      String(user.platformRole).toUpperCase() === "CUSTOMER"
    ) {
      user.platformRole = targetRole;
    }

    const memberships = Array.isArray(user.memberships)
      ? user.memberships
      : [];
    const alreadyHas = memberships.some(
      (m) =>
        String(m.storeId) === String(createdStore._id) &&
        (m.role === targetRole ||
          (Array.isArray(m.roles) && m.roles.includes(targetRole)))
    );
    if (!alreadyHas) {
      memberships.push({
        storeId: createdStore._id,
        role: targetRole,
        roles: [targetRole], // ← agregado (compat con UI)
        status: "active", // ← minúsculas para no romper checks existentes
        assignedBy: req.user?._id || req.userId || null,
        assignedAt: new Date(),
      });
      user.memberships = memberships;
    }

    // ✅ Escribe SIEMPRE defaultStoreId a la tienda creada
    user.defaultStoreId = createdStore._id;
    // Mantén activeStoreId si ya existía; si no, inicialízalo
    if (!user.activeStoreId) user.activeStoreId = createdStore._id;

    // ✅ activa el usuario
    user.status = "active";

    await user.save({ session });

    // 6) Marcar la solicitud como aprobada
    app.status = "APPROVED";
    app.reviewedBy = req.user?._id || req.userId || null;
    app.reviewedAt = new Date();
    app.notes = norm(notes || app.notes || "");
    app.storeId = createdStore._id;
    await app.save({ session });

    // 7) Commit
    await session.commitTransaction();
    session.endSession();

    // 🔔 Notificar (Socket.IO) antes de emails/lógicas lentas
    try {
      emitToUser(app.userId, SOCKET_EVENT, {
        status: "APPROVED",
        applicationId: String(app._id),
        storeId: String(createdStore._id || app.storeId),
      });
      emitToUser(app.userId, "role:changed", { at: Date.now() });
      // ➕ Notifica cambio de tenant para que el front fije X-Store-Id
      emitToUser(app.userId, TENANT_EVENT, {
        storeId: String(createdStore._id || app.storeId),
        reason: "seller_approved",
      });
    } catch (e) {
      console.error("[socket][seller-app:status] emit failed:", e?.message || e);
    }

    // 8) Email best-effort (fuera de la transacción)
    if (SHOULD_SEND_EMAILS) {
      (async () => {
        try {
          await sendEmailFun({
            from: DEFAULT_FROM,
            sendTo: user.email,
            subject: "MTZstore: ¡Tu tienda fue aprobada!",
            html: sellerApprovedTemplate({
              userName: user.name,
              storeName: createdStore.name,
            }),
          });
        } catch (e) {
          console.error("[email][seller-approved] failed:", e?.message || e);
        }
      })();
    }

    return res.json({
      message: "Application approved",
      application: {
        _id: app._id,
        status: app.status,
        reviewedBy: app.reviewedBy,
        reviewedAt: app.reviewedAt,
        notes: app.notes,
        storeId: createdStore._id,
      },
      store: {
        _id: createdStore._id,
        name: createdStore.name,
        slug: createdStore.slug,
      },
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        platformRole: user.platformRole,
      },
    });
  } catch (e) {
    await session.abortTransaction().catch(() => { });
    session.endSession();

    if (e?.name === "ValidationError" && e?.errors) {
      const details = {};
      for (const [k, v] of Object.entries(e.errors)) {
        details[k] = { message: v?.message, path: v?.path, kind: v?.kind };
      }
      return res.status(422).json({
        error: true,
        code: "VALIDATION_ERROR",
        message: e.message || "Store validation failed",
        details,
      });
    }
    return next(e);
  }
}


/* ========================================================================= */
/* ======================== ADMIN: RECHAZAR ================================ */
/* ========================================================================= */
export async function rejectSellerApplicationController(req, res, next) {
  try {
    const id = req.params.id;
    if (!id || !isId(id)) throw ERR.VALIDATION('Valid application id required');

    const { notes, reason, allowReapply = true } = req.body || {};
    const reasonText = norm(notes || reason || '');

    // Solo PENDING y no borrada
    const filter = { _id: id, status: 'PENDING', deletedAt: { $exists: false } };

    const update = {
      $set: {
        status: 'REJECTED',
        reviewedBy: req.user?._id || req.userId || null,
        reviewedAt: new Date(),
        notes: reasonText,
        allowReapply: !!allowReapply,
      },
    };

    // ⬅️ clave: no correr validaciones completas del schema
    const app = await SellerApplication.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: false,
    });

    if (!app) throw ERR.VALIDATION('Only PENDING applications can be rejected');

    // 🔔 Socket.IO: notificar rechazo
    try {
      emitToUser(app.userId, SOCKET_EVENT, {
        status: "REJECTED",
        applicationId: String(app._id),
        notes: app.notes || "",
        allowReapply: !!app.allowReapply,
      });
    } catch (e) {
      console.error("[socket][seller-app:status][rejected] emit failed:", e?.message || e);
    }

    // Email (best-effort)
    if (SHOULD_SEND_EMAILS) {
      (async () => {
        try {
          const applicant = await UserModel.findById(app.userId)
            .select('name email')
            .lean()
            .catch(() => null);
          await sendEmailFun({
            from: DEFAULT_FROM,
            sendTo: applicant?.email || undefined,
            subject: 'MTZstore: Tu solicitud fue rechazada',
            html: sellerRejectedTemplate({ userName: applicant?.name, reason: app.notes }),
          });
        } catch (e) {
          console.error('[email][seller-rejected] failed:', e?.message || e);
        }
      })();
    }

    return res.json({
      message: 'Application rejected',
      application: {
        _id: app._id,
        status: app.status,
        reviewedBy: app.reviewedBy,
        reviewedAt: app.reviewedAt,
        notes: app.notes,
        allowReapply: !!app.allowReapply,
      },
    });
  } catch (e) {
    return next(e);
  }
}


// Reparación masiva de aprobadas sin tienda/membresías
export async function repairApprovedSellerApplications(req, res, next) {
  // (opcional) define los eventos si no están en constantes globales
  const TENANT_EVENT = typeof globalThis?.TENANT_EVENT === "string" ? globalThis.TENANT_EVENT : "tenant:changed";
  const SOCKET_EVENT = typeof globalThis?.SOCKET_EVENT === "string" ? globalThis.SOCKET_EVENT : "seller-app:status";

  try {
    const apps = await SellerApplication.find({
      status: "APPROVED",
      deletedAt: { $exists: false },
    }).lean();

    let repaired = 0, skipped = 0, errors = 0;

    for (const a of apps) {
      try {
        const user = await UserModel.findById(a.userId);
        if (!user) { skipped++; continue; }

        // Categoría principal desde la solicitud (si existe)
        const categoryId =
          (a.categoryId && a.categoryId._id ? a.categoryId._id : a.categoryId) ||
          (a.formData && a.formData.categoryId) ||
          null;

        let storeId = a.storeId;
        let storeDoc = storeId ? await StoreModel.findById(storeId) : null;

        if (!storeDoc) {
          const baseName =
            a.formData?.storeName ||
            a.businessName ||
            a.storeName ||
            `Store ${user.name || user.email}`;
          const storeName = (baseName || "Mi Tienda").trim();

          let baseSlug = slugify(storeName, { lower: true, strict: true }) || `store-${user._id}`;
          let storeSlug = baseSlug; let i = 1;
          while (await StoreModel.exists({ slug: storeSlug })) storeSlug = `${baseSlug}-${i++}`;

          storeDoc = await StoreModel.create({
            name: storeName,
            slug: storeSlug,
            ownerId: user._id,
            currency: "BOB",
            ...(categoryId ? { categoryId } : {}),
            status: "active",
            phone: a.phone || user.mobile || "",
            email: user.email || "",
          });
          storeId = storeDoc._id;
          await SellerApplication.updateOne({ _id: a._id }, { $set: { storeId } });
        } else if (categoryId && !storeDoc.categoryId) {
          // Tienda ya existe pero sin categoría: la parcheamos
          storeDoc.categoryId = categoryId;
          await storeDoc.save();
        }

        const targetRole = ROLES?.STORE_OWNER || "STORE_OWNER";

        // ➕ asegurar rol agregado a user.roles
        const rolesSet = new Set([...(user.roles || [])]);
        rolesSet.add(targetRole);
        user.roles = Array.from(rolesSet);

        // ➕ fijar platformRole si falta o sigue en CUSTOMER
        if (!user.platformRole || String(user.platformRole).toUpperCase() === "CUSTOMER") {
          user.platformRole = targetRole;
        }
        user.role = targetRole;

        // ➕ asegurar membership (chequea role y roles[])
        const memberships = Array.isArray(user.memberships) ? user.memberships : [];
        const has = memberships.some(m =>
          String(m.storeId) === String(storeId) &&
          (m.role === targetRole || (Array.isArray(m.roles) && m.roles.includes(targetRole)))
        );
        if (!has) {
          memberships.push({
            storeId,
            role: targetRole,
            roles: [targetRole],        // ← añadido para compat UI
            status: "active",           // ← minúsculas para tu lógica existente
            assignedAt: new Date(),
          });
          user.memberships = memberships;
        }

        // ➕ default/active store y activar usuario
        if (!user.defaultStoreId) user.defaultStoreId = storeId;
        if (!user.activeStoreId) user.activeStoreId = storeId;
        user.status = "active";

        await user.save();

        // 🔔 sockets: status + role:changed + tenant:changed
        try {
          emitToUser(user._id, SOCKET_EVENT, {
            status: "APPROVED",
            applicationId: String(a._id),
            storeId: String(storeId),
            repaired: true,
          });
          emitToUser(user._id, "role:changed", { at: Date.now(), repaired: true });
          emitToUser(user._id, TENANT_EVENT, {
            storeId: String(storeId),
            reason: "seller_repair",
          });
        } catch (e) {
          console.error("[socket][seller-app:status][repaired]", e?.message || e);
        }

        repaired++;
      } catch (e) {
        console.error("[repairApprovedSellerApplications] item error:", e?.message || e);
        errors++;
      }
    }

    return res.json({ ok: true, repaired, skipped, errors, total: apps.length });
  } catch (e) {
    next(e);
  }
}


/* ========================================================================= */
/* ========================= ADMIN: ELIMINAR (SOFT) ======================== */
/* ========================================================================= */
export async function deleteSellerApp(req, res, next) {
  try {
    const id = req.params.id;
    if (!isId(id)) return res.status(400).json({ error: 'Invalid id' });

    const app = await SellerApplication.findOne({ _id: id, deletedAt: { $exists: false } });
    if (!app) return res.status(404).json({ error: 'Not found' });

    if (app.status === 'APPROVED') {
      return res.status(400).json({ error: 'No se puede eliminar una solicitud aprobada' });
    }

    app.deletedAt = new Date();
    await app.save();

    // 🔔 Socket.IO: notificar borrado al solicitante ANTES del return
    try {
      emitToUser(app.userId, SOCKET_EVENT, {
        status: "DELETED",
        applicationId: String(app._id),
      });
    } catch (e) {
      console.error("[socket][seller-app:status][deleted]", e?.message || e);
    }

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/* ========================================================================= */
/* =================== USUARIO: CREAR PRIMERA SOLICITUD ==================== */
/* ========================================================================= */
export async function createSellerApplication(req, res, next) {
  try {
    const userId = req.user?._id || req.userId;
    if (!userId) return res.status(401).json({ error: true, message: 'No autenticado' });

    // Compat: si vienen URLs planas, arma documents
    const flatFront0 = req.body?.docFrontUrl || req.body?.frontUrl || req.body?.ciFrontUrl;
    const flatBack0 = req.body?.docBackUrl || req.body?.backUrl || req.body?.ciBackUrl;
    const flatSelfie0 = req.body?.selfieUrl;
    if (!req.body.documents && (flatFront0 || flatBack0 || flatSelfie0)) {
      req.body.documents = {
        frontUrl: flatFront0 || undefined,
        backUrl: flatBack0 || undefined,
        selfieUrl: flatSelfie0 || undefined,
      };
    }

    // Campos de formulario
    const storeName = norm(req.body?.storeName);
    const description = norm(req.body?.description);
    const categoryId = norm(req.body?.categoryId || req.body?.category);
    const businessName = norm(req.body?.businessName) || storeName;
    const documentNumber = norm(req.body?.documentNumber);

    // Documentos
    const docFrontUrlFlat = norm(req.body?.docFrontUrl || req.body?.frontUrl || req.body?.ciFrontUrl);
    const docBackUrlFlat = norm(req.body?.docBackUrl || req.body?.backUrl || req.body?.ciBackUrl);
    const docNestedFront = norm(req.body?.documents?.frontUrl);
    const docNestedBack = norm(req.body?.documents?.backUrl);
    const finalFrontUrl = docFrontUrlFlat || docNestedFront;
    const finalBackUrl = docBackUrlFlat || docNestedBack;

    const selfieFlat = norm(req.body?.selfieUrl);
    const selfieNested = norm(req.body?.documents?.selfieUrl);
    const finalSelfieUrl = selfieFlat || selfieNested;

    // Validaciones
    if (!storeName) return res.status(422).json({ error: true, code: 'VALIDATION_ERROR', message: 'Falta el nombre de la tienda' });
    if (!businessName) return res.status(422).json({ error: true, code: 'VALIDATION_ERROR', message: 'Falta la razón social / nombre comercial' });
    if (!description) return res.status(422).json({ error: true, code: 'VALIDATION_ERROR', message: 'Falta la descripción' });
    if (!categoryId) return res.status(422).json({ error: true, code: 'VALIDATION_ERROR', message: 'Selecciona una categoría' });
    if (!isId(categoryId)) return res.status(422).json({ error: true, code: 'VALIDATION_ERROR', message: 'categoryId inválido (no es ObjectId)' });
    if (!finalFrontUrl || !finalBackUrl) {
      return res.status(422).json({ error: true, code: 'VALIDATION_ERROR', message: 'Sube ambas fotos del CI (anverso y reverso)' });
    }

    // Única activa por usuario (no borrada) — SIN .lean() para poder mutar
    const exists = await SellerApplication.findOne({ userId, deletedAt: { $exists: false } });
    if (exists) {
      if (exists.status === 'REJECTED') {
        return res.status(409).json({ error: true, message: 'Solicitud rechazada previamente. Use /reapply para reenviar.' });
      }
      if (exists.status === 'APPROVED') {
        let storeExists = false;
        if (exists.storeId) storeExists = !!(await StoreModel.exists({ _id: exists.storeId }));
        if (!storeExists) {
          exists.deletedAt = new Date();
          await exists.save();
        } else {
          return res.status(409).json({ error: true, message: `Ya tienes una solicitud en estado ${exists.status}.` });
        }
      } else {
        return res.status(409).json({ error: true, message: `Ya tienes una solicitud en estado ${exists.status}.` });
      }
    }

    const formData = { storeName, businessName, description, categoryId };
    if (documentNumber) formData.documentNumber = documentNumber;

    const app = await SellerApplication.create({
      userId,
      storeName,
      businessName,
      description,
      categoryId,
      ...(documentNumber ? { documentNumber } : {}),
      documents: { frontUrl: finalFrontUrl, backUrl: finalBackUrl, selfieUrl: finalSelfieUrl },
      idFrontUrl: finalFrontUrl,
      idBackUrl: finalBackUrl,
      selfieUrl: finalSelfieUrl,
      formData,
      status: 'PENDING',
    });

    // Email recibido (no bloqueante)
    if (SHOULD_SEND_EMAILS) {
      (async () => {
        try {
          let userName = req.user?.name || '';
          let userEmail = req.user?.email || '';
          if (!userName || !userEmail) {
            const u = await UserModel.findById(userId).select('name email').lean();
            userName = userName || u?.name || 'Postulante';
            userEmail = userEmail || u?.email || '';
          }
          const tpl = sellerReceived({ name: userName || 'Postulante', storeName });
          if (userEmail) {
            await sendEmailFun({ from: DEFAULT_FROM, sendTo: userEmail, subject: tpl.subject, html: tpl.html });
          } else {
            console.warn('[seller-app][email] Usuario sin email; no se envió recibo');
          }
        } catch (e) {
          console.error('[seller-app][email] fallo al enviar recibo:', e?.message || e);
        }
      })();
    }

    // 🔔 Socket.IO: notificar que quedó en PENDING
    try {
      emitToUser(userId, SOCKET_EVENT, {
        status: "PENDING",
        applicationId: String(app._id),
        createdAt: app.createdAt,
      });
    } catch (e) {
      console.error("[socket][seller-app:status][created]", e?.message || e);
    }

    return res.json({ error: false, data: app });
  } catch (e) {
    if (e?.name === 'ValidationError' && e?.errors) {
      const details = {};
      for (const [k, v] of Object.entries(e.errors)) {
        details[k] = { message: v?.message, path: v?.path, kind: v?.kind };
      }
      return res.status(422).json({ error: true, code: 'VALIDATION_ERROR', message: 'Validación fallida', details });
    }
    next(e);
  }
}

/* ========================================================================= */
/* =================== USUARIO: REAPLICAR (MISMA SOLICITUD) ================ */
/* ========================================================================= */
export async function reapplySellerApplication(req, res, next) {
  try {
    const userId = req.user?._id || req.userId;
    if (!userId) return res.status(401).json({ error: true, message: 'No autenticado' });

    const app = await SellerApplication.findOne({ userId, deletedAt: { $exists: false } });
    if (!app) return res.status(404).json({ error: true, message: 'No hay solicitud para reaplicar.' });
    if (app.status === 'APPROVED') return res.status(400).json({ error: true, message: 'La solicitud ya fue aprobada.' });

    // ⬇️ Merge con formData para aceptar ambos estilos
    const fd = (req.body && typeof req.body.formData === 'object') ? req.body.formData : {};

    // Campos actualizables (tomamos raíz ?? formData ?? actual)
    const take = (k) => (req.body?.[k] ?? fd?.[k] ?? app[k]);
    app.storeName = (take('storeName') || '').trim();
    app.businessName = (take('businessName') || app.storeName || '').trim();
    app.description = (take('description') || '').trim();
    app.categoryId = take('categoryId');
    app.documentNumber = (take('documentNumber') || '').trim();

    // Documentos (admite raíz y nested)
    const docFrontUrlFlat = (req.body?.docFrontUrl || req.body?.frontUrl || req.body?.ciFrontUrl || '').trim();
    const docBackUrlFlat = (req.body?.docBackUrl || req.body?.backUrl || req.body?.ciBackUrl || '').trim();
    const docNestedFront = (req.body?.documents?.frontUrl || '').trim();
    const docNestedBack = (req.body?.documents?.backUrl || '').trim();
    const selfieFlat = (req.body?.selfieUrl || '').trim();
    const selfieNested = (req.body?.documents?.selfieUrl || '').trim();

    const finalFrontUrl = docFrontUrlFlat || docNestedFront || app.idFrontUrl;
    const finalBackUrl = docBackUrlFlat || docNestedBack || app.idBackUrl;
    const finalSelfieUrl = selfieFlat || selfieNested || app.selfieUrl;

    app.idFrontUrl = finalFrontUrl;
    app.idBackUrl = finalBackUrl;
    app.selfieUrl = finalSelfieUrl;
    app.documents = { frontUrl: finalFrontUrl, backUrl: finalBackUrl, selfieUrl: finalSelfieUrl };

    // Reset de revisión
    app.status = 'PENDING';
    app.reapplyCount = (app.reapplyCount || 0) + 1;
    app.lastReappliedAt = new Date();
    app.reviewedAt = undefined;
    app.reviewedBy = undefined;
    app.notes = '';

    // Guarda
    await app.save();

    // 🔔 Socket.IO: notificar cambio a PENDING por reapply
    try {
      emitToUser(userId, SOCKET_EVENT, {
        status: "PENDING",
        applicationId: String(app._id),
        lastReappliedAt: app.lastReappliedAt,
        reapplyCount: app.reapplyCount || 0,
      });
    } catch (e) {
      console.error("[socket][seller-app:status][reapply]", e?.message || e);
    }

    return res.json({ ok: true, data: app });
  } catch (e) {
    if (e?.name === 'ValidationError' && e?.errors) {
      const details = {};
      for (const [k, v] of Object.entries(e.errors)) {
        details[k] = { message: v?.message, path: v?.path, kind: v?.kind };
      }
      return res.status(422).json({ error: true, code: 'VALIDATION_ERROR', message: 'Validación fallida', details });
    }
    next(e);
  }
}


/* ========================================================================= */
/* =============== USUARIO: VER MI ÚLTIMA SOLICITUD ======================== */
/* ========================================================================= */
export async function mySellerApplication(req, res, next) {
  try {
    const userId = req.user?._id || req.userId;

    const app = await SellerApplication.findOne({
      userId,
      deletedAt: { $exists: false }, // respeta soft-delete si lo usas
    })
      .sort({ createdAt: -1 })
      .lean();

    // Si no hay solicitud, devuelve null
    if (!app) return res.json({ error: false, data: null });

    // Defensa: si estaba aprobada pero la tienda ya no existe, trátalo como "no hay solicitud"
    if (String(app.status).toUpperCase() === 'APPROVED' && app.storeId) {
      // Si usas soft-delete en Store, puedes añadir: { _id: app.storeId, deletedAt: { $exists: false } }
      const exists = await StoreModel.exists({ _id: app.storeId });
      if (!exists) {
        return res.json({ error: false, data: null });

        // ── Alternativa “reparar” (opcional):
        // await SellerApplication.updateOne(
        //   { _id: app._id },
        //   { $set: { status: 'PENDING', storeId: undefined, reviewedAt: undefined, reviewedBy: undefined } }
        // );
        // return res.json({ error: false, data: { ...app, status: 'PENDING', storeId: undefined } });
      }
    }

    return res.json({ error: false, data: app });
  } catch (e) {
    next(e);
  }
}


export async function resetMySellerApplication(req, res, next) {
  try {
    const userId = req.user?._id || req.userId;
    if (!userId) return res.status(401).json({ error: true, message: "No autenticado" });

    // Trae la solicitud activa (no borrada)
    const app = await SellerApplication.findOne({ userId, deletedAt: { $exists: false } });
    if (!app) {
      // No hay nada que resetear; idempotente
      return res.status(204).end();
    }

    // Si estaba aprobada y tenía storeId, vemos si la tienda existe
    let storeExists = false;
    if (app.storeId) {
      const st = await StoreModel.findById(app.storeId).select("_id").lean().catch(() => null);
      storeExists = Boolean(st);
    }

    // Política: si tienda existe y la solicitud está APPROVED → bloquear reset por usuario
    if (storeExists && app.status === "APPROVED") {
      return res.status(409).json({
        error: true,
        code: "CANNOT_RESET_APPROVED_WITH_STORE",
        message: "La solicitud ya fue aprobada y la tienda existe. Contacta a un administrador para reiniciar.",
      });
    }

    // Soft-delete de la solicitud
    app.deletedAt = new Date();
    await app.save();

    // Limpieza de memberships rotos si la tienda YA no existe
    const user = await UserModel.findById(userId);
    if (user) {
      if (app.storeId && !storeExists) {
        const sidStr = String(app.storeId);
        const mm = Array.isArray(user.memberships) ? user.memberships : [];
        user.memberships = mm.filter((m) => String(m.storeId) !== sidStr);
        if (user.defaultStoreId && String(user.defaultStoreId) === sidStr) {
          user.defaultStoreId = undefined;
        }
        // (opcional) limpiar rol STORE_OWNER si ya no tiene ninguna membership con ese rol
        const hasOwner = (user.memberships || []).some((m) => m.role === (ROLES?.STORE_OWNER || "STORE_OWNER"));
        if (!hasOwner) {
          const roles = new Set([...(user.roles || [])]);
          roles.delete(ROLES?.STORE_OWNER || "STORE_OWNER");
          user.roles = Array.from(roles);
        }
        await user.save();
      }
    }

    // 🔔 Socket.IO: notificar reset al cliente ANTES del return
    try {
      emitToUser(userId, SOCKET_EVENT, {
        status: "RESET",
        message: "Solicitud reiniciada. Puedes crear una nueva.",
      });
    } catch (e) {
      console.error("[socket][seller-app:status][reset-my-app]", e?.message || e);
    }

    return res.json({ ok: true, message: "Solicitud reiniciada. Puedes crear una nueva." });
  } catch (e) {
    next(e);
  }
}


// Reseteo del flujo completo (limpieza defensiva)
export async function resetMySellerFlow(req, res, next) {
  try {
    const userId = req.user?._id || req.userId;
    if (!userId) return res.status(401).json({ error: true, message: 'No autenticado' });

    // 1) Limpia defaultStoreId roto
    const user = await UserModel.findById(userId);
    if (user?.defaultStoreId) {
      const exists = await StoreModel.exists({ _id: user.defaultStoreId });
      if (!exists) {
        user.defaultStoreId = undefined;
        // quita memberships rotas
        user.memberships = (user.memberships || []).filter(m => String(m?.storeId));
        await user.save();
      }
    }

    // 2) Si hay app REJECTED o PENDING -> elimínala (soft).
    //    Si estaba APPROVED pero sin tienda válida -> bájala a PENDING.
    const app = await SellerApplication.findOne({ userId, deletedAt: { $exists: false } });
    if (app) {
      if (app.status !== 'APPROVED') {
        // Opción A: eliminar si no está aprobada
        app.deletedAt = new Date();
        await app.save();

        // 🔔 Notificar que se limpió el flujo (app no aprobada eliminada)
        try {
          emitToUser(userId, SOCKET_EVENT, { status: "RESET_FLOW", cleared: true });
        } catch (e) {
          console.error("[socket][seller-app:status][reset-flow:cleared]", e?.message || e);
        }
      } else {
        // Opción B: si estaba aprobada pero sin tienda válida, bájala a PENDING
        const hasStore = app.storeId && await StoreModel.exists({ _id: app.storeId });
        if (!hasStore) {
          app.status = 'PENDING';
          app.reviewedAt = undefined;
          app.reviewedBy = undefined;
          await app.save();

          // 🔔 Notificar downgrade a PENDING desde APPROVED (sin tienda válida)
          try {
            emitToUser(userId, SOCKET_EVENT, { status: "PENDING", downgradedFrom: "APPROVED" });
          } catch (e) {
            console.error("[socket][seller-app:status][reset-flow:downgrade]", e?.message || e);
          }
        }
      }
    }

    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}


/* ========================================================================= */
/* ================= ALIASES / EXPORTS DE COMPATIBILIDAD =================== */
/* ========================================================================= */
export { approveSellerApplicationController as approveSellerApp };
export { rejectSellerApplicationController as rejectSellerApp };

/** Alias para que user.route.js pueda importar el nombre antiguo */
export { listSellerAppsAdmin as listSellerApplicationsController };
export { listSellerAppsAdmin as listSellerApplicationsAdmin };

export { mySellerApplication as getMySellerApplication };
export { createSellerApplication as createSellerApplicationController };
export { createSellerApplication as applySeller };
export { mySellerApplication as getMySellerApp };
export { createSellerApplication as createSellerApp };
export { reapplySellerApplication as reapplySellerApp };

/* Nota: NO re-exportar funciones ya exportadas con el mismo nombre para evitar "Duplicate export":
   - listSellerAppsAdmin, getSellerAppById, deleteSellerApp ya están exportadas arriba
*/
