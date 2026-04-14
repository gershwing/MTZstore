// server/routes/user.route.js
import { Router } from "express";
import {
  addReview,
  authWithGoogle,
  changePasswordController,
  deleteMultiple,
  deleteUser,
  forgotPasswordController,
  getAllReviews,
  getAllUsers,
  getReviews,
  loginUserController,
  logoutController,
  refreshToken,               // existente (/refresh-token)
  registerUserController,
  removeImageFromCloudinary,
  resetpassword,
  updateUserDetails,
  userAvatarController,
  userDetails,
  verifyEmailController,
  verifyForgotPasswordOtp,
  setDefaultStoreId,          // nuevo (usuario actual)
  setActiveStoreId,           // nuevo (usuario actual)
  refreshController,          // /refresh (cookies httpOnly)
  me as meController,         // controlador /me
} from "../controllers/user.controller.js";

import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import withTenant from "../middlewares/withTenant.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import { nocache } from "../middlewares/nocache.js";
import requireSuper from "../middlewares/requireSuper.js"; // ⬅️ NUEVO

import {
  applySeller,
  listSellerApplicationsController,
  approveSellerApplicationController,
  rejectSellerApplicationController,
} from "../controllers/sellerApplication.controller.js";

import { createAdminUserController } from "../controllers/admin.users.controller.js";
// import { patchUserRoleByAdmin } from "../controllers/admin.users.controller.js";

import User from "../models/user.model.js"; // ⬅️ NUEVO

const router = Router();

/* ───────────────────── PUBLIC/AUTH BÁSICO ───────────────────── */

router.post("/register", registerUserController);
router.post("/verifyEmail", verifyEmailController);

router.post("/login", loginUserController);
router.post("/authWithGoogle", authWithGoogle);

// Cambio de contraseña desde perfil (requiere oldPassword)
router.post("/reset-password", auth, resetpassword);

// Flujo forgot-password (público, sin auth)
router.post("/forgot-password", forgotPasswordController);
router.post("/verify-forgot-password-otp", verifyForgotPasswordOtp);
router.post("/forgot-password/change-password", changePasswordController);

// Logout tolerante (GET/POST/etc) y sin auth para ser idempotente
router.all("/logout", logoutController);

// Endpoint de refresh (cookies httpOnly) para 401 del front
router.post("/refresh", refreshController);

// Fallback/legacy refresh con token en body o bearer refresh
router.post("/refresh-token", refreshToken);

// Quién soy — SIN withTenant (solo auth) y sin caché
router.get("/me", nocache, auth, meController);

router.put("/user-avatar", auth, upload.array("avatar"), userAvatarController);

// Eliminar imagen (alias legacy + nuevo)
router.delete("/deteleImage", auth, removeImageFromCloudinary); // legacy
router.delete("/deleteImage", auth, removeImageFromCloudinary); // nuevo

// Perfil propio
router.put("/:id", auth, updateUserDetails);
router.get("/user-details", auth, userDetails);

// Fijar tienda por defecto del usuario autenticado
router.post("/default-store", auth, setDefaultStoreId);

// Fijar tienda activa del usuario autenticado (para el picker del admin)
router.post("/active-store", auth, setActiveStoreId);

/* ───────────────────── RUTAS ADMIN PARA FIJAR TENANT EN OTROS USUARIOS ───────────────────── */
// Nota: requieren SUPER_ADMIN (o tu middleware equivalente)
// Si prefieres permiso granular, reemplaza requireSuper por requirePermission("user:assignRole")

router.post("/admin/users/:id/default-store", auth, requireSuper, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { storeId } = req.body || {};
    await User.updateOne({ _id: id }, { $set: { defaultStoreId: storeId } });
    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

router.post("/admin/users/:id/active-store", auth, requireSuper, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { storeId } = req.body || {};
    await User.updateOne({ _id: id }, { $set: { activeStoreId: storeId } });
    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

/* ───────────────────── REVIEWS ───────────────────── */

router.post(
  "/addReview",
  auth,
  withTenant(),
  requirePermission("review:create"),
  addReview
);

router.get("/getReviews", getReviews);

router.get(
  "/getAllReviews",
  auth,
  withTenant(),
  requirePermission("review:moderate"),
  getAllReviews
);

/* ───────────────────── USERS (ADMIN PANEL) ───────────────────── */

router.get(
  "/getAllUsers",
  auth,
  withTenant({ required: false }),
  requirePermission("user:read"),
  getAllUsers
);

router.delete(
  "/deleteMultiple",
  auth,
  withTenant(),
  requirePermission("user:delete"),
  deleteMultiple
);

router.delete(
  "/deleteUser/:id",
  auth,
  withTenant(),
  requirePermission("user:delete"),
  deleteUser
);

/* ───────────────────── FLUJO VENDEDOR ───────────────────── */

router.post("/seller/apply", auth, applySeller);

router.get(
  "/admin/seller-applications",
  auth,
  withTenant(),
  requirePermission("user:read"),
  listSellerApplicationsController
);

router.patch(
  "/admin/seller-applications/:id/approve",
  auth,
  withTenant(),
  requirePermission("user:assignRole"),
  approveSellerApplicationController
);

router.patch(
  "/admin/seller-applications/:id/reject",
  auth,
  withTenant(),
  requirePermission("user:assignRole"),
  rejectSellerApplicationController
);

/* ───────────────────── ADMIN CREA USUARIOS ───────────────────── */

router.post(
  "/admin/users",
  auth,
  withTenant(),
  requirePermission("user:invite"),
  createAdminUserController
);

// router.patch(
//   "/admin/users/:id/role",
//   auth,
//   withTenant(),
//   requirePermission("user:assignRole"),
//   patchUserRoleByAdmin
// );

export default router;
