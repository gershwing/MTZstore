// admin/src/utils/session.js
import { api } from "./api";
import { setTenantId, clearTenantId, getTenantId } from "./tenant";
// ✅ proteger el logo ante limpiezas agresivas
import { getLocalLogo, setLocalLogo } from "@/utils/logoCache";

/* ======================================================
 *  Eventos globales (con tolerancia a CustomEvent/Event)
 * ==================================================== */
function safeDispatch(name, detail) {
  try {
    if (typeof window === "undefined") return;
    if (typeof CustomEvent === "function") {
      window.dispatchEvent(new CustomEvent(name, detail ? { detail } : undefined));
    } else {
      window.dispatchEvent(new Event(name));
    }
  } catch { }
}

export function emitAuthUpdated() {
  safeDispatch("auth:updated");
}

export function onAuthUpdated(handler) {
  const fn = () => handler?.();
  if (typeof window !== "undefined" && window.addEventListener) {
    window.addEventListener("auth:updated", fn);
  }
  return () => {
    if (typeof window !== "undefined" && window.removeEventListener) {
      window.removeEventListener("auth:updated", fn);
    }
  };
}

function emitTenantChanged(payload = { storeId: null }) {
  safeDispatch("tenant:changed", payload ? { detail: payload } : undefined);
}

/* ============== Auth header default (axios) ============== */
function setDefaultAuthHeader(tok) {
  if (tok) api.defaults.headers.common.Authorization = `Bearer ${tok}`;
  else delete api.defaults.headers.common.Authorization;
}

/* ================== Tokens helpers ================== */
/**
 * setSessionTokens:
 *  - Firma 1: setSessionTokens(access, refresh)
 *  - Firma 2: setSessionTokens({ accessToken, refreshToken, access, refresh })
 */
export function setSessionTokens(a, b) {
  let accessToken = null;
  let refreshToken = null;

  if (typeof a === "object" && a !== null && b === undefined) {
    accessToken = a.accessToken ?? a.access ?? null;
    refreshToken = a.refreshToken ?? a.refresh ?? null;
  } else {
    accessToken = a ?? null;
    refreshToken = b ?? null;
  }

  try {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    else localStorage.removeItem("accessToken");

    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    else localStorage.removeItem("refreshToken");
  } finally {
    // Impacto inmediato en axios + evento para el provider/UI
    setDefaultAuthHeader(accessToken || null);
    emitAuthUpdated();
  }
}

/**
 * ❗️clearSessionTokens:
 * - Elimina SOLO access/refresh.
 * - NO limpia localStorage completo.
 * - Conserva el logo (snapshot + reescritura defensiva).
 * - Limpia tenant y notifica.
 */
export function clearSessionTokens() {
  // snapshot defensivo del logo (por si algo más limpia storage)
  let logoSnapshot = "";
  try {
    logoSnapshot = getLocalLogo() || "";
  } catch { }

  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  } finally {
    // Marca "acabo de salir" para que el interceptor no refresque
    try {
      window.__JUST_LOGGED_OUT = Date.now();
    } catch { }
    try {
      clearTenantId();
    } catch { }
    setDefaultAuthHeader(null);
    emitTenantChanged({ storeId: null });
    emitAuthUpdated();

    // ✅ reestablece el logo si seguía presente
    try {
      if (logoSnapshot) setLocalLogo(logoSnapshot);
    } catch { }
  }
}

export function getAccessToken() {
  try {
    const v = localStorage.getItem("accessToken");
    return v ? v : null;
  } catch {
    return null;
  }
}

/* ===== Aliases legacy ===== */
export function saveTokens({ accessToken, refreshToken, access, refresh }) {
  setSessionTokens({ accessToken, refreshToken, access, refresh });
}
export function clearTokens() {
  clearSessionTokens();
}

/* ===== Normalización de payload de backend ===== */
function pickAccessToken(apiData) {
  return (
    apiData?.accessToken ||
    apiData?.access_token ||
    apiData?.accesstoken ||
    apiData?.token ||
    apiData?.access ||
    apiData?.data?.accessToken ||
    apiData?.data?.access_token ||
    apiData?.data?.accesstoken ||
    apiData?.data?.token ||
    apiData?.data?.access ||
    null
  );
}
function pickRefreshToken(apiData) {
  return (
    apiData?.refreshToken ||
    apiData?.refresh_token ||
    apiData?.refresh ||
    apiData?.data?.refreshToken ||
    apiData?.data?.refresh_token ||
    apiData?.data?.refresh ||
    null
  );
}

