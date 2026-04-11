// admin/src/Components/Sidebar/index.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

// === Iconos (deben coincidir con los nombres usados en menu.config)
import { RxDashboard } from "react-icons/rx";
import { FiUsers } from "react-icons/fi";
import { TbBuildingStore, TbTruckDelivery, TbCreditCard, TbLifebuoy } from "react-icons/tb";
import { RiProductHuntLine } from "react-icons/ri";
import { IoBagCheckOutline } from "react-icons/io5";
import { SiBloglovin } from "react-icons/si";
import { IoLogoBuffer } from "react-icons/io";
import { MdQueryStats, MdPointOfSale, MdAssignment, MdRocketLaunch, MdBarChart, MdWarehouse, MdAccountBalance, MdLocalShipping } from "react-icons/md";
import { FaRegImage } from "react-icons/fa6";
import { TbDiscount } from "react-icons/tb";
import { IoMdLogOut } from "react-icons/io";
import { BiCategory } from "react-icons/bi";

import { AppContext } from "../../context/AppContext";
import { api } from "../../utils/api";
import usePermission from "../../hooks/usePermission";
import { useAuthFull as useAuth } from "../../hooks/useAuth";

// helpers de sesión
import { clearSessionTokens } from "../../utils/session";
// socket: cerramos completamente en logout
import { closeSocket } from "@/utils/socket";

// tenant activo para reconstruir menú cuando cambie
import { getTenantId } from "@/utils/tenant";

// === Builder de menú
import { buildSidebarMenuByRoles } from "./menu.config";

// 🔗 Hook de logo GLOBAL (plataforma)
import { usePlatformLogo as useLogo } from "@/hooks/useLogo";
// ✅ cache centralizado de logo
import { getLocalLogo, setLocalLogo } from "@/utils/logoCache";

const ICONS = {
  RxDashboard,
  FiUsers,
  TbBuildingStore,
  RiProductHuntLine,
  IoBagCheckOutline,
  TbTruckDelivery,
  TbCreditCard,
  SiBloglovin,
  IoLogoBuffer,
  MdQueryStats,
  FaRegImage,
  TbLifebuoy,
  TbDiscount,
  MdPointOfSale,
  MdAssignment,
  BiCategory,
  MdRocketLaunch,
  MdBarChart,
  MdWarehouse,
  MdAccountBalance,
  MdLocalShipping,
};

function pickIcon(iconKeyOrComp) {
  if (!iconKeyOrComp) return null;
  if (typeof iconKeyOrComp === "function" || (iconKeyOrComp && typeof iconKeyOrComp === "object")) {
    return iconKeyOrComp;
  }
  const Cmp = ICONS[String(iconKeyOrComp)] || null;
  if (!Cmp) {
    if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
      console.warn("[Sidebar] Icono no encontrado en ICONS:", iconKeyOrComp);
    }
    return null;
  }
  return Cmp;
}

/** ============================
 * Normaliza rutas para layout /admin con rutas hijas RELATIVAS.
 * ============================ */
