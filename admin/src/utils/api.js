// admin/src/utils/api.js
import axios from "axios";
import { getTenantId } from "./tenant";
import { setSessionTokens, clearSessionTokens, getAccessToken } from "./session";

/* ================= Base URL ================= */
const USE_PROXY = String(import.meta.env.VITE_USE_PROXY || "").toLowerCase() === "true";
const rawBase = USE_PROXY
    ? ""
    : (import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_BASE_URL ||
        "http://localhost:8000") + "";
const apiUrl = String(rawBase).replace(/\/$/, "");

/* ================ Axios base ================ */
export const api = axios.create({
    baseURL: apiUrl,
    timeout: 20000,
    withCredentials: true, // cookies httpOnly en dev/prod
});

/* ================ Helpers de path ================ */
function getPathname(cfg) {
    try {
        const base = api.defaults.baseURL || window.location.origin;
        const u = new URL(cfg.url, base);
        return u.pathname;
    } catch {
        return cfg.url || "";
    }
}
const isAdminLogoPath = (p) =>
    /\/api\/logo\/admin(\b|\/|\?)/i.test(String(p || ""));

/* ================ Rutas públicas (sin auth/tenant) ================ */
const PUBLIC_PATTERNS = [
    /^\/api\/auth\/login/i,
    /^\/api\/auth\/logout/i,
    /^\/api\/auth\/register/i,
    /^\/api\/auth\/refresh/i,

    /^\/api\/user\/login/i,
    /^\/api\/user\/logout/i,
    /^\/api\/user\/authWithGoogle/i,
    /^\/api\/user\/refresh(?:-token)?/i,

    /^\/api\/public\//i,

    // bootstrap inicial
    /^\/api\/config/i,
    /^\/api\/category(?:\/|$)/i,
];


/* ====== Guard: evitar refresh inmediatamente tras logout ====== */
const JUST_LOGGED_OUT_MS = 5000;
function justLoggedOut() {
    try {
        const t = Number(window.__JUST_LOGGED_OUT || 0);
        return t && Date.now() - t < JUST_LOGGED_OUT_MS;
    } catch {
        return false;
    }
}

/* ================ Querystring helper ================= */
export function buildListParams(params = {}) {
    const qp = new URLSearchParams();
    const push = (k, v) => {
        if (v == null) return;
        const s = String(v).trim();
        if (!s) return;
        qp.append(k, s);
    };
    for (const [key, val] of Object.entries(params)) {
        if (Array.isArray(val)) {
            val.forEach((v) => push(key, v));
            continue;
        }
        if (typeof val === "number") qp.append(key, String(val));
        else push(key, val);
    }
    const qs = qp.toString();
    return qs ? `?${qs}` : "";
}

/* ================ Mantener defaults Authorization sincronizados ================ */
function setDefaultAuthHeader(tok) {
    if (tok) api.defaults.headers.common.Authorization = `Bearer ${tok}`;
    else delete api.defaults.headers.common.Authorization;
}

function syncDefaultAuth() {
    try {
        const tok = getAccessToken();
        setDefaultAuthHeader(tok);
    } catch { }
}
try {
    window.addEventListener("auth:updated", syncDefaultAuth);
} catch { }
syncDefaultAuth();

/* ================ Request interceptor (principal) ================ */
/**
 * Este interceptor hace TODO:
 *  - reglas de auth
 *  - reglas de tenant (incluyendo __skipTenantInject)
 *  - reglas especiales (/me, /getAllUsers, /logo/admin, etc.)
 */
