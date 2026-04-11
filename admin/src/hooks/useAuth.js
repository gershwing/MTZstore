// admin/src/hooks/useAuth.js
import { useContext, useMemo, useEffect, useRef, useState, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import { api } from "../utils/api";
import { clearTenantId } from "../utils/tenant";

/* =========================================================
 * Hook LIGERO — default export (consume el contexto)
 *  - Calcula isSuper/canAccessAdmin si el Provider no los expone
 *  - Expone refreshMe como alias de rehydrate si no existe
 * =======================================================*/
export function useAuth() {
  const ctx = useContext(AppContext) || {};
  // alias "me" para compat
  const me = ctx.me ?? ctx.viewer ?? ctx.user ?? null;

  // helper local (evita traer lógica del provider si no existe)
  const hasActiveMembership = (u) => {
    const list = Array.isArray(u?.memberships) ? u.memberships : [];
    return list.some((m) => String(m?.status || "").toLowerCase() === "active");
  };

  // Derivar isSuper si no viene del contexto
  const isSuper = useMemo(() => {
    if (typeof ctx.isSuper === "boolean") return ctx.isSuper;
    return (
      !!me?.isSuper ||
      me?.role === "SUPER_ADMIN" ||
      me?.isPlatformSuperAdmin === true ||
      (Array.isArray(me?.roles) && me.roles.includes("SUPER_ADMIN"))
    );
  }, [ctx.isSuper, me]);

  // Derivar canAccessAdmin si no viene del contexto
  const canAccessAdmin = useMemo(() => {
    if (typeof ctx.canAccessAdmin === "boolean") return ctx.canAccessAdmin;
    return isSuper || hasActiveMembership(me);
  }, [ctx.canAccessAdmin, isSuper, me]);

  // refreshMe alias a rehydrate si no existe
  const refreshMe = ctx.refreshMe || ctx.rehydrate;

  // Exponemos todo el ctx para no romper usos existentes
  return {
    ...ctx,
    me,
    isSuper,
    canAccessAdmin,
    refreshMe,
  };
}
export default useAuth;

/* =========================================================
 * Helpers (robustos y tolerantes)
 * =======================================================*/
const getStoreId = () => {
  try { return localStorage.getItem("X-Store-Id") || ""; } catch { return ""; }
};
const buildAuthKey = (userLike) => {
  const uid = userLike?._id || userLike?.id || "anon";
  const tid = getStoreId();
  return `${uid}::${tid || "none"}`;
};

// Toma el usuario de varias formas de respuesta
function extractUser(payload) {
  const p = payload ?? {};
  return (
    p.user ||
    p.me ||
    p.viewer ||
    p.data?.user ||
    p.data?.me ||
    p.data?.viewer ||
    p.data ||
    null
  );
}

/* =========================================================
 * Provider-hook: rehidrata /me y resetea tenant si cambia userId
 * Provee: { authReady, me, viewer, user, isAuthenticated, authKey, rehydrate }
 * =======================================================*/
export function useAuthProvider() {
  const [authReady, setAuthReady] = useState(false);
  const [me, setMe] = useState(null);
  const lastUserIdRef = useRef(null);

  // 🔁 rehydrate según tu pauta
  const rehydrate = useCallback(async () => {
    setAuthReady(false);

    // ⛔️ Guard: si no hay tokens en LS, evita pegarle a /me
    try {
      const access = localStorage.getItem("accessToken") || "";
      const refresh = localStorage.getItem("refreshToken") || "";
      if (!access && !refresh) {
        setMe(null);
        lastUserIdRef.current = null;
        try { clearTenantId(); } catch { }
        try { window.dispatchEvent(new CustomEvent("tenant:changed", { detail: { storeId: null } })); } catch { }
        setAuthReady(true);
        return;
      }
    } catch { }

    try {
      const res = await api.get("/api/user/me", {
        params: { _ts: Date.now() }, // cache buster
        headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" },
        withCredentials: true,     // ⬅️ imprescindible para httpOnly (refresh)
        omitTenantHeader: true,    // ⬅️ NO enviar X-Store-Id a /me
        __noTenant: true,
      });

      const u = extractUser(res?.data);
      const next = (u && (u._id || u.id)) ? u : null;
      setMe(next);

      // Si cambió el userId → limpia tenant para evitar Sidebar/menus viejos
      const currentId = String(next?._id || next?.id || "");
      if (lastUserIdRef.current && currentId && lastUserIdRef.current !== currentId) {
        try { clearTenantId(); } catch { }
        try { window.dispatchEvent(new CustomEvent("tenant:changed", { detail: { storeId: null } })); } catch { }
      }
      lastUserIdRef.current = currentId || null;
    } catch {
      setMe(null);
      lastUserIdRef.current = null;
      // No borramos tokens aquí; solo limpiamos scope de tenant para evitar “estado viejo”
      try { clearTenantId(); } catch { }
      try { window.dispatchEvent(new CustomEvent("tenant:changed", { detail: { storeId: null } })); } catch { }
    } finally {
      setAuthReady(true); // ⬅️ marcar listo SOLO al final
    }
  }, []);

  // Primera carga
  useEffect(() => { rehydrate(); }, [rehydrate]);

  // Reaccionar a cambios de sesión
  useEffect(() => {
    const off = () => rehydrate();
    if (typeof window !== "undefined" && window.addEventListener) {
      window.addEventListener("auth:updated", off);
    }
    return () => {
      if (typeof window !== "undefined" && window.removeEventListener) {
        window.removeEventListener("auth:updated", off);
      }
    };
  }, [rehydrate]);

  // Cambios de tokens en otras pestañas/ventanas + cambio de tenant
  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      // Tokens o tenant cambiaron en otra pestaña → rehidratar
      if (e.key === "accessToken" || e.key === "refreshToken" || e.key === "X-Store-Id") {
        rehydrate();
      }
    };
    if (typeof window !== "undefined" && window.addEventListener) {
      window.addEventListener("storage", onStorage);
    }
    return () => {
      if (typeof window !== "undefined" && window.removeEventListener) {
        window.removeEventListener("storage", onStorage);
      }
    };
  }, [rehydrate]);

  // 🔑 Clave de identidad (usuario::tenant) — memoizada
  const authKey = useMemo(() => buildAuthKey(me), [me]);

  // 👉 Autenticación SOLO desde /me (sin fallback a tokens en LS)
  const isAuthenticated = !!(me && (me._id || me.id));

  return {
    authReady,
    me,                 // alias 1
    viewer: me,         // alias 2 (compat)
    user: me,           // alias 3 (compat)
    isAuthenticated,
    authKey,
    // Exponer rehydrate para forzar chequeo manual si hace falta
    rehydrate,
    refreshMe: rehydrate,
  };
}

