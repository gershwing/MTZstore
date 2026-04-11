// admin/src/context/AppContext.js
import React from "react";
import { hydrateMeAndNormalizeScope } from "../utils/session";
import { attachAppListeners } from "../utils/socket";
import { api } from "@/utils/api";
import { setTenantId, getTenantId } from "@/utils/tenant";

export const AppContext = React.createContext(null);

// Hook de conveniencia (úsalo en ProtectedRoute, Header, etc.)
export function useAuth() {
  return React.useContext(AppContext);
}

export default function AppProvider({ children }) {
  const [authReady, setAuthReady] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [permissions, setPermissions] = React.useState([]);

  // Shared UI state (consumed by category pages, Header, etc.)
  const [catData, setCatData] = React.useState([]);
  const [progress, setProgress] = React.useState(0);
  const [isOpenFullScreenPanel, setIsOpenFullScreenPanel] = React.useState({ open: false });

  // Flag para evitar el doble boot en StrictMode
  const didBoot = React.useRef(false);

  // Adjunta listeners globales de la app (socket) una sola vez
  React.useEffect(() => {
    try { attachAppListeners(); } catch { }
  }, []);

  // 3) Inicializar tenant desde /me al montar (y cuando cambie el auth)
  React.useEffect(() => {
    let gone = false;

    const init = async () => {
      try {
        // 0) Si ya hay tenant guardado (p.ej., usuario eligió tienda), no hagas nada
        if (getTenantId()) return;
        // 1) Si no hay tokens, evita golpear /me (previene loops en logout)
        const at = localStorage.getItem("accessToken") || "";
        const rt = localStorage.getItem("refreshToken") || "";
        if (!at && !rt) return;

        // 2) /me SIN tenant y SIN reintento de 401 (clave para evitar loops)
        const { data } = await api.get("/api/user/me", {
          withCredentials: true,
          omitTenantHeader: true,
          __noTenant: true,
          __noRetry401: true,
          params: { _ts: Date.now() },
          headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" },
        });
        const me = data?.data || data || {};
        if (!gone && me?.defaultStoreId) setTenantId(me.defaultStoreId);
      } catch {
        // no-op
      }
    };

    // correr una vez al montar
    init();

    // reintentar cada vez que se emita "auth:updated"
    const onAuthUpd = () => { init(); };
    try { window.addEventListener("auth:updated", onAuthUpd); } catch { }

    return () => {
      gone = true;
      try { window.removeEventListener("auth:updated", onAuthUpd); } catch { }
    };
  }, []);

  // Función centralizada de rehidratación (útil para eventos)
  const rehydrate = React.useCallback(async () => {
    // Guard: si no hay tokens, no golpear /me (previene loops tras 401→clearSession→auth:updated)
    try {
      const at = localStorage.getItem("accessToken") || "";
      const rt = localStorage.getItem("refreshToken") || "";
      if (!at && !rt) {
        setIsAuthenticated(false);
        setUser(null);
        setPermissions([]);
        setAuthReady(true);
        return;
      }
    } catch { }

    setAuthReady(false); // Ponemos en falso mientras rehidratamos

    // ⛑️ Failsafe: si algo cuelga, no dejamos la UI atrapada
    const SAFETY_MS = 10000;
    const safety = setTimeout(() => {
      try {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } catch { }
      setIsAuthenticated(false);
      setUser(null);
      setPermissions([]);
      setAuthReady(true);
      console.warn("[Auth] Safety timer disparado: continuamos sin sesión.");
    }, SAFETY_MS);

    try {
      // 🟢 Pide /me de forma segura (esta función ya usa omitTenantHeader y __noRetry401)
      const { me } = await hydrateMeAndNormalizeScope();

      setUser(me || null);
      setIsAuthenticated(!!me);
      setPermissions(Array.isArray(me?.permissions) ? me.permissions : []);
    } catch (e) {
      // Manejo de errores de red o errores específicos del servidor (como 401/403)
      const status = e?.response?.status ?? e?.status ?? 0;
      if (status === 401 || status === 403) {
        // Limpiamos los tokens locales para forzar un re-login
        try {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        } catch { }
        setIsAuthenticated(false);
        setUser(null);
        setPermissions([]);
      }
    } finally {
      clearTimeout(safety);
      // 🔑 nunca dejes colgada la UI
      setAuthReady(true);
    }
  }, []); // Dependencias vacías para useCallback

  React.useEffect(() => {
    if (didBoot.current) return;
    didBoot.current = true;

    // Ejecuta la rehidratación inicial
    (async () => {
      await rehydrate();
    })();

    // 🔔 Rehidrata cuando cambien tokens/cookies (auth:updated viene de session.js)
    const onAuthUpdated = () => rehydrate();
    window.addEventListener("auth:updated", onAuthUpdated);

    // También si cambian tokens por otra pestaña (storage event)
    const onStorage = (e) => {
      if (e.key === "accessToken" || e.key === "refreshToken") rehydrate();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("auth:updated", onAuthUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, [rehydrate]);

  /* ==================== Flags derivadas (isSuper / canAccessAdmin) ==================== */
  function hasActiveMembership(u) {
    const list = Array.isArray(u?.memberships) ? u.memberships : [];
    return list.some((m) => String(m?.status || "").toLowerCase() === "active");
  }

  const me = user; // alias para coincidir con tu snippet
  const isSuper =
    !!me?.isSuper ||
    me?.role === "SUPER_ADMIN" ||
    me?.isPlatformSuperAdmin === true ||
    (Array.isArray(me?.roles) && me.roles.includes("SUPER_ADMIN"));

  const canAccessAdmin = !!isSuper || hasActiveMembership(me);

  const value = React.useMemo(
    () => ({
      authReady,
      isAuthenticated,
      user,
      permissions,
      isSuper,
      canAccessAdmin,
      // setters expuestos por si los necesitas
      setUser,
      setIsAuthenticated,
      setPermissions,
      // exponer rehydrate para forzar un chequeo de sesión manualmente si hace falta
      rehydrate,
      // Shared UI state
      catData, setCatData,
      progress, setProgress,
      isOpenFullScreenPanel, setIsOpenFullScreenPanel,
    }),
    [authReady, isAuthenticated, user, permissions, isSuper, canAccessAdmin, rehydrate,
     catData, progress, isOpenFullScreenPanel]
  );

  // Sin JSX para ser válido en .js
  return React.createElement(AppContext.Provider, { value }, children);
}
