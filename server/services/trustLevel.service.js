// server/services/trustLevel.service.js
// Gestión de niveles de confianza de agentes de delivery.
import DeliveryAgentProfile from "../models/deliveryAgentProfile.model.js";
import { auditLog } from "./audit.service.js";

const TRUST_ORDER = ["BASIC", "VERIFIED", "TRUSTED"];
const TRUST_RANK = { BASIC: 0, VERIFIED: 1, TRUSTED: 2 };

// Umbrales para candidatos a VERIFIED (ajustables vía env en el futuro)
const VERIFIED_MIN_DELIVERIES = 50;
const VERIFIED_MIN_RATING = 4.5;
const VERIFIED_MAX_INCIDENTS = 0;

/**
 * Retorna agentes BASIC que cumplen criterios para promoción a VERIFIED.
 */
export async function getCandidatesForVerified() {
  return DeliveryAgentProfile.find({
    platformTrustLevel: "BASIC",
    status: "ACTIVE",
    "stats.totalDeliveries": { $gte: VERIFIED_MIN_DELIVERIES },
    "stats.rating": { $gte: VERIFIED_MIN_RATING },
    "stats.incidentCount": { $lte: VERIFIED_MAX_INCIDENTS },
  })
    .populate("userId", "name email phone")
    .sort({ "stats.totalDeliveries": -1 })
    .lean();
}

/**
 * Promover agente a un nuevo nivel de confianza.
 * Valida que la transición sea secuencial (BASIC→VERIFIED→TRUSTED).
 */
export async function promoteAgent(agentUserId, newLevel, promotedBy, reason = "") {
  if (!TRUST_ORDER.includes(newLevel)) {
    throw Object.assign(new Error(`Nivel inválido: ${newLevel}`), { status: 400 });
  }

  const profile = await DeliveryAgentProfile.findOne({ userId: agentUserId });
  if (!profile) {
    throw Object.assign(new Error("Perfil de agente no encontrado"), { status: 404 });
  }

  const currentRank = TRUST_RANK[profile.platformTrustLevel];
  const newRank = TRUST_RANK[newLevel];

  if (newRank <= currentRank) {
    throw Object.assign(
      new Error(`No se puede promover de ${profile.platformTrustLevel} a ${newLevel}`),
      { status: 400 }
    );
  }
  if (newRank - currentRank > 1) {
    throw Object.assign(
      new Error(`No se puede saltar niveles: ${profile.platformTrustLevel} → ${newLevel}. Debe pasar por ${TRUST_ORDER[currentRank + 1]}`),
      { status: 400 }
    );
  }

  const prev = profile.platformTrustLevel;
  profile.platformTrustLevel = newLevel;
  profile.trustLevelHistory.push({
    level: newLevel,
    promotedBy,
    promotedAt: new Date(),
    reason: reason || `Promoción de ${prev} a ${newLevel}`,
  });

  await profile.save();

  // Audit log (best-effort)
  try {
    await auditLog(null, {
      actorId: promotedBy,
      action: "TRUST_PROMOTED",
      entity: "DeliveryAgentProfile",
      entityId: String(profile._id),
      meta: { from: prev, to: newLevel, userId: String(agentUserId), reason },
    });
  } catch { /* silencio */ }

  return profile;
}

/**
 * Degradar agente a un nivel inferior.
 * Requiere motivo obligatorio.
 */
export async function demoteAgent(agentUserId, newLevel, demotedBy, reason) {
  if (!reason || String(reason).trim().length < 3) {
    throw Object.assign(new Error("Se requiere un motivo para degradar"), { status: 400 });
  }
  if (!TRUST_ORDER.includes(newLevel)) {
    throw Object.assign(new Error(`Nivel inválido: ${newLevel}`), { status: 400 });
  }

  const profile = await DeliveryAgentProfile.findOne({ userId: agentUserId });
  if (!profile) {
    throw Object.assign(new Error("Perfil de agente no encontrado"), { status: 404 });
  }

  const currentRank = TRUST_RANK[profile.platformTrustLevel];
  const newRank = TRUST_RANK[newLevel];

  if (newRank >= currentRank) {
    throw Object.assign(
      new Error(`No se puede degradar de ${profile.platformTrustLevel} a ${newLevel}`),
      { status: 400 }
    );
  }

  const prev = profile.platformTrustLevel;
  profile.platformTrustLevel = newLevel;
  profile.trustLevelHistory.push({
    level: newLevel,
    promotedBy: demotedBy,
    promotedAt: new Date(),
    reason: `Degradación de ${prev} a ${newLevel}: ${reason}`,
  });

  await profile.save();

  // Audit log (best-effort)
  try {
    await auditLog(null, {
      actorId: demotedBy,
      action: "TRUST_DEMOTED",
      entity: "DeliveryAgentProfile",
      entityId: String(profile._id),
      meta: { from: prev, to: newLevel, userId: String(agentUserId), reason },
    });
  } catch { /* silencio */ }

  return profile;
}
