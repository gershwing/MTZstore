// admin/src/components/Guards/RequireTenant.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getTenantId, setTenantId } from "../../utils/tenant";
import { api } from "../../utils/api";

// Rutas que NO requieren tienda (onboarding, aplicaciones, etc.)
let SAFE_PREFIXES = [
  "/admin/applications",
  "/applications",
  "/admin/sell",
  "/admin/apply-delivery",
  "/admin/get-started",
  "/admin/select-store",
  "/admin/store/select",
  "/admin/my-store",
  "/admin/logo/manage",
];

// ✅ Rutas neutrales (branding / plataforma) — NO exigir tenant
const NEUTRAL_PATHS = new Set([
  "/logo",
  "/logo/manage",
]);

// ✅ Rutas de administración GLOBAL (no dependen de tienda)
let ADMIN_GLOBAL_PREFIXES = [
  "/admin/users",
  "/admin/stores",
  "/admin/audit",
  "/admin/security/permissions",
  "/admin/permissions",
  "/admin/seller-applications/admin",
  "/admin/delivery-applications/admin",
];

// Carga opcional y tolerante de listas desde el menú (Vite/ESM-friendly)
(async () => {
  try {
    const mod = await import("../Sidebar/menu.config");
    const { SAFE_PREFIXES: BASE_SAFE_PREFIXES, ADMIN_GLOBAL_PREFIXES: BASE_ADMIN_GLOBAL } = mod || {};
    if (Array.isArray(BASE_SAFE_PREFIXES)) {
      SAFE_PREFIXES = Array.from(new Set([...BASE_SAFE_PREFIXES, ...SAFE_PREFIXES]));
    }
    if (Array.isArray(BASE_ADMIN_GLOBAL)) {
      ADMIN_GLOBAL_PREFIXES = Array.from(new Set([...BASE_ADMIN_GLOBAL, ...ADMIN_GLOBAL_PREFIXES]));
    }
  } catch {
    // noop
  }
})();

const normalizeId = (v) => (v == null ? null : String(v).trim() || null);