/* =========================================================
 * Hook consumidor AVANZADO (mantiene campos/ayudas extra)
 * =======================================================*/
export function useAuthFull() {
  const ctx = useContext(AppContext) || {};

  // Loading flags
  const authReady = Boolean(ctx?.authReady);
  const loading = Boolean(ctx?.authLoading ?? ctx?.loading ?? !authReady);

  // Usuario base desde el contexto (lo setea tu Provider con useAuthProvider)
  const rawUser = ctx?.user || ctx?.userData || ctx?.viewer || null;

  const rolesBase = Array.isArray(rawUser?.roles) ? rawUser.roles : [];
  const permsBase =
    Array.isArray(rawUser?.permissions)
      ? rawUser.permissions
      : Array.isArray(rawUser?.effectivePermissions)
        ? rawUser?.effectivePermissions
        : [];

  const isSuperRaw =
    rawUser?.role === "SUPER_ADMIN" ||
    rolesBase.includes("SUPER_ADMIN") ||
    Boolean(rawUser?.isPlatformSuperAdmin) ||
    Boolean(rawUser?.isSuper);

  const isSuper = Boolean(isSuperRaw || ctx?.isSuper);

  const roles = useMemo(
    () => (isSuper ? Array.from(new Set([...rolesBase, "SUPER_ADMIN"])) : rolesBase),
    [isSuper, rolesBase]
  );

  const effectivePerms = useMemo(
    () => (isSuper ? Array.from(new Set([...(permsBase || []), "*"])) : permsBase),
    [isSuper, permsBase]
  );

  const permissions = effectivePerms;

  // Tenant activo
  const activeStoreId =
    ctx?.viewer?.activeStoreId ||
    getStoreId() ||
    rawUser?.storeId ||
    "";

  const setActiveStoreId = (id) => {
    const val = id == null ? "" : String(id);
    if (val) {
      localStorage.setItem("X-Store-Id", val);
      if (typeof ctx?.setTenant === "function") ctx.setTenant(val);
    } else {
      try { clearTenantId(); } catch { }
      if (typeof ctx?.setTenant === "function") ctx.setTenant(null);
    }
    // Avisar a quien corresponda para rehidratar
    try { window.dispatchEvent(new CustomEvent("tenant:changed", { detail: { tenantId: val || null } })); } catch { }
  };

  // Helpers de permisos
  const hasRole = (role) => roles?.includes(role);
  const hasAnyRole = (arr = []) => arr.some(hasRole);
  const permsSet = useMemo(() => new Set(permissions || []), [permissions]);
  const hasStar = permsSet.has("*");
  const can = (p) => (p ? hasStar || permsSet.has(p) : false);

  const memberships = Array.isArray(rawUser?.memberships) ? rawUser.memberships : [];

  const me = useMemo(
    () => (rawUser ? { ...rawUser, roles, isSuper } : null),
    [rawUser, roles, isSuper]
  );

  const alertBox =
    ctx?.alertBox ||
    ctx?.notify ||
    ((type, msg) => {
      try {
        const k = String(type).toLowerCase();
        const fn = k === "error" ? "error" : (k === "warn" || k === "warning") ? "warn" : "log";
        console[fn](msg);
      } catch { }
    });

  const catData = ctx?.catData || ctx?.categories || [];
  const setIsOpenFullScreenPanel = ctx?.setIsOpenFullScreenPanel;
  const tenantId = ctx?.tenant || activeStoreId;

  /* --------- authKey: depende de usuario y X-Store-Id --------- */
  const [authKey, setAuthKey] = useState(() => buildAuthKey(rawUser));

  // Recalcula al cambiar usuario del contexto
  useEffect(() => {
    setAuthKey(buildAuthKey(rawUser));
  }, [rawUser]);

  // Reacciona a eventos globales (login/logout/tenant/storage) → sólo recalcula authKey
  useEffect(() => {
    const recompute = () => setAuthKey(buildAuthKey(rawUser));
    const onStorage = (e) => {
      if (!e) return;
      if (e.key === "accessToken" || e.key === "refreshToken" || e.key === "X-Store-Id") {
        recompute();
      }
    };
    if (typeof window !== "undefined" && window.addEventListener) {
      window.addEventListener("auth:updated", recompute);
      window.addEventListener("tenant:changed", recompute);
      window.addEventListener("storage", onStorage);
    }
    return () => {
      if (typeof window !== "undefined" && window.removeEventListener) {
        window.removeEventListener("auth:updated", recompute);
        window.removeEventListener("tenant:changed", recompute);
        window.removeEventListener("storage", onStorage);
      }
    };
  }, [rawUser]);

  return {
    // Auth
    authReady,
    loading,
    me,
    viewer: me,                 // alias compat
    user: rawUser,
    isAuthenticated: !!(rawUser?._id || rawUser?.id), // deriva SOLO de me/viewer
    authKey,                    // 👈 clave para remount controlado (AppLayout)

    // Roles/Permisos
    roles,
    memberships,
    permissions,
    effectivePerms,
    isSuper,
    isPlatformSuperAdmin: Boolean(rawUser?.isPlatformSuperAdmin),
    hasRole,
    hasAnyRole,
    can,

    // Tenant
    activeStoreId,
    setActiveStoreId,
    tenantId,

    // UI & Catálogos expuestos por contexto
    alertBox,
    catData,
    setIsOpenFullScreenPanel,
  };
}

/* =========================================================
 * Re-exporta el provider real con el nombre esperado por la app
 * =======================================================*/
// ⚠️ Importante: tu provider real (AppProvider) debe ser el default export de ../context/AppContext
export { default as AuthProvider } from "../context/AppContext";
