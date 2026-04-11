// server/routes/permissionsAdmin.route.js
import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  onlySuperAdmin,
  listRolesController,
  getStaticPermissionsController,
  getEffectivePermissionsController,
  getOverlayController,
  updateOverlayController,
} from "../controllers/permissionAdmin.controller.js";

const r = Router();

// Protege todo el módulo para SUPER_ADMIN de plataforma (sin withTenant)
r.use(auth, onlySuperAdmin);

r.get("/roles", listRolesController);
r.get("/map", getStaticPermissionsController);
r.get("/effective", getEffectivePermissionsController);
r.get("/overlay/:role", getOverlayController);
r.patch("/overlay/:role", updateOverlayController);

export default r;
