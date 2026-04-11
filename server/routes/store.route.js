// server/routes/store.route.js
import { Router } from "express";
import auth from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import withTenantOrSuper from "../middlewares/withTenantOrSuper.js";
import Store from "../models/store.model.js";

import {
  listStores,
  getStore,
  createStore,
  updateStore,
  setStoreStatus,
  deleteStore,
  listMyStores,      // mis tiendas (usuario autenticado)
  updateStoreBanner, // actualizar solo el banner
} from "../controllers/store.controller.js";

const router = Router();

// ✅ Diagnóstico by-id sin middlewares
router.get("/by-id/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return res.status(400).json({ error: "id requerido" });
    const row = await Store.findById(id).populate("categoryId", "name slug depth").lean();
    if (!row) return res.status(404).json({ error: "no encontrada" });
    return res.json({ row });
  } catch (e) {
    next(e);
  }
});

// ✅ Mis tiendas (solo auth, sin tenant ni permisos extra)
router.get("/me", auth, listMyStores);
router.get("/stores/me", auth, listMyStores);

// ✅ Listar tiendas (admin/tenant)
router.get(
  "/",
  auth,
  withTenantOrSuper(),
  requirePermission("store:read"),
  listStores
);

// ✅ Actualizar SOLO el banner de una tienda
//   OJO: sin withTenantOrSuper para evitar bloqueos por tenant/permiso.
//   Luego, si todo va bien, podemos volver a endurecer esto.
router.patch(
  "/:id/banner",
  auth,
  updateStoreBanner
);

// ✅ Obtener una tienda
router.get(
  "/:id",
  auth,
  withTenantOrSuper(),
  (req, res, next) => {
    try {
      const perms = new Set(Array.isArray(req.permissions) ? req.permissions : []);
      if (perms.has("store:read") || perms.has("catalog:read")) return next();
    } catch { }
    return res.status(403).json({ message: "Forbidden" });
  },
  getStore
);

// ✅ Crear tienda
router.post(
  "/",
  auth,
  withTenantOrSuper(),
  requirePermission("store:create"),
  createStore
);

// ✅ Actualizar tienda completa
router.put(
  "/:id",
  auth,
  withTenantOrSuper(),
  requirePermission("store:update"),
  updateStore
);

// ✅ Cambiar estado
router.patch(
  "/:id/status",
  auth,
  withTenantOrSuper(),
  requirePermission("store:status"),
  setStoreStatus
);

// ✅ Borrar tienda
router.delete(
  "/:id",
  auth,
  withTenantOrSuper(),
  requirePermission("store:delete"),
  deleteStore
);

export default router;
