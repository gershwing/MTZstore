// admin/src/utils/tenant.js

/** ================================
 *  Claves de storage (primaria + compat)
 * ================================ */
export const TENANT_KEY_PRIMARY = "X-Store-Id";          // ✅ clave principal (fuente de verdad)
export const TENANT_KEY_ALT = "current_store_id";        // 🔁 compat
export const TENANT_KEY_LEGACY = "currentStoreId";       // 🔁 legacy muy antiguo

// Alias simples por compatibilidad con helpers existentes
export const KEY = TENANT_KEY_PRIMARY;
export const TENANT_KEY = TENANT_KEY_PRIMARY; // ⬅️ coincide con tu helper original

const ALL_KEYS = [TENANT_KEY_PRIMARY, TENANT_KEY_ALT, TENANT_KEY_LEGACY];

/** ================================
 *  Lecturas
 * ================================ */
/**
 * Lee el tenant actual (prioriza la clave primaria, luego compat/legacy).
 * Devuelve string con el id o null si no existe.
 */
export function getTenantId() {
  try {
    const k1 = localStorage.getItem(TENANT_KEY_PRIMARY);
    if (k1 && String(k1).trim()) return String(k1).trim();

    const k2 = localStorage.getItem(TENANT_KEY_ALT);
    if (k2 && String(k2).trim()) return String(k2).trim();

    const k3 = localStorage.getItem(TENANT_KEY_LEGACY);
    if (k3 && String(k3).trim()) return String(k3).trim();

    return null;
  } catch {
    return null;
  }
}

/** Alias retro-compatible para no romper imports existentes */
export const getCurrentStoreId = getTenantId;

/** ================================
 *  Helpers de notificación
 * ================================ */
function notifyTenantChange(val, oldVal) {
  const detail = { id: val ?? null, storeId: val ?? null };

  // Eventos internos (misma pestaña)
  try { window.dispatchEvent(new CustomEvent("tenant:changed", { detail })); } catch { }
  try { window.dispatchEvent(new CustomEvent("mtz:tenant-changed", { detail })); } catch { }

  // Emite un StorageEvent útil para listeners cross-tab y watchers
  try {
    const ev = new StorageEvent("storage", {
      key: TENANT_KEY_PRIMARY,
      oldValue: oldVal ?? null,
      newValue: val ?? null,
      storageArea: localStorage,
      url: typeof location !== "undefined" ? location.href : "",
    });
    window.dispatchEvent(ev);
  } catch { }
}

/** ================================
 *  Escrituras
 * ================================ */
/**
 * Guarda / limpia el tenant en la clave primaria "X-Store-Id"
 * (y sincroniza compat/legacy) y notifica a la app.
 */
export function setCurrentStoreId(storeId) {
  try {
    const val = storeId && String(storeId).trim() ? String(storeId).trim() : null;

    // Captura oldValue para el StorageEvent
    const oldVal = localStorage.getItem(TENANT_KEY_PRIMARY);

    if (val) {
      // Escribe SIEMPRE la clave que leen layout/interceptor
      localStorage.setItem(TENANT_KEY_PRIMARY, val);
      // Mantén compatibilidad (opcional pero útil)
      for (const k of [TENANT_KEY_ALT, TENANT_KEY_LEGACY]) localStorage.setItem(k, val);
    } else {
      localStorage.removeItem(TENANT_KEY_PRIMARY);
      for (const k of [TENANT_KEY_ALT, TENANT_KEY_LEGACY]) localStorage.removeItem(k);
    }

    notifyTenantChange(val, oldVal);
  } catch {
    /* noop */
  }
}

/** Setter explícito (alias) — satisface el helper simple */
export const setTenantId = setCurrentStoreId;

/** Limpia el tenant (todas las claves) y notifica */
export function clearCurrentStoreId() {
  setCurrentStoreId(null);
}

/** Alias explícitos (compat con nombres previos) */
export const clearTenantId = clearCurrentStoreId;
export const clearTenant = clearCurrentStoreId;

/** ================================
 *  Utilidad de migración
 *  Copia compat/legacy → primaria si falta
 * ================================ */
export function ensureTenantIdFromLegacy() {
  try {
    const primary = localStorage.getItem(TENANT_KEY_PRIMARY);
    if (primary && String(primary).trim()) return;

    // Busca en alternativas
    const alt = localStorage.getItem(TENANT_KEY_ALT);
    const legacy = localStorage.getItem(TENANT_KEY_LEGACY);
    const candidate = [alt, legacy].find((v) => v && String(v).trim());

    if (candidate) {
      const val = String(candidate).trim();
      const oldVal = null;
      localStorage.setItem(TENANT_KEY_PRIMARY, val);
      for (const k of [TENANT_KEY_ALT, TENANT_KEY_LEGACY]) localStorage.setItem(k, val);
      notifyTenantChange(val, oldVal);
    }
  } catch {
    /* noop */
  }
}

/** ================================
 *  Extra: limpieza total (todas las keys)
 * ================================ */
export function nukeAllTenantKeys() {
  try {
    const oldVal = localStorage.getItem(TENANT_KEY_PRIMARY);
    for (const k of ALL_KEYS) localStorage.removeItem(k);
    notifyTenantChange(null, oldVal);
  } catch { }
}