export default function RequireTenant({ children }) {
  const loc = useLocation();

  // ===== Auth state
  const { authReady, isAuthenticated, viewer: me } =
    (typeof useAuth === "function" ? useAuth() : {}) || {};

  // Mientras no esté listo el estado de auth, no decidas
  if (!authReady) {
    return null;
  }

  // ✅ Cuando YA sabemos que no hay sesión → a /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }

  // ===== Roles y estado del usuario
  const roles = useMemo(() => (Array.isArray(me?.roles) ? me.roles : []), [me]);
  const isSuper =
    !!me?.isSuper ||
    !!me?.isPlatformSuperAdmin ||
    roles.includes("SUPER_ADMIN") ||
    String(me?.role || "").toUpperCase() === "SUPER_ADMIN";

  // Staff global opcional (si lo usas para ver admin sin tienda)
  const GLOBAL_STAFF = new Set([
    "SUPER_ADMIN",
    "PLATFORM_ADMIN",
  ]);
  const isGlobalStaff = roles.some((r) => GLOBAL_STAFF.has(String(r || "").toUpperCase()));

  // ⬇️ Hacer reactivo el tenant
  const [tenant, setTenant] = useState(getTenantId());
  useEffect(() => {
    const onTenantChanged = () => {
      try { setTenant(getTenantId()); } catch { }
    };
    try {
      window.addEventListener("tenant:changed", onTenantChanged);
      window.addEventListener("mtz:tenant-changed", onTenantChanged);
      window.addEventListener("auth:updated", onTenantChanged); // compat
    } catch { }
    return () => {
      try {
        window.removeEventListener("tenant:changed", onTenantChanged);
        window.removeEventListener("mtz:tenant-changed", onTenantChanged);
        window.removeEventListener("auth:updated", onTenantChanged);
      } catch { }
    };
  }, []);

  const NON_STORE_ROLES = new Set([
    "INVENTORY_MANAGER",
    "ORDER_MANAGER",
    "DELIVERY_AGENT",
    "FINANCE_MANAGER",
    "SUPPORT_AGENT",
  ]);

  const hasStoreOwner = roles.includes("STORE_OWNER");
  const hasDeliveryRole = roles.includes("DELIVERY_AGENT");
  const hasNonStoreStaff = roles.some((r) => NON_STORE_ROLES.has(r));

  const isSafe =
    Array.isArray(SAFE_PREFIXES) && SAFE_PREFIXES.some((p) => loc.pathname.startsWith(p));

  // ✅ Neutral absoluto (equivalente a tu diff en Header)
  const isNeutral =
    NEUTRAL_PATHS.has(loc.pathname) ||
    [...NEUTRAL_PATHS].some((p) => loc.pathname === p || loc.pathname.startsWith(p + "/"));

  // ✅ ¿Es ruta global de administración?
  const isAdminGlobalPath =
    Array.isArray(ADMIN_GLOBAL_PREFIXES) &&
    ADMIN_GLOBAL_PREFIXES.some((p) => loc.pathname.startsWith(p));

  const [decision, setDecision] = useState({ ready: false, to: null, allow: false });

  // ─────────────────────────────────────────────────────────────
  //  A U T O P I C K   D E F E N S I V O   D E   T E N A N T
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authReady || !isAuthenticated) return;
    if (getTenantId()) return; // ya hay tenant

    let alive = true;
    (async () => {
      try {
        const { data } = await api.get("/api/user/me", {
          withCredentials: true,
          omitTenantHeader: true,
          __noTenant: true,
          __noRetry401: false,
          params: { _ts: Date.now() },
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache", Accept: "application/json" },
          timeout: 12000,
        });

        if (!alive) return;
        const payload =
          data?.data?.user || data?.user || data?.data || data || {};

        const def = normalizeId(
          payload?.defaultStoreId ??
          data?.data?.defaultStoreId ??
          data?.defaultStoreId ??
          null
        );

        if (def && !getTenantId()) {
          setTenantId(def); // fija X-Store-Id (emite eventos internamente)
          try {
            window.dispatchEvent(new CustomEvent("tenant:changed", { detail: { storeId: def } }));
          } catch { }
        }
      } catch {
        // noop
      }
    })();
    return () => { alive = false; };
  }, [authReady, isAuthenticated]);

  // ─────────────────────────────────────────────────────────────
  //  D E C I S I Ó N   D E   N A V E G A C I Ó N
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authReady) return;

    const path = loc.pathname;

    // 0) Súper puede todo
    if (isSuper) {
      setDecision({ ready: true, to: null, allow: true });
      return;
    }

    // 0.b) Rutas neutrales siempre
    if (isNeutral) {
      setDecision({ ready: true, to: null, allow: true });
      return;
    }

    // 0.c) Rutas ADMIN GLOBAL: permitir si es staff global (o si prefieres, SOLO super)
    if (isAdminGlobalPath && (isGlobalStaff || isSuper)) {
      setDecision({ ready: true, to: null, allow: true });
      return;
    }

    // 1) Ya hay tenant → permitir
    if (tenant) {
      setDecision({ ready: true, to: null, allow: true });
      return;
    }

    // 2) Rutas seguras (onboarding/selectores)
    if (isSafe) {
      setDecision({ ready: true, to: null, allow: true });
      return;
    }

    // 3) CUSTOMER puro / sin roles → hub
    const onlyCustomer =
      roles.length === 0 ||
      (roles.length === 1 && roles[0] === "CUSTOMER") ||
      (!hasStoreOwner && !hasDeliveryRole && !hasNonStoreStaff);
    if (onlyCustomer) {
      setDecision({ ready: true, to: "/admin/applications", allow: false });
      return;
    }

    // 4) Staff operativo global (no requieren tienda fija) → permitir
    if (hasNonStoreStaff && !hasStoreOwner && !hasDeliveryRole) {
      setDecision({ ready: true, to: null, allow: true });
      return;
    }

    // 5) Delivery sin tienda → a su formulario
    if (hasDeliveryRole && !tenant) {
      setDecision({ ready: true, to: "/admin/apply-delivery", allow: false });
      return;
    }

    // 6) Último intento: memberships / selector
    let alive = true;
    (async () => {
      try {
        let memberships = Array.isArray(me?.memberships) ? me.memberships : undefined;

        if (!memberships) {
          const res = await api.get("/api/user/me", {
            params: { _ts: Date.now() },
            headers: { "Cache-Control": "no-cache", Pragma: "no-cache", Accept: "application/json" },
            withCredentials: true,
            omitTenantHeader: true,
            __noTenant: true,
            __noRetry401: false,
            timeout: 12000,
          });

          const full =
            res?.data?.data?.user ||
            res?.data?.user ||
            res?.data?.data ||
            res?.data ||
            {};

          const def = normalizeId(
            full?.defaultStoreId ??
            res?.data?.data?.defaultStoreId ??
            res?.data?.defaultStoreId ??
            null
          );
          if (def && !getTenantId()) {
            setTenantId(def);
            try { window.dispatchEvent(new CustomEvent("tenant:changed", { detail: { storeId: def } })); } catch { }
          }

          memberships = Array.isArray(full?.memberships) ? full.memberships : [];
        }

        const hasMemberships = Array.isArray(memberships) && memberships.length > 0;

        // 6a) Tiene membresías pero sin tenant → selector con retorno
        if (hasMemberships && !getTenantId()) {
          if (!alive) return;
          const redirectTo = `${loc.pathname}${loc.search || ""}`;
          setDecision({
            ready: true,
            to: `/admin/store/select?redirectTo=${encodeURIComponent(redirectTo)}`,
            allow: false,
          });
          return;
        }

        // 6b) Sin membresías → hub
        if (!hasMemberships) {
          if (!alive) return;
          setDecision({ ready: true, to: "/admin/applications", allow: false });
          return;
        }

        // 6c) Tiene membresías (y/o ya tiene tenant) → permitir
        if (!alive) return;
        setDecision({ ready: true, to: null, allow: true });
      } catch {
        if (!alive) return;
        setDecision({ ready: true, to: "/admin/applications", allow: false });
      }
    })();

    return () => { alive = false; };
  }, [
    authReady,
    isSuper,
    isNeutral,
    isSafe,
    isAdminGlobalPath,
    isGlobalStaff,
    tenant,
    roles,
    hasStoreOwner,
    hasDeliveryRole,
    hasNonStoreStaff,
    me,
    loc.pathname,
    loc.search,
  ]);

  // 🔒 Cortafuego de primer render
  if (!authReady || !decision.ready) return null;

  if (decision.allow) return children ?? <Outlet />;
  if (decision.to) return <Navigate to={decision.to} replace state={{ from: loc }} />;

  return children ?? <Outlet />;
}