api.interceptors.request.use((cfg) => {
    const urlStr = String(cfg?.url || "");
    const path = getPathname(cfg) || "";

    const isAuthEndpoint = /^\/?api\/(user\/login|user\/logout|user\/authWithGoogle|auth\/refresh|user\/refresh(?:-token)?|user\/refresh)/i.test(
        urlStr
    );

    // 0) Endpoints de AUTH: no heredar headers previos; forzar cookies
    if (isAuthEndpoint) {
        cfg.headers = { ...(cfg.headers || {}) };
        delete cfg.headers.Authorization;
        delete cfg.headers["X-Store-Id"];
        cfg.withCredentials = true;
        return cfg;
    }

    // B) Regla defensiva: getAllUsers SIEMPRE sin tenant + no-cache
    if (/^\/api\/user\/getAllUsers(\b|\/|\?)/i.test(path)) {
        cfg.omitTenantHeader = true;
        cfg.__noTenant = true;
        if (cfg.headers) delete cfg.headers["X-Store-Id"];
        cfg.headers = {
            ...(cfg.headers || {}),
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Accept: "application/json",
        };
    }

    // --- NUEVO BLOQUE DEFENSIVO multi-tenant ---
    // Forzar NO tenant para plataforma si caller lo marcó
    if (cfg?.omitTenantHeader === true || cfg?.__noTenant === true) {
        if (cfg.headers) delete cfg.headers["X-Store-Id"];
        // bandera interna para que NO reinyectemos tenant más abajo
        cfg.__skipTenantInject = true;
    }

    // Inyección automática de tenant SI y SOLO SI no saltamos tenant
    if (!cfg.__skipTenantInject) {
        try {
            const sidExplicit =
                (typeof getTenantId === "function" ? getTenantId() : null) ||
                (typeof localStorage !== "undefined"
                    ? localStorage.getItem("X-Store-Id")
                    : null);

            if (sidExplicit) {
                if (!(cfg.headers && "X-Store-Id" in cfg.headers)) {
                    cfg.headers = { ...(cfg.headers || {}), "X-Store-Id": String(sidExplicit) };
                }
            }
        } catch {
            /* ignore */
        }
    }

    // Público si el caller lo pide (__public) o coincide con patrones
    const matchesPublic = PUBLIC_PATTERNS.some((rx) => rx.test(path));
    let isPublic = cfg.__public === true || matchesPublic;

    // ❗️ EXCEPCIÓN: /api/logo/admin NUNCA es público (necesita Authorization si existe)
    if (isAdminLogoPath(path)) isPublic = false;

    // 🚦 Solo GET de /api/logo es público; POST/PUT/DELETE requieren auth
    if (/^\/api\/logo(\/.*)?$/i.test(path) && !isAdminLogoPath(path)) {
        const m = String(cfg.method || "get").toLowerCase();
        if (m !== "get") isPublic = false;
    }

    // 🚦 Solo GET de /api/category es público; POST/PUT/DELETE requieren auth
    if (/^\/api\/category(\/.*)?$/i.test(path)) {
        const m = String(cfg.method || "get").toLowerCase();
        if (m !== "get") isPublic = false;
    }

    // 1) Authorization (Bearer) — según el token actual
    if (!isPublic && !cfg.__noAuth && !cfg.__useRefreshToken) {
        const t = getAccessToken();
        cfg.headers = { ...(cfg.headers || {}) };
        if (t) cfg.headers.Authorization = `Bearer ${t}`;
        else if (cfg.headers.Authorization) delete cfg.headers.Authorization;
    } else if (cfg?.headers?.Authorization) {
        cfg.headers = { ...(cfg.headers || {}) };
        delete cfg.headers.Authorization;
    }

    // Limpieza defensiva: requests públicos nunca deben arrastrar Authorization
    if (isPublic && cfg?.headers?.Authorization) {
        delete cfg.headers.Authorization;
    }

    // 2) Regla dura: /api/user/me SIEMPRE sin tenant (evita 403 por scope)
    if (/^\/api\/user\/me(\b|\/|\?)/i.test(cfg.url || "")) {
        if (cfg.headers) delete cfg.headers["X-Store-Id"];
        cfg.omitTenantHeader = true;
        cfg.__noTenant = true;
        cfg.__skipTenantInject = true;
    }

    return cfg;
});

/* ================ Response interceptor (refresh + auth:updated) ================ */
let refreshing = null;

