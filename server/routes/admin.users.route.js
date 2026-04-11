// server/routes/admin.users.route.js
import { Router } from "express";
import auth from "../middlewares/auth.js";
import { onlySuperAdmin } from "../controllers/permissionAdmin.controller.js";

import {
  // LIST
  listAdminUsersController,

  // PLATFORM ROLE (single + bulk)
  updateUserPlatformRoleController,
  bulkPlatformRole,

  // BULK (negocio)
  bulkStatus as bulkStatusController,
  bulkRole as bulkRoleController,
  bulkMembership as bulkMembershipController,
  bulkDelete as bulkDeleteController,

  // SINGLE (negocio)
  updateStatus as patchUserStatusController,
  updateRole as patchUserRoleController,
  addMembership as addMembershipController,
  removeMembership as removeMembershipController,
  removeUser as deleteUserController,

  // (opcional) creación
  createAdminUserController,
} from "../controllers/admin.users.controller.js";

const r = Router();

// Todas requieren sesión
r.use(auth);

/* ========= Rutas SIN onlySuperAdmin =========
 * Objetivo: permitir que usuarios autenticados (no súper) puedan asignar
 * roles de plataforma "NO SUPER_ADMIN".
 * La validación crítica se hace en los controladores:
 *  - Para SUPER_ADMIN: exige que el solicitante sea super y que el destinatario esté en .env
 */

// Listado de usuarios admin (si quieres que solo súper lo vean, muévelo al bloque de abajo)
r.get("/users", listAdminUsersController);

// Platform role (single)
r.post("/users/platform-role", updateUserPlatformRoleController);

// Platform role (bulk)
r.post("/users/bulk/platform-role", bulkPlatformRole);


/* ========= Rutas CON onlySuperAdmin =========
 * El resto de operaciones de administración sí quedan restringidas
 * a súper administradores de plataforma.
 */
const adminOnly = Router();
adminOnly.use(onlySuperAdmin);

/** (opcional) CREACIÓN directa de usuario admin
 *  POST /api/admin/users
 */
adminOnly.post("/users", createAdminUserController);

/* ============ BULK (negocio) ============ */
/** POST /api/admin/users/bulk/status */
adminOnly.post("/users/bulk/status", bulkStatusController);

/** POST /api/admin/users/bulk/role */
adminOnly.post("/users/bulk/role", bulkRoleController);

/** POST /api/admin/users/bulk/membership */
adminOnly.post("/users/bulk/membership", bulkMembershipController);

/** POST /api/admin/users/bulk/delete */
adminOnly.post("/users/bulk/delete", bulkDeleteController);

/* ============ SINGLE (negocio) ============ */
/** PATCH /api/admin/users/:id/status */
adminOnly.patch("/users/:id/status", patchUserStatusController);

/** PATCH /api/admin/users/:id/role */
adminOnly.patch("/users/:id/role", patchUserRoleController);

/** POST /api/admin/users/:id/memberships */
adminOnly.post("/users/:id/memberships", addMembershipController);

/** DELETE /api/admin/users/:id/memberships/:storeId */
adminOnly.delete("/users/:id/memberships/:storeId", removeMembershipController);

/** DELETE /api/admin/users/:id */
adminOnly.delete("/users/:id", deleteUserController);

// Monta el subrouter protegido
r.use("/", adminOnly);

export default r;