/**
 * persistTokens: tolerante a payloads crudos y a apiData
 * - Guarda access/refresh
 * - Emite auth:updated (indirecto y directo)
 */
export function persistTokens(raw) {
  const at =
    pickAccessToken(raw) ??
    raw?.accessToken ??
    raw?.access_token ??
    raw?.token ??
    raw?.access ??
    null;
  const rt =
    pickRefreshToken(raw) ??
    raw?.refreshToken ??
    raw?.refresh_token ??
    raw?.refresh ??
    null;

  // Usar firma de 2 args garantiza setDefaultAuthHeader inmediato
  setSessionTokens(at || null, rt || null);
  emitAuthUpdated();
  return Boolean(at);
}

/* ================== /me helpers ================== */
function extractMe(meResponse) {
  const L1 = meResponse?.data ?? meResponse;
  if (!L1) return null;
  if (L1.me) return L1.me;
  if (L1.data?.me) return L1.data.me;
  if (L1.data && (L1.data.email || L1.data.role || L1.data.memberships || L1.data.roles))
    return L1.data;
  return L1;
}
function extractMemberships(meResponseOrMe) {
  const L1 = meResponseOrMe?.data ?? meResponseOrMe;
  const base = L1?.memberships || L1?.data?.memberships || L1?.me?.memberships || [];
  return Array.isArray(base) ? base : [];
}
function isSuperAdmin(me) {
  return (
    !!me?.isSuper ||
    me?.role === "SUPER_ADMIN" ||
    me?.isPlatformSuperAdmin === true ||
    (Array.isArray(me?.roles) && me.roles.includes("SUPER_ADMIN"))
  );
}
function normalizeMe(me) {
  if (!me) return null;
  const roles = Array.isArray(me.roles) ? me.roles.map(String) : [];
  const _isSuper = isSuperAdmin(me);
  return { ...me, roles, isSuper: _isSuper };
}
function logMe(where, raw, me) {
  try {
    const roles = Array.isArray(me?.roles) ? me.roles : [];
    console.groupCollapsed(
      `[ME][${where}] role=${me?.role} isSuper=${!!me?.isSuper} roles=[${roles.join(",")}] isPlatformSuperAdmin=${String(
        !!me?.isPlatformSuperAdmin
      )}`
    );
    console.log("raw:", raw);
    console.log("normalized me:", me);
    console.log("X-Store-Id (localStorage):", localStorage.getItem("X-Store-Id"));
    console.groupEnd();
  } catch { }
}

/** Hidrata /me y normaliza scope de tienda para SUPER_ADMIN */
export async function hydrateMeAndNormalizeScope() {
  // Guard: si no hay tokens, no llamar /me (previene 401 innecesarios)
  try {
    const at = localStorage.getItem("accessToken") || "";
    const rt = localStorage.getItem("refreshToken") || "";
    if (!at && !rt) {
      return { me: null, isSuper: false, memberships: [], isAuthenticated: false, route: "/admin" };
    }
  } catch { }

  let me = null,
    raw = null;

  const withTimeout = (p, ms = 8000) =>
    Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("ME_TIMEOUT")), ms))]);

  try {
    raw = await withTimeout(
      api.get("/api/user/me", {
        params: { _ts: Date.now() },
        headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" },
        withCredentials: true, // para cookie httpOnly (refresh)
        omitTenantHeader: true, // ⬅️ NO enviar X-Store-Id a /me
        __noTenant: true, // ⬅️ explícito para el interceptor
        __noRetry401: true,
      })
    );
    me = normalizeMe(extractMe(raw));
  } catch (e) {
    const status = e?.response?.status ?? e?.status ?? 0;
    if (status === 401 || status === 403) {
      clearSessionTokens(); // limpia y notifica (protege logo)
    }
  }

  const memberships = extractMemberships(raw?.data ?? raw);
  const isAuthenticated = !!(me?._id || me?.id);
  const isSuper = !!me?.isSuper;

  // Auto-tenant si no hay y el backend mandó defaultStoreId (no super)
  try {
    if (!isSuper && !getTenantId() && me?.defaultStoreId) {
      setTenantId(me.defaultStoreId);
      emitTenantChanged({ storeId: me.defaultStoreId });
    }
  } catch { }

  logMe("hydrateMeAndNormalizeScope", raw?.data ?? raw, me);

  if (isSuper) {
    try {
      clearTenantId();
    } catch { }
    emitTenantChanged({ storeId: null });
  }

  return { me, isSuper, memberships, isAuthenticated, route: "/admin" };
}