async function refreshTokenOnce() {
    if (refreshing) return refreshing;

    refreshing = (async () => {
        // 1) Preferente: /api/user/refresh (usa cookie httpOnly refresh_token)
        try {
            const r = await api.post(
                "/api/user/refresh",
                {},
                { __useRefreshToken: true, __public: true, withCredentials: true }
            );
            const data = r?.data || {};
            const access = data?.accessToken || data?.data?.accessToken;
            const refresh = data?.refreshToken || data?.data?.refreshToken;
            if (access || refresh) {
                setSessionTokens(access || null, refresh || null);
                setDefaultAuthHeader(access || null);
                try {
                    window.dispatchEvent(new CustomEvent("auth:updated"));
                } catch { }
            }
            return data;
        } catch (_) {
            // 2) Fallback: /api/auth/refresh con { refreshToken } en body
            try {
                const rt = localStorage.getItem("refreshToken") || "";
                if (!rt) throw new Error("no_refresh_in_ls");
                const r1 = await api.post(
                    "/api/auth/refresh",
                    { refreshToken: rt },
                    { __useRefreshToken: true, __public: true, withCredentials: true }
                );
                const d1 = r1?.data || {};
                const a1 = d1?.accessToken || d1?.data?.accessToken;
                const rrt1 = d1?.refreshToken || d1?.data?.refreshToken;
                if (a1 || rrt1) {
                    setSessionTokens(a1 || null, rrt1 || null);
                    setDefaultAuthHeader(a1 || null);
                    try {
                        window.dispatchEvent(new CustomEvent("auth:updated"));
                    } catch { }
                }
                return d1;
            } catch {
                // 3) Fallback: /api/user/refresh-token con Bearer <refresh>
                try {
                    const rt = localStorage.getItem("refreshToken") || "";
                    if (!rt) throw new Error("no_refresh_in_ls");
                    const r2 = await api.post("/api/user/refresh-token", null, {
                        headers: { Authorization: `Bearer ${rt}` },
                        __useRefreshToken: true,
                        __public: true,
                        withCredentials: true,
                    });
                    const d2 = r2?.data || {};
                    const a2 = d2?.accessToken || d2?.data?.accessToken;
                    const rrt2 = d2?.refreshToken || d2?.data?.refreshToken;
                    if (a2 || rrt2) {
                        setSessionTokens(a2 || null, rrt2 || null);
                        setDefaultAuthHeader(a2 || null);
                        try {
                            window.dispatchEvent(new CustomEvent("auth:updated"));
                        } catch { }
                    }
                    return d2;
                } catch {
                    // falló todo → limpiar sesión local
                    clearSessionTokens();
                    setDefaultAuthHeader(null);
                    try {
                        window.dispatchEvent(new CustomEvent("auth:updated"));
                    } catch { }
                    return null;
                }
            }
        }
    })().finally(() => {
        setTimeout(() => {
            refreshing = null;
        }, 0);
    });

    return refreshing;
}

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const status = error?.response?.status;
        const original = error?.config || {};
        if (!error?.response) return Promise.reject(error);

        const path = getPathname(original);
        const adminLogo = isAdminLogoPath(path);

        // 403 (sin refresh): log y seguimos
        if (status === 403) {
            try {
                const sid = getTenantId();
                console.warn("[403 scope]", {
                    url: original?.url,
                    sid,
                    headers: original?.headers,
                });
            } catch { }
        }

        // 401 → intenta refresh excepto si:
        //  - ya se reintentó
        //  - es una llamada que usa refreshToken
        //  - caller pidió no refrescar (__noRefresh)
        //  - es /api/logo/admin (para evitar loop de parpadeo)
        const skipRefresh =
            original.__noRefresh === true || adminLogo === true;

        if (
            status === 401 &&
            !original._retry &&
            !original.__useRefreshToken &&
            !skipRefresh
        ) {
            // Evitar el refresh tras logout o cuando lo piden explícitamente
            if (justLoggedOut() || original.__noRetry401) {
                try {
                    clearSessionTokens();
                    setDefaultAuthHeader(null);
                    window.dispatchEvent(new CustomEvent("auth:updated"));
                } catch { }
                return Promise.reject(error);
            }

            original._retry = true;

            const data = await refreshTokenOnce();
            const newAT =
                data?.accessToken ||
                data?.data?.accessToken ||
                data?.data?.accesstoken ||
                null;

            if (!newAT) {
                clearSessionTokens();
                setDefaultAuthHeader(null);
                try {
                    window.dispatchEvent(new CustomEvent("auth:updated"));
                } catch { }
                return Promise.reject(error);
            }

            // Reintenta request original con headers actualizados
            original.headers = {
                ...(original.headers || {}),
                Authorization: `Bearer ${newAT}`,
            };

            const wasPublic = PUBLIC_PATTERNS.some((rx) =>
                rx.test(getPathname(original))
            );
            if (wasPublic || original.__noTenant || original.omitTenantHeader) {
                original.__public = wasPublic || original.__public;
                if (original.headers) {
                    delete original.headers["X-Store-Id"];
                }
                original.__skipTenantInject = true;
            } else {
                const sid = getTenantId();
                if (sid && String(sid).trim().length > 0) {
                    const v = String(sid).trim();
                    original.headers["X-Store-Id"] = v;
                } else {
                    delete original.headers["X-Store-Id"];
                }
            }

            try {
                window.dispatchEvent(new CustomEvent("auth:updated"));
            } catch { }
            return api(original);
        }

        // 403 = autenticado pero sin permiso. NO borrar token ni cerrar sesión.
        // Solo 401 (token inválido/expirado) debe limpiar la sesión.

        return Promise.reject(error);
    }
);

/* ================ Helper: noCache config ================= */
export function noCache(extra = {}) {
    const cfg = { ...(extra || {}) };
    cfg.params = { ...(cfg.params || {}), _ts: Date.now() };
    cfg.headers = {
        Accept: "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        ...(cfg.headers || {}),
    };
    return cfg;
}

/* ================ Helpers (aceptan config opcional) ================ */
const isFormData = (v) =>
    typeof FormData !== "undefined" && v instanceof FormData;

export const fetchDataFromApi = async (url, config = {}) => {
    try {
        const { data } = await api.get(url, config);
        return data ?? {};
    } catch (err) {
        console.error(err);

        const payload = err?.response?.data;

        if (payload && typeof payload === "object") {
            return payload;
        }

        return {
            error: true,
            message: "Network error",
        };
    }
};

