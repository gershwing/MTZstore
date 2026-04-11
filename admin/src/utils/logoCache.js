// admin/src/utils/logoCache.js

// ✅ Valida URLs antes de escribir/emitir
const isValidUrl = (u) =>
  typeof u === "string" && /^(https?:\/\/|data:image|\/|blob:)/i.test(u || "");

// 🔑 Claves
const K_PLATFORM = "logo:platform";
const K_LEGACY = "logo"; // compat vieja
const K_STORE = (id) => `logo:store:${id}`;

/* =========================
 *  Plataforma (GLOBAL)
 * ========================= */
export const getPlatformLogo = () => {
  try {
    return localStorage.getItem(K_PLATFORM) || localStorage.getItem(K_LEGACY) || "";
  } catch {
    return "";
  }
};

export const setPlatformLogo = (url) => {
  if (!isValidUrl(url)) return; // ⛔️ nunca pisar con falsy/invalid
  try {
    localStorage.setItem(K_PLATFORM, url);
    // compat legacy
    localStorage.setItem(K_LEGACY, url);
  } catch { }
  try {
    window.dispatchEvent(new CustomEvent("logo:updated", {
      detail: { scope: "platform", url }
    }));
  } catch { }
};

/* =========================
 *  Tienda (SCOPED)
 * ========================= */
export const getStoreLogo = (storeId) => {
  if (!storeId) return "";
  try {
    return localStorage.getItem(K_STORE(storeId)) || "";
  } catch {
    return "";
  }
};

export const setStoreLogo = (storeId, url) => {
  if (!storeId || !isValidUrl(url)) return;
  try {
    localStorage.setItem(K_STORE(storeId), url);
  } catch { }
  try {
    window.dispatchEvent(new CustomEvent("logo:updated", {
      detail: { scope: "store", storeId: String(storeId), url }
    }));
  } catch { }
};

/* =========================
 *  Compatibilidad con tu código actual
 *  - getLocalLogo/setLocalLogo = GLOBAL
 * ========================= */
export const getLocalLogo = () => getPlatformLogo();

export const setLocalLogo = (url) => {
  // Mantiene la semántica original: escribe SOLO el global
  if (!isValidUrl(url)) return;
  setPlatformLogo(url);
};

/* =========================
 *  Helper opcional: elegir logo efectivo
 *  (prioriza tienda; cae a plataforma; luego vacío)
 * ========================= */
export const getEffectiveLogo = (storeId) => {
  const s = getStoreLogo(storeId);
  if (isValidUrl(s)) return s;
  const p = getPlatformLogo();
  if (isValidUrl(p)) return p;
  return "";
};
