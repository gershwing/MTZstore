// server/services/deliveryEligibility.service.js
// Centraliza la lógica de elegibilidad: ¿puede este agente ver/tomar esta entrega?
import DeliveryPartnership from "../models/deliveryPartnership.model.js";
import StoreModel from "../models/store.model.js";
import DeliveryAgentProfile from "../models/deliveryAgentProfile.model.js";

const TRUST_RANK = { BASIC: 0, VERIFIED: 1, TRUSTED: 2 };

// Tiempo de ventaja para socios antes de abrir al pool de verificados
const FALLBACK_POOL_DELAY_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Mapea shippingMethod del task a serviceType del agente.
 */
export function shippingMethodToServiceType(method) {
  switch (method) {
    case "MTZSTORE_EXPRESS":
    case "STORE_EXPRESS":
      return "express";
    case "MTZSTORE_STANDARD":
    case "STORE_STANDARD":
    case "STORE": // legacy
      return "standard";
    default:
      return null;
  }
}

/**
 * ¿Puede este agente tomar esta entrega?
 * @param {Object} agentProfile - DeliveryAgentProfile doc
 * @param {Object} task - DeliveryTask doc (con storeId populated o ObjectId)
 * @param {Object|null} store - Store doc (opcional, se busca si no se pasa)
 * @returns {Promise<boolean>}
 */
export async function canAgentTakeTask(agentProfile, task, store = null) {
  if (!agentProfile || agentProfile.status !== "ACTIVE") return false;

  const serviceType = shippingMethodToServiceType(task.shippingMethod);
  if (!serviceType) return false;
  if (!agentProfile.approvedServiceTypes.includes(serviceType)) return false;

  const method = task.shippingMethod;

  // --- Entregas de plataforma (MTZSTORE_*) ---
  if (method === "MTZSTORE_EXPRESS") return true;
  if (method === "MTZSTORE_STANDARD") {
    return TRUST_RANK[agentProfile.platformTrustLevel] >= TRUST_RANK.VERIFIED;
  }

  // --- Entregas de tienda (STORE_*, STORE legacy) ---
  const storeId = task.storeId?._id || task.storeId;
  if (!storeId) return false;

  if (!store) {
    store = await StoreModel.findById(storeId).lean();
  }
  if (!store) return false;

  const modeKey = serviceType === "express" ? "expressMode" : "standardMode";
  const mode = store.delivery?.[modeKey] || "partners_only";

  if (mode === "open") return true;

  // Fallback pool: VERIFIED+ toma STORE_EXPRESS si lleva 5+ min pendiente
  if (
    serviceType === "express" &&
    TRUST_RANK[agentProfile.platformTrustLevel] >= TRUST_RANK.VERIFIED &&
    task.createdAt &&
    new Date(task.createdAt).getTime() <= Date.now() - FALLBACK_POOL_DELAY_MS
  ) {
    return true;
  }

  // partners_only → verificar partnership activa
  const partnership = await DeliveryPartnership.findOne({
    agentId: agentProfile.userId,
    storeId,
    serviceType,
    status: "ACTIVE",
  }).lean();

  return !!partnership;
}

/**
 * Construye un filtro MongoDB para obtener tasks disponibles para un agente.
 * Evita N+1 queries al precalcular partnerships y tiendas open.
 * @param {Object} agentProfile - DeliveryAgentProfile doc
 * @returns {Promise<Object>} filtro para DeliveryTask.find()
 */
