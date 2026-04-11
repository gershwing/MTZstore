// server/routes/address.route.js
import { Router } from "express";
import auth from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import {
  addAddressController,
  deleteAddressController,
  editAddress,
  getAddressController,
  getSingleAddressController,
  // Si no lo tienes aún en el controller, comenta la import y la ruta PATCH:
  setDefaultAddress,
} from "../controllers/address.controller.js";

const addressRouter = Router();

/**
 * 📌 Notas:
 * - “Por usuario”: NO requiere withTenant.
 * - Ownership por req.userId (auth).
 * - Permisos granulares: address:create/read/update/delete.
 * - Mantiene rutas existentes y añade alias REST.
 */

/* ------- Rutas BACKWARD COMPATIBLE (legacy) ------- */
addressRouter.post(
  "/add",
  auth,
  requirePermission("address:create"),
  addAddressController
);

addressRouter.get(
  "/get",
  auth,
  requirePermission("address:read"),
  getAddressController
);

addressRouter.get(
  "/:id",
  auth,
  requirePermission("address:read"),
  getSingleAddressController
);

addressRouter.put(
  "/:id",
  auth,
  requirePermission("address:update"),
  editAddress
);

// Hard/soft delete con ?soft=true
addressRouter.delete(
  "/:id",
  auth,
  requirePermission("address:delete"),
  deleteAddressController
);

/* ------- Alias REST recomendados (coexisten mientras migras) ------- */
addressRouter.post(
  "/",
  auth,
  requirePermission("address:create"),
  addAddressController
);

addressRouter.get(
  "/",
  auth,
  requirePermission("address:read"),
  getAddressController
);

// Marcar dirección por defecto (opcional)
addressRouter.patch(
  "/:id/default",
  auth,
  requirePermission("address:update"),
  setDefaultAddress // ← comenta esta línea si aún no implementaste el controller
);

export default addressRouter;
