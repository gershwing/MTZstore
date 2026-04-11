// admin/src/utils/socket.js
import { io } from "socket.io-client";
import { api } from "./api";
import { setTenantId } from "./tenant";
// 🔑 Rehidrata /me y fija tenant automáticamente; y refresca el AppProvider
import { hydrateMeAndNormalizeScope, rehydrateViaProvider } from "../utils/session";

let socket = null;
let connecting = false;
let lastAuthToken = null;
let bridgeAttached = false; // evita listeners duplicados con HMR

function usingProxy() {
  const v = (import.meta.env?.VITE_USE_PROXY || "").toString().toLowerCase();
  return v === "true";
}

/**
 * Resuelve la URL base del WS:
 * - Si VITE_USE_PROXY=true => misma-origin con RUTA RELATIVA (Vite proxyea /socket.io)
 * - VITE_SOCKET_URL o VITE_WS_URL (si están definidas)
 * - window.location.origin (same-origin)
 * - fallback: http://localhost:8000
 */
function resolveBaseUrl() {
  // Con proxy: mejor relativa → Vite reencamina /socket.io y evita mixed content
  if (usingProxy()) return "";

  const envSock = import.meta.env?.VITE_SOCKET_URL || import.meta.env?.VITE_WS_URL;
  if (envSock) return String(envSock).replace(/\/$/, "");

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "http://localhost:8000";
}

function getAccessToken() {
  try {
    return localStorage.getItem("accessToken") || "";
  } catch {
    return "";
  }
}

/** Forzamos sólo websocket (tu requerimiento):
 *  Ignoramos VITE_SOCKET_TRANSPORTS y fijamos ["websocket"].
 */
function resolveTransports() {
  return ["websocket"];
}

/**
 * Crea o reutiliza un singleton de Socket.IO.
 * - No auto-conectamos si no hay token (evita ruido en login)
 * - Cuando sí hay token, conectamos bajo demanda.
 */