/**
 * Re-hidratación vía Provider (sin llamar /me aquí)
 */
export async function rehydrateViaProvider() {
  emitAuthUpdated();
  await Promise.resolve();
}

/** Decide ruta por roles/memberships cuando no hay tienda definida (fallback) */
function pickRouteForNoTenant() {
  return "/admin";
}

/* ====== Helpers tolerantes para storeId desde memberships ====== */
function pickStoreIdFromMembership(m) {
  return m?.storeId || m?.store?.id || m?.store?._id || m?.tenantId || m?.organizationId || m?.orgId || null;
}
function firstStoreId(memberships = []) {
  for (const m of memberships) {
    const sid = pickStoreIdFromMembership(m);
    if (sid) return String(sid);
  }
  return null;
}

/* ======================================================
 *  ✅ afterLogin (versión solicitada)
 *  - Limpia tenant viejo SIEMPRE
 *  - Persiste tokens si aplica (o confía en cookie httpOnly)
 *  - Hidrata /me SIN tenant y usa defaultStoreId/activeStoreId
 *  - Navega ya con tenant consistente
 *  (Se añaden eventos 'auth:updated' y 'tenant:changed' para reactividad UI)
 * ==================================================== */
export async function afterLogin({ apiData, navigate }) {
  try {
    // 1) limpia siempre el tenant anterior
    try {
      localStorage.removeItem("X-Store-Id");
      clearTenantId?.();
    } catch { }

    // 2) persiste tokens si aplica (o confía en cookie httpOnly)
    await setSessionTokens(apiData);
    emitAuthUpdated?.(); // notificar a Provider/UI

    // 3) hidrata /me SIN tenant y usa defaultStoreId
    const me = await api
      .get("/api/user/me", { withCredentials: true, omitTenantHeader: true, __noTenant: true })
      .then((r) => r?.data?.data || r?.data || {});

    const sid = me?.defaultStoreId || me?.activeStoreId || null;
    if (sid) {
      try {
        setTenantId?.(sid);
      } catch {
        localStorage.setItem("X-Store-Id", sid);
      }
      emitTenantChanged({ storeId: sid }); // avisar a Sidebar/Header
    }

    // 4) navega ya con tenant consistente
    (navigate || ((p) => window.location.assign(p)))("/admin");
  } catch {
    (navigate || ((p) => window.location.assign(p)))("/admin");
  }
}

/* ================== Logout conveniente (UI) ================== */
export async function logout() {
  // snapshot defensivo del logo antes de cualquier limpieza externa
  let logoSnapshot = "";
  try {
    logoSnapshot = getLocalLogo() || "";
  } catch { }

  try {
    await api.post("/api/user/logout", {}, { __public: true, withCredentials: true, __noRetry401: true });
  } catch { }

  clearSessionTokens(); // ya reestablece el logo si había snapshot interno

  // doble protección: si por algún motivo otra parte limpió después del clear,
  // volvemos a escribir el logo aquí también.
  try {
    if (logoSnapshot) setLocalLogo(logoSnapshot);
  } catch { }
}

/* ======================================================
 *  Aliases simples solicitados (compatibilidad ligera)
 * ==================================================== */

export async function hydrateMeAndNormalizeScopeSimple() {
  try {
    await fetch(`${location.origin}/api/user/me?_=${Date.now()}`, {
      credentials: "include",
      cache: "no-store",
    });
  } catch { }
}

export function emitAuthUpdatedSimple() {
  try {
    emitAuthUpdated();
  } catch { }
}

export const hydrateMe = hydrateMeAndNormalizeScope;
export const emitAuth = emitAuthUpdated;
