// server/routes/audit.route.js
import { Router } from "express";
import auth from "../middlewares/auth.js";
import withTenantOrSuper from "../middlewares/withTenantOrSuper.js";
import { requirePermission } from "../middlewares/requirePermission.js";

import {
  listAuditLogsController,
  // Compat: alias de nombres antiguos → nombres nuevos
  exportAuditLogsJSONController as exportAuditJsonController,
  exportAuditLogsCSVController as exportAuditCsvController,
  actionsStatsController,
} from "../controllers/audit.controller.js";

const router = Router();

/**
 * Listado de logs
 * - SUPER_ADMIN: alcance global
 * - Otros: por tenant si envían X-Store-Id (withTenantOrSuper no exige tenant si hay super)
 */
router.get(
  "/logs",
  auth,
  withTenantOrSuper({ required: false }),
  requirePermission("audit:read"),
  listAuditLogsController
);

/**
 * Export CSV (nuevo endpoint)
 */
router.get(
  "/logs/export.csv",
  auth,
  withTenantOrSuper({ required: false }),
  requirePermission("audit:read"),
  exportAuditCsvController
);

/**
 * Export JSON (compat con tu endpoint previo)
 */
router.get(
  "/logs/export.json",
  auth,
  withTenantOrSuper({ required: false }),
  requirePermission("audit:read"),
  exportAuditJsonController
);

/**
 * Stats por acción
 * - Nuevo:   /logs/stats
 * - Legacy:  /actions-stats
 */
router.get(
  "/logs/stats",
  auth,
  withTenantOrSuper({ required: false }),
  requirePermission("audit:read"),
  actionsStatsController
);

router.get(
  "/actions-stats",
  auth,
  withTenantOrSuper({ required: false }),
  requirePermission("audit:read"),
  actionsStatsController
);

export default router;