export async function buildAvailableTasksFilter(agentProfile) {
  const base = {
    status: "PENDING",
    $or: [{ assigneeId: { $exists: false } }, { assigneeId: null }],
  };

  const hasExpress = agentProfile.approvedServiceTypes.includes("express");
  const hasStandard = agentProfile.approvedServiceTypes.includes("standard");
  const trustRank = TRUST_RANK[agentProfile.platformTrustLevel] || 0;

  const methodFilters = [];

  // 1. MTZSTORE_EXPRESS — cualquier agente express
  if (hasExpress) {
    methodFilters.push({ shippingMethod: "MTZSTORE_EXPRESS" });
  }

  // 2. MTZSTORE_STANDARD — solo VERIFIED+
  if (hasStandard && trustRank >= TRUST_RANK.VERIFIED) {
    methodFilters.push({ shippingMethod: "MTZSTORE_STANDARD" });
  }

  // 3. STORE_EXPRESS / STORE_STANDARD — depende de modo y partnerships
  const [partnerships, openExpressStores, openStandardStores] = await Promise.all([
    // Partnerships activas del agente
    DeliveryPartnership.find({
      agentId: agentProfile.userId,
      status: "ACTIVE",
    }).select("storeId serviceType").lean(),

    // Tiendas con expressMode open
    hasExpress
      ? StoreModel.find({ status: "active", "delivery.expressMode": "open" }).select("_id").lean()
      : [],

    // Tiendas con standardMode open
    hasStandard
      ? StoreModel.find({ status: "active", "delivery.standardMode": "open" }).select("_id").lean()
      : [],
  ]);

  // Express de tiendas con modo open
  if (hasExpress && openExpressStores.length > 0) {
    methodFilters.push({
      shippingMethod: "STORE_EXPRESS",
      storeId: { $in: openExpressStores.map((s) => s._id) },
    });
  }

  // Standard de tiendas con modo open
  if (hasStandard && openStandardStores.length > 0) {
    methodFilters.push({
      shippingMethod: { $in: ["STORE_STANDARD", "STORE"] },
      storeId: { $in: openStandardStores.map((s) => s._id) },
    });
  }

  // Express de tiendas donde es socio
  const expressPartnerStores = partnerships
    .filter((p) => p.serviceType === "express")
    .map((p) => p.storeId);
  if (hasExpress && expressPartnerStores.length > 0) {
    methodFilters.push({
      shippingMethod: "STORE_EXPRESS",
      storeId: { $in: expressPartnerStores },
    });
  }

  // Standard de tiendas donde es socio
  const standardPartnerStores = partnerships
    .filter((p) => p.serviceType === "standard")
    .map((p) => p.storeId);
  if (hasStandard && standardPartnerStores.length > 0) {
    methodFilters.push({
      shippingMethod: { $in: ["STORE_STANDARD", "STORE"] },
      storeId: { $in: standardPartnerStores },
    });
  }

  // Fallback pool: VERIFIED+ express ven STORE_EXPRESS de cualquier tienda si llevan 5+ min sin tomar
  if (hasExpress && trustRank >= TRUST_RANK.VERIFIED) {
    methodFilters.push({
      shippingMethod: "STORE_EXPRESS",
      createdAt: { $lte: new Date(Date.now() - FALLBACK_POOL_DELAY_MS) },
    });
  }

  if (methodFilters.length === 0) {
    // No puede ver nada → filtro imposible
    return { ...base, _id: null };
  }

  return {
    ...base,
    $or: methodFilters,
  };
}

/**
 * Para asignación manual: ¿qué agentes pueden tomar un task específico?
 * @param {Object} task - DeliveryTask doc
 * @returns {Promise<Array>} lista de { profile, user }
 */
export async function getEligibleAgentsForTask(task) {
  const serviceType = shippingMethodToServiceType(task.shippingMethod);
  if (!serviceType) return [];

  const method = task.shippingMethod;
  const storeId = task.storeId?._id || task.storeId;

  // Base: agentes activos con el serviceType aprobado
  const profileFilter = {
    status: "ACTIVE",
    approvedServiceTypes: serviceType,
  };

  // MTZSTORE_STANDARD requiere VERIFIED+
  if (method === "MTZSTORE_STANDARD") {
    profileFilter.platformTrustLevel = { $in: ["VERIFIED", "TRUSTED"] };
  }

  let profiles = await DeliveryAgentProfile.find(profileFilter)
    .populate("userId", "name email phone")
    .lean();

  // Para tiendas con modo partners_only, filtrar por partnership
  if ((method.startsWith("STORE") || method === "STORE") && storeId) {
    const store = await StoreModel.findById(storeId).lean();
    const modeKey = serviceType === "express" ? "expressMode" : "standardMode";
    const mode = store?.delivery?.[modeKey] || "partners_only";

    if (mode === "partners_only") {
      const activePartners = await DeliveryPartnership.find({
        storeId,
        serviceType,
        status: "ACTIVE",
      }).select("agentId").lean();

      const partnerIds = new Set(activePartners.map((p) => String(p.agentId)));

      // Fallback pool: si el task lleva 5+ min, incluir VERIFIED+ express
      const taskAge = task.createdAt ? Date.now() - new Date(task.createdAt).getTime() : 0;
      const fallbackActive = serviceType === "express" && taskAge >= FALLBACK_POOL_DELAY_MS;

      profiles = profiles.filter((p) => {
        const id = String(p.userId._id || p.userId);
        if (partnerIds.has(id)) return true;
        if (fallbackActive && TRUST_RANK[p.platformTrustLevel] >= TRUST_RANK.VERIFIED) return true;
        return false;
      });
    }
  }

  return profiles;
}