function normalizeTo(to) {
  if (!to) return to;
  const s = String(to);
  if (/^https?:\/\//i.test(s) || /^[a-z]+:/i.test(s)) return s; // externos
  if (!s.startsWith("/")) return s;                              // relativo ya OK
  if (s === "/admin" || s === "/admin/") return ".";
  if (s.startsWith("/admin/")) return s.replace(/^\/admin\/?/, "") || ".";
  return s; // otros absolutos fuera del layout
}

const Item = ({ to, icon, children, onClick, collapsed, depth = 0 }) => {
  const Icon = pickIcon(icon);
  const leftPad = collapsed ? undefined : Math.min(16 + depth * 10, 28);

  if (!to) {
    return (
      <div
        className={`mt-3 mb-1 px-3 text-[11px] uppercase tracking-wide text-gray-500 ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}
        style={{ paddingLeft: leftPad }}
      >
        <span className="flex items-center gap-2">
          {Icon ? (
            <Icon size={14} className="shrink-0 text-gray-400" />
          ) : (
            !collapsed && <span className="shrink-0 inline-block w-1.5 h-1.5 rounded-full bg-gray-300" />
          )}
          {children}
        </span>
      </div>
    );
  }

  const normalizedTo = normalizeTo(to);

  return (
    <NavLink
      to={normalizedTo}
      onClick={onClick}
      title={collapsed ? String(children) : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition ${isActive ? "bg-blue-50 text-blue-700 border-r-4 border-blue-600" : "text-gray-700 hover:bg-gray-50"
        }`
      }
      style={{ paddingLeft: leftPad }}
    >
      {Icon ? (
        <Icon size={18} className="shrink-0" />
      ) : (
        !collapsed && <span className="shrink-0 inline-block w-1.5 h-1.5 rounded-full bg-gray-300" />
      )}
      <span
        className={`whitespace-nowrap transition-opacity duration-200 ${collapsed ? "opacity-0 pointer-events-none w-0 overflow-hidden" : "opacity-100"
          }`}
      >
        {children}
      </span>
    </NavLink>
  );
};

const RenderMenu = ({ items = [], onItemClick, collapsed, depth = 0 }) => (
  <>
    {items.map((it, idx) => {
      const hasChildren = Array.isArray(it.children) && it.children.length > 0;
      return (
        <React.Fragment key={`${it.label}-${it.to || idx}`}>
          <Item to={it.to} icon={it.icon} onClick={onItemClick} collapsed={collapsed} depth={depth}>
            {it.label}
          </Item>
          {hasChildren && (
            <div className="ml-0">
              <RenderMenu items={it.children} onItemClick={onItemClick} collapsed={collapsed} depth={depth + 1} />
            </div>
          )}
        </React.Fragment>
      );
    })}
  </>
);

const Sidebar = ({ onItemClick, collapsed = false }) => {
  const ctx = useContext(AppContext);
  const navigate = useNavigate();

  // (A) LOGO GLOBAL (plataforma): hook + cache + placeholder
  const platformLogo = useLogo(); // usePlatformLogo
  const [logoSrc, setLogoSrc] = useState(getLocalLogo());
  const [imgBroken, setImgBroken] = useState(false);

  // auth robusto (alias) — usa fallback me || viewer || user
  const { me: _me, viewer: _viewer, user: _user, loading, authReady } = useAuth() || {};
  const me = _me || _viewer || _user || null;
  const roles = useMemo(() => (Array.isArray(me?.roles) ? me.roles : []), [me]);
  const isSuper =
    !!me?.isSuper ||
    !!me?.isPlatformSuperAdmin ||
    roles.includes("SUPER_ADMIN") ||
    String(me?.role || "").toUpperCase() === "SUPER_ADMIN";

  // 🔁 re-render cuando cambia auth
  const [, setTick] = useState(0);
  useEffect(() => {
    const onAuthUpdated = () => setTick((t) => t + 1);
    window.addEventListener("auth:updated", onAuthUpdated);
    return () => window.removeEventListener("auth:updated", onAuthUpdated);
  }, []);

  // ✅ lee el valor actual del tenant (para reconstrucción de menú; NO afecta logo global)
  const tenantId = getTenantId();

  // (B) re-render cuando cambie el tenant vía evento global (solo para menú)
  const [bump, setBump] = useState(0);
  useEffect(() => {
    const onTenantChanged = () => setBump((n) => n + 1);
    try {
      window.addEventListener("tenant:changed", onTenantChanged);
    } catch { }
    return () => {
      try {
        window.removeEventListener("tenant:changed", onTenantChanged);
      } catch { }
    };
  }, []);

  // (C) reaccionar si cambian caches en otra pestaña
  useEffect(() => {
    const onStorage = (e) => {
      if (e?.key === "X-Store-Id") setBump((n) => n + 1); // reconstruye menú
      if (e?.key === "logo:platform" || e?.key === "logo") {
        const v = e?.newValue || "";
        if (v) {
          setImgBroken(false);
          setLogoSrc(String(v));
        }
      }
    };
    try {
      window.addEventListener("storage", onStorage);
    } catch { }
    return () => {
      try {
        window.removeEventListener("storage", onStorage);
      } catch { }
    };
  }, []);

  // (D) evento explícito cuando se actualiza el logo — IGNORA scope "store"
  useEffect(() => {
    const onLogoUpdated = (e) => {
      const { url, logo, storeId, scope } = e?.detail || {};
      if (storeId || scope === "store") return; // Sidebar es SOLO plataforma
      const next = url || logo || getLocalLogo();
      if (next && typeof next === "string") {
        setImgBroken(false);
        setLogoSrc(next);
      }
    };
    try {
      window.addEventListener("logo:updated", onLogoUpdated);
    } catch { }
    return () => {
      try {
        window.removeEventListener("logo:updated", onLogoUpdated);
      } catch { }
    };
  }, []);

  // (E) sincroniza hook (platform) → state → localStorage (compat) **sin pisar falsy**
  useEffect(() => {
    if (platformLogo && typeof platformLogo === "string") {
      setImgBroken(false);
      setLogoSrc(platformLogo);
      const current = getLocalLogo();
      if (current !== platformLogo) {
        setLocalLogo(platformLogo); // evita re-emitir logo:updated innecesariamente
      }
    }
  }, [platformLogo]);

  const perms = usePermission();

  // ======== MENÚ ========
  const menuItems = useMemo(() => {
    if (!authReady || !me) return [];

    const allow = (...rs) => (typeof perms?.can === "function" ? perms.can(...rs) : false);
    const base = buildSidebarMenuByRoles(me, allow) || [];

    return base;
  }, [authReady, me, perms, tenantId, bump, isSuper]);

  // ======== LOGOUT ========
  const logout = async () => {
    onItemClick?.();
    try {
      await api.post("/api/user/logout");
    } catch { }
    clearSessionTokens();
    try {
      localStorage.removeItem("X-Store-Id");
    } catch { }
    try {
      ctx?.setTenant?.(null);
    } catch { }
    try {
      window.dispatchEvent(new CustomEvent("tenant:changed", { detail: { storeId: null } }));
    } catch { }
    try {
      closeSocket();
    } catch { }
    try {
      if (logoSrc) setLocalLogo(logoSrc);
    } catch { }
    navigate("/login", { replace: true });
  };

  if (loading || !authReady) {
    return <div className="p-3 text-sm text-gray-500">Cargando menú…</div>;
  }

  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    console.debug(
      "[Sidebar] items:",
      menuItems.map((i) => ({ label: i.label, to: i.to || "(section)", children: i.children?.length || 0 }))
    );
  }

  const placeholder = "/logo-placeholder.svg";
  const finalLogo = !imgBroken && logoSrc ? logoSrc : placeholder;

  return (
    <div className="h-full w-full grid grid-rows-[auto_auto_1fr_auto]">
      {/* Logo (GLOBAL) */}
      <div className="py-3 w-full flex items-center gap-2 px-3">
        <div
          className="cursor-pointer flex items-center gap-3"
          onClick={() => {
            onItemClick?.();
            navigate("."); // dashboard relativo al layout /admin
          }}
        >
          {collapsed ? (
            <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center font-bold text-blue-600">M</div>
          ) : (
            <img
              src={finalLogo}
              onError={() => setImgBroken(true)}
              className="w-[160px] md:min-w-[180px] max-h-[48px] object-contain"
              alt="Logo"
            />
          )}
        </div>
      </div>

      {/* Título */}
      <div className="h-10 border-y flex items-center px-3 font-semibold">
        <span className={`${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
          MTZ <span className="text-blue-600 ml-1">Admin</span>
        </span>
      </div>

      {/* Menú con scroll */}
      <nav className="mt-3 pr-1 flex flex-col gap-1 overflow-y-auto">
        <RenderMenu items={menuItems} onItemClick={onItemClick} collapsed={collapsed} />
      </nav>

      {/* Footer */}
      <div className="p-3 text-xs text-gray-400 border-t mt-2 flex items-center justify-between">
        {!collapsed && <span>v1 · MTZgroup</span>}
        <Button
          className={`!normal-case !text-gray-600 !text-xs !px-2 !py-1 hover:!bg-gray-100 flex items-center gap-2 ${collapsed ? "mx-auto" : ""}`}
          onClick={logout}
          title="Cerrar sesión"
        >
          <IoMdLogOut className="text-[16px]" />
          {!collapsed && "Cerrar sesión"}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