export const postData = async (url, body, config = {}) => {
    try {
        const headers = { ...(config.headers || {}) };
        if (!isFormData(body) && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }
        const shouldSendCookies =
            typeof config.withCredentials === "boolean"
                ? config.withCredentials
                : /^\/api\/user\/login/i.test(url) ||
                /^\/api\/user\/authWithGoogle/i.test(url) ||
                /^\/api\/auth\/refresh/i.test(url) ||
                /^\/api\/user\/refresh(?:-token)?/i.test(url) ||
                /^\/api\/user\/refresh/i.test(url);

        const payload = isFormData(body) ? body : body ?? {};
        const { data } = await api.post(url, payload, {
            ...config,
            headers,
            withCredentials: shouldSendCookies,
        });

        // ⬇️ Si el backend devuelve tokens (login, google, verify), persístalos y avisa al app
        const at = data?.accessToken || data?.data?.accessToken;
        const rt = data?.refreshToken || data?.data?.refreshToken;
        if (at || rt) {
            setSessionTokens(at || null, rt || null);
            setDefaultAuthHeader(at || null);
            try {
                window.dispatchEvent(new CustomEvent("auth:updated"));
            } catch { }
        }

        // ⬇️ Caso Google/login cuando SOLO se setea cookie httpOnly y no vienen tokens en el body
        const looksSessionful =
            /^\/api\/user\/authWithGoogle/i.test(url) ||
            /^\/api\/user\/login/i.test(url) ||
            /^\/api\/auth\/refresh/i.test(url) ||
            /^\/api\/user\/refresh(?:-token)?/i.test(url) ||
            /^\/api\/user\/refresh/i.test(url);

        if (looksSessionful && !at && !rt) {
            try {
                window.dispatchEvent(new CustomEvent("auth:updated"));
            } catch { }
        }

        return data;
    } catch (err) {
        console.error(err);
        return (
            err?.response?.data ?? { error: true, message: "Network error" }
        );
    }
};

export const editData = async (url, updatedData, config = {}) => {
    try {
        const headers = { ...(config.headers || {}) };
        if (!isFormData(updatedData) && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }
        const { data } = await api.put(url, updatedData, {
            ...config,
            headers,
        });
        return data;
    } catch (err) {
        console.error(err);
        return (
            err?.response?.data ?? { error: true, message: "Network error" }
        );
    }
};

export const patchData = async (url, body, config = {}) => {
    try {
        const headers = { ...(config.headers || {}) };
        if (!isFormData(body) && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }
        const { data } = await api.patch(url, body, {
            ...config,
            headers,
        });
        return data;
    } catch (err) {
        console.error(err);
        return (
            err?.response?.data ?? { error: true, message: "Network error" }
        );
    }
};

export const uploadImage = async (url, formData, config = {}) => {
    try {
        const { data } = await api.put(url, formData, { ...config });
        return data;
    } catch (err) {
        console.error(err);
        return (
            err?.response?.data ?? { error: true, message: "Network error" }
        );
    }
};

export const uploadImages = async (url, formData, config = {}) => {
    try {
        const { data } = await api.post(url, formData, { ...config });
        return data;
    } catch (err) {
        console.error(err);
        return (
            err?.response?.data ?? { error: true, message: "Network error" }
        );
    }
};

export const deleteData = async (url, config = {}) => {
    try {
        const headers = {
            "Content-Type": "application/json",
            ...(config.headers || {}),
        };
        const { data } = await api.delete(url, { ...config, headers });
        return data;
    } catch (err) {
        console.error(err);
        return (
            err?.response?.data ?? { error: true, message: "Network error" }
        );
    }
};

export const deleteMultipleData = async (url, payload, config = {}) => {
    try {
        const headers = {
            "Content-Type": "application/json",
            ...(config.headers || {}),
        };
        const { data } = await api.delete(url, {
            ...config,
            headers,
            data: payload,
        });
        return data;
    } catch (err) {
        console.error(err);
        return (
            err?.response?.data ?? { error: true, message: "Network error" }
        );
    }
};

export const deleteImages = async (url, payload, config = {}) => {
    try {
        const headers = {
            "Content-Type": "application/json",
            ...(config.headers || {}),
        };
        const { data } = await api.delete(url, {
            ...config,
            headers,
            data: payload,
        });
        return data;
    } catch (err) {
        console.error(err);
        return (
            err?.response?.data ?? { error: true, message: "Network error" }
        );
    }
};

export const downloadWithAuth = async (url, config = {}) => {
    try {
        const res = await api.get(url, {
            responseType: "blob",
            ...config,
        });
        return res.data; // Blob
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export { api as default };