export function getSocket(token) {
  const authToken = token ?? getAccessToken();
  lastAuthToken = authToken;

  // Si ya existe, sólo actualiza auth si cambió
  if (socket) {
    if (socket.auth?.token !== authToken) {
      socket.auth = authToken ? { token: authToken } : {};
    }
    return socket;
  }

  const BASE = resolveBaseUrl(); // "" si usas proxy (Vite)
  const transports = resolveTransports(); // ["websocket"]

  // 👇 Equivalente a: io("", { path: "/socket.io", transports: ["websocket"], withCredentials: true });
  socket = io(BASE, {
    path: "/socket.io",
    transports,
    withCredentials: true,
    auth: authToken ? { token: authToken } : {},
    autoConnect: false, // 👈 IMPORTANTÍSIMO: no autoconectar
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  // Logs suaves
  socket.on("connect", () => {
    connecting = false;
    if (import.meta.env?.DEV) console.info("[socket] connected");
  });
  socket.on("disconnect", (reason) => {
    if (import.meta.env?.DEV) console.info("[socket] disconnected:", reason);
  });
  socket.on("connect_error", (err) => {
    connecting = false;
    if (import.meta.env?.DEV) {
      console.warn("[socket] connect_error:", err?.message || err, {
        BASE,
        transports,
      });
    }
  });
  socket.io?.on?.("reconnect_attempt", (n) => {
    if (import.meta.env?.DEV) console.info("[socket] reconnect_attempt", n);
  });

  // Puente de auth y listeners de app (una sola vez)
  attachAuthBridge();
  attachAppListeners();
  // Auto-vincula el refresco de /me y fijado de tenant en cambios de rol/aprobación
  try {
    wireRoleChangeAutoTenant(socket);
  } catch { }

  return socket;
}

/** Conecta sólo si hay token; si no, no insiste */
export function ensureConnected() {
  const s = getSocket(lastAuthToken ?? getAccessToken());
  const tok = getAccessToken();
  if (!tok) return s; // 👈 sin token no conectamos
  if (s && !s.connected && !connecting) {
    try {
      connecting = true;
      s.connect();
    } catch {
      connecting = false;
    }
  }
  return s;
}

/** Actualiza el token y (si hay) reconecta; si no hay token, cierra */
export function updateSocketAuth(token, { reconnect = true } = {}) {
  lastAuthToken = token ?? "";
  if (!socket) getSocket(lastAuthToken);

  try {
    socket.auth = lastAuthToken ? { token: lastAuthToken } : {};
  } catch { }

  if (!lastAuthToken) {
    closeSocket(); // 👈 sin token, cerramos
    return socket;
  }

  if (reconnect) {
    // Reconexión "suave": si ya estaba conectado, corta y reconecta
    if (socket.connected) {
      try {
        socket.disconnect();
      } catch { }
    }
    try {
      socket.connect();
    } catch { }
  } else if (!socket.connected && !connecting) {
    try {
      socket.connect();
    } catch { }
  }

  // Asegura puentes/listeners
  attachAuthBridge();
  attachAppListeners();
  try {
    wireRoleChangeAutoTenant(socket);
  } catch { }

  return socket;
}

/** Cierra y resetea el singleton (logout, cambio de usuario) */
export function closeSocket() {
  try {
    socket?.disconnect();
  } catch { }
  try {
    socket?.close?.();
  } catch { }
  socket = null;
  connecting = false;
  lastAuthToken = null;
}

/** ¿Está conectado ahora mismo? */
export function isSocketConnected() {
  return !!(socket && socket.connected);
}

/* ==========================
   Helpers de listeners
   ========================== */
export function on(event, handler, { dedupe = true } = {}) {
  const s = ensureConnected();
  if (!s) return () => { };
  if (dedupe) s.off(event, handler);
  s.on(event, handler);
  return () => {
    try {
      s.off(event, handler);
    } catch { }
  };
}
export function once(event, handler) {
  const s = ensureConnected();
  if (!s) return () => { };
  const wrapped = (...args) => {
    try {
      handler(...args);
    } finally {
      try {
        s.off(event, wrapped);
      } catch { }
    }
  };
  s.on(event, wrapped);
  return () => {
    try {
      s.off(event, wrapped);
    } catch { }
  };
}
export function emit(event, payload) {
  const s = ensureConnected();
  try {
    s.emit(event, payload);
  } catch { }
}
export function replaceListener(event, handler) {
  const s = ensureConnected();
  if (!s) return () => { };
  try {
    s.removeAllListeners?.(event);
  } catch {
    s._callbacks && (s._callbacks[`$${event}`] = []);
  }
  s.on(event, handler);
  return () => {
    try {
      s.off(event, handler);
    } catch { }
  };
}

/* ==========================
   Puente con la sesión
   ========================== */
export function attachAuthBridge() {
  if (bridgeAttached || typeof window === "undefined") return;
  bridgeAttached = true;

  const handleAuthUpdated = () => {
    const tok = getAccessToken();
    if (tok) {
      updateSocketAuth(tok, { reconnect: true });
    } else {
      closeSocket();
    }
  };

  const handleStorage = (ev) => {
    if (!ev || ev.key == null) return;
    if (ev.key === "accessToken" || ev.key === "refreshToken") {
      const now = getAccessToken();
      const had = !!lastAuthToken;
      const has = !!now;
      if (has && (!had || now !== lastAuthToken)) {
        updateSocketAuth(now, { reconnect: true });
      } else if (!has && had) {
        closeSocket();
      }
    }
  };

  try {
    window.addEventListener("auth:updated", handleAuthUpdated);
  } catch { }
  try {
    window.addEventListener("storage", handleStorage);
  } catch { }

  // 🔥 HMR: limpia listeners si el módulo se reemplaza (evita duplicados en dev)
  try {
    if (import.meta?.hot) {
      import.meta.hot.dispose(() => {
        try {
          window.removeEventListener("auth:updated", handleAuthUpdated);
        } catch { }
        try {
          window.removeEventListener("storage", handleStorage);
        } catch { }
        bridgeAttached = false; // permite re-adjuntar limpio tras HMR
      });
    }
  } catch { }
}

/**
 * Vincula listeners globales de la app (idempotente).
 *  - role:changed → rehidrata /me y emite "auth:updated"
 *  - seller-app:status → re-emite DOMEvent para pantallas (Applications, etc.)
 *  - tenant:changed (socket) → fija X-Store-Id y emite DOMEvent tenant:changed
 */
export async function attachAppListeners() {
  const s = getSocket();
  if (!s || s._appListenersBound) return;

  // Lazy import para no romper si cambian rutas
  const sess = await import("../utils/session").catch(() => ({}));
  const hydrateMe =
    sess.hydrateMeAndNormalizeScope ||
    sess.hydrateMe ||
    null;

  const emitAuthUpdated =
    sess.emitAuthUpdated ||
    (() => {
      try {
        window.dispatchEvent(new CustomEvent("auth:updated"));
      } catch { }
    });

  s.on("role:changed", async () => {
    try {
      if (typeof hydrateMe === "function") await hydrateMe();
    } catch { }
    try {
      emitAuthUpdated();
    } catch { }
  });

  s.on("seller-app:status", (payload) => {
    try {
      window.dispatchEvent(new CustomEvent("seller-app:status", { detail: payload }));
    } catch { }
  });

  // ⬇️ ⬇️ INTEGRACIÓN SOLICITADA: sincronzar tenant desde el servidor por socket
  s.on("tenant:changed", ({ storeId }) => {
    try {
      if (storeId) {
        // Persistir y propagar
        localStorage.setItem("X-Store-Id", storeId);
        try { setTenantId(storeId); } catch { }
        try {
          window.dispatchEvent(new CustomEvent("tenant:changed", { detail: { storeId } }));
        } catch { }
      }
    } catch { }
  });
  // ⬆️ ⬆️

  s._appListenersBound = true;

  // HMR-safe: si el módulo se reemplaza, permitir re-adjuntar limpio
  try {
    if (import.meta?.hot) {
      import.meta.hot.dispose(() => {
        try {
          s.off("role:changed");
        } catch { }
        try {
          s.off("seller-app:status");
        } catch { }
        try {
          s.off("tenant:changed");
        } catch { }
        s._appListenersBound = false;
      });
    }
  } catch { }
}

/**
 * 2) Al recibir “role:changed” o “seller-app:status: APPROVED”
 *    refresca /me, fija tenant (defaultStoreId) y emite "auth:updated".
 *    Idempotente: usa flag interno para no duplicar listeners.
 *
 *    ⚠️ NOTA: el manejo de "role:changed" ya existe en attachAppListeners().
 *    Para evitar ráfagas y llamadas duplicadas a /me, aquí SOLO reaccionamos a
 *    "seller-app:status" === APPROVED. (El código queda fácil de reactivar si quieres).
 */
export function wireRoleChangeAutoTenant(s) {
  const sock = s || socket || getSocket();
  if (!sock || sock._roleChangeAutoTenantBound) return;

  const refreshMeAndTenant = async () => {
    try {
      // 👇 /me SIN tenant y SIN reintento de 401 para evitar loops
      const { data } = await api.get("/api/user/me", {
        withCredentials: true,
        omitTenantHeader: true,
        __noTenant: true,
        __noRetry401: true,
        params: { _ts: Date.now() },
        headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" },
      });
      const me = data?.data || data || {};
      if (me?.defaultStoreId) {
        setTenantId(me.defaultStoreId);
        // Notificar a la app: tenant + auth actualizado
        try {
          window.dispatchEvent(new CustomEvent("tenant:changed", { detail: { storeId: me.defaultStoreId } }));
        } catch { }
        try {
          window.dispatchEvent(new Event("auth:updated"));
        } catch { }
      }
    } catch (e) {
      // no-op
    }
  };

  // Cuando el admin aprueba la solicitud de vendedor, rehidrata identidad + tenant
  const onSellerStatus = async (payload) => {
    if (payload?.status !== "APPROVED") return;
    try {
      // 1) Pide /me y normaliza (si trae defaultStoreId lo fija como X-Store-Id)
      await hydrateMeAndNormalizeScope(); // ← también dispara tenant:changed internamente (según tu session.js)
      // 2) Notifica al AppProvider para que refresque el contexto (isAuthenticated, roles, etc.)
      await rehydrateViaProvider(); // ← emite auth:updated
    } catch (e) {
      // fallback: si algo falla, usa el refresco mínimo previo
      try {
        await refreshMeAndTenant();
      } catch { }
    }
  };

  // sock.on("role:changed", onRoleChanged); // lo maneja attachAppListeners()
  sock.on("seller-app:status", onSellerStatus);

  // Marca para evitar duplicados; guarda refs para limpieza
  sock._roleChangeAutoTenantBound = true;
  sock._roleChangeAutoTenantOff = () => {
    try {
      sock.off("seller-app:status", onSellerStatus);
    } catch { }
    sock._roleChangeAutoTenantBound = false;
    sock._roleChangeAutoTenantOff = null;
  };

  // HMR cleanup
  try {
    if (import.meta?.hot) {
      import.meta.hot.dispose(() => {
        try {
          sock._roleChangeAutoTenantOff?.();
        } catch { }
      });
    }
  } catch { }
}

// No autoconectar al importar; sólo preparamos el puente y listeners
try {
  attachAuthBridge();
} catch { }
try {
  attachAppListeners();
} catch { }

export default {
  getSocket,
  ensureConnected,
  updateSocketAuth,
  closeSocket,
  isSocketConnected,
  on,
  once,
  emit,
  replaceListener,
  attachAuthBridge,
  attachAppListeners,
  wireRoleChangeAutoTenant,
};
