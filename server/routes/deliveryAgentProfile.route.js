// server/routes/deliveryAgentProfile.route.js
import { Router } from "express";
import auth from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import {
  getMyProfile,
  updateMyProfile,
  requestVerification,
  rejectVerification,
  listAgentProfiles,
  getCandidatesVerifiedController,
  promoteAgentController,
  demoteAgentController,
  suspendAgentController,
} from "../controllers/deliveryAgentProfile.controller.js";

const router = Router();

// Agente: mi perfil
router.get("/me", auth, requirePermission("delivery:read"), getMyProfile);
router.patch("/me", auth, requirePermission("delivery:read"), updateMyProfile);

// Agente: solicitar verificación presencial
router.post("/me/request-verification", auth, requirePermission("delivery:read"), requestVerification);

// Super admin: rechazar verificación
router.patch(
  "/:id/reject-verification",
  auth,
  requirePermission("delivery:trust:manage"),
  rejectVerification
);

// Super admin: listar perfiles
router.get(
  "/",
  auth,
  requirePermission("delivery:trust:manage"),
  listAgentProfiles
);

// Super admin: candidatos a VERIFIED
router.get(
  "/candidates-verified",
  auth,
  requirePermission("delivery:trust:manage"),
  getCandidatesVerifiedController
);

// Super admin: promover
router.patch(
  "/:id/promote",
  auth,
  requirePermission("delivery:trust:manage"),
  promoteAgentController
);

// Super admin: degradar
router.patch(
  "/:id/demote",
  auth,
  requirePermission("delivery:trust:manage"),
  demoteAgentController
);

// Super admin: suspender
router.patch(
  "/:id/suspend",
  auth,
  requirePermission("delivery:trust:manage"),
  suspendAgentController
);

export default router;
