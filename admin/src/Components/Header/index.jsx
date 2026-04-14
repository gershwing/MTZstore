// admin/src/Components/Header/index.jsx
import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import Button from "@mui/material/Button";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";

import { RiMenu2Line } from "react-icons/ri";
import { FaRegBell } from "react-icons/fa";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { FaRegUser } from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, fetchDataFromApi } from "@/utils/api";

// UI + Auth
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../hooks/useAuth";

// Helpers de sesión / socket
import { clearSessionTokens } from "@/utils/session";
import { closeSocket, updateSocketAuth } from "@/utils/socket";

// Selector de tienda
import StorePicker from "../../Components/StorePicker";

// AppContext
import { AppContext } from "../../context/AppContext";

// ✅ Hook de LOGO GLOBAL (plataforma)
import { usePlatformLogo as useLogo } from "@/hooks/useLogo";
// ✅ Cache centralizada del logo (no pisar con falsy)
import { getLocalLogo, setLocalLogo } from "@/utils/logoCache";

// === helpers de roles opcionales ===
const STORE_SCOPED_ROLES = new Set(["STORE_OWNER", "INVENTORY_MANAGER", "ORDER_MANAGER", "DELIVERY_AGENT"]);
const NON_STORE_ROLES = new Set(["FINANCE_MANAGER", "SUPPORT_AGENT"]);

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": { right: -3, top: 13, border: `2px solid ${theme.palette.background.paper}`, padding: "0 4px" },
}));

const resolvePanelRoute = (raw) => {
  const s = String(raw || "").trim().toLowerCase();
  if (["add product", "agregar producto"].includes(s)) return "/products/new";
  if (["edit product", "editar producto"].includes(s)) return "/products";
  if (["add ram", "agregar ram", "ram"].includes(s)) return "/product/addRams";
  if (["add weight", "agregar weight", "peso"].includes(s)) return "/product/addWeight";
  if (["add size", "agregar size", "talla"].includes(s)) return "/product/addSize";
  if (["add home slide", "agregar slide principal"].includes(s)) return "/marketing/slider/new";
  if (["edit homeslide", "editar slide principal"].includes(s)) return "/marketing/slider";
  if (["add category", "agregar categoría", "add new category"].includes(s)) return "/catalog/categories/new";
  if (["edit category", "editar categoría"].includes(s)) return "/catalog/categories";
  if (["add sub category", "add new sub category", "agregar subcategoría"].includes(s)) return "/catalog/subcategories/new";
  if (["add address", "agregar dirección", "add new address"].includes(s)) return "/address/new";
  if (["add bannerv1", "agregar bannerv1", "add home banner list 1"].includes(s)) return "/marketing/banners/v1/new";
  if (["edit bannerv1", "editar bannerv1"].includes(s)) return "/marketing/banners/v1";
  if (["add bannerlist2", "agregar bannerlist2", "add home banner list2"].includes(s)) return "/marketing/banners/v2/new";
  if (["edit bannerlist2", "editar bannerlist2"].includes(s)) return "/marketing/banners/v2";
  if (["add blog", "agregar blog"].includes(s)) return "/blog/new";
  if (["edit blog", "editar blog"].includes(s)) return "/blog";
  if (["manage logo", "logo", "edit logo"].includes(s)) return "/logo/manage";
  return null;
};

// ❗ Áreas que exigen tenant (QUITAMOS "/logo" porque es neutral)
const STORE_TENANT_AREAS = [
  "/dashboard", "/products", "/product", "/marketing", "/catalog", "/address", "/orders", "/payments",
  "/bannerV1", "/bannerlist2", "/blog", /* "/logo", */ "/inventory", "/reports", "/promotions", "/support",
  "/users", "/stores", "/audit", "/security",
];

// ✅ Rutas neutrales (NO exigir tenant)
const NEUTRAL_PATHS = new Set([
  "/logo", "/logo/manage",
]);

const DELIVERY_AREAS = ["/delivery", "/my-deliveries", "/admin/apply-delivery", "/apply-delivery"];
const startsWithAny = (pathname, prefixes) => prefixes.some((p) => pathname === p || pathname.startsWith(p));
const isNeutralPath = (pathname) => Array.from(NEUTRAL_PATHS).some((p) => pathname === p || pathname.startsWith(p));

const Header = () => {
  const [anchorMyAcc, setAnchorMyAcc] = useState(null);
  const openMyAcc = Boolean(anchorMyAcc);

  const navigate = useNavigate();
  const location = useLocation();

  const ui = useUI();
  const {
    isSidebarOpen = true,
    setisSidebarOpen = () => { },
    windowWidth = (typeof window !== "undefined" ? window.innerWidth : 1200),
    viewer: uiViewer = { activeStoreId: null },
    setCatData = () => { },
  } = ui || {};

  const appCtx = useContext(AppContext) || {};

  const {
    me: _me, viewer: _viewer, user: _user,
    isAuthenticated = false, authReady = true, refreshMe, isSuper,
  } = useAuth() || {};
  const me = _me || _viewer || _user || null;
  const authViewer = _viewer || null;

  const roles = useMemo(() => (Array.isArray(me?.roles) ? me.roles.map(String) : []), [me]);
  const hasStoreScopedRole = roles.some((r) => STORE_SCOPED_ROLES.has(r));
  const hasNonStoreStaffRole = roles.some((r) => NON_STORE_ROLES.has(r));
  const isStoreApplicant = roles.includes("STORE_APPLICANT");
  const isDeliveryApplicant = roles.includes("DELIVERY_APPLICANT");
  const isCourier = roles.includes("DELIVERY");

  const activeStoreId =
    authViewer?.activeStoreId ?? me?.activeStoreId ?? uiViewer?.activeStoreId ?? null;
  const hasTenant = Boolean(activeStoreId);

  const displayEmail = me?.email || me?.profile?.email || me?.user?.email || "";
  const displayName = me?.name || me?.displayName || (displayEmail ? displayEmail.split("@")[0] : "Mi cuenta");
  const displayAvatar = me?.avatar || me?.picture || me?.photoURL || me?.avatarUrl || "";

  // ============== LOGO GLOBAL: hook + cache (central) + eventos ==============
  const hookLogoUrl = useLogo(); // platform
  const [logoSrc, setLogoSrc] = useState(getLocalLogo());
  const [imgBroken, setImgBroken] = useState(false);
  const placeholder = "/logo-placeholder.svg";
  const finalLogo = !imgBroken && logoSrc ? logoSrc : placeholder;

  // Sincroniza hook → state → cache (platform + compat) sin pisar falsy
  useEffect(() => {
    if (hookLogoUrl && typeof hookLogoUrl === "string") {
      setImgBroken(false);
      setLogoSrc(hookLogoUrl);
      const current = getLocalLogo();
      if (current !== hookLogoUrl) {
        setLocalLogo(hookLogoUrl); // solo si cambió
      }
    }
  }, [hookLogoUrl]);

  // Reaccionar a cambios en otra pestaña (logo global) — ignorar valores falsy
  useEffect(() => {
    const onStorage = (e) => {
      if (e?.key === "logo:platform" || e?.key === "logo") {
        const v = e?.newValue || "";
        if (v) {
          setImgBroken(false);
          setLogoSrc(String(v));
        }
      }
    };
    try { window.addEventListener("storage", onStorage); } catch { }
    return () => { try { window.removeEventListener("storage", onStorage); } catch { } };
  }, []);

  // ✅ Evento explícito cuando se actualiza el logo desde ManageLogo — ignorar eventos de tienda
  useEffect(() => {
    const onLogoUpdated = (ev) => {
      const { url, logo, storeId, scope } = ev?.detail || {};
      if (storeId || scope === "store") return; // filtro: header solo escucha global
      const next = url || logo || getLocalLogo();
      if (next && typeof next === "string") {
        setImgBroken(false);
        setLogoSrc(next);
      }
    };
    try { window.addEventListener("logo:updated", onLogoUpdated); } catch { }
    return () => { try { window.removeEventListener("logo:updated", onLogoUpdated); } catch { } };
  }, []);

  // Carga categorías globales una sola vez
  const didFetchGlobals = useRef(false);
  useEffect(() => {
    if (didFetchGlobals.current) return;
    didFetchGlobals.current = true;
    fetchDataFromApi("/api/category")
      .then((res) => {
        const list = Array.isArray(res?.category) ? res.category : (res?.data || []);
        setCatData(list);
      })
      .catch(() => { });
  }, [setCatData]);

  // 🔁 Reaccionar a auth:updated (sin tocar tenant) + refrescar logo desde cache
  const [, setTick] = useState(0);
  useEffect(() => {
    const onAuthUpdated = () => {
      try { refreshMe?.(); } catch { }
      try {
        const at = localStorage.getItem("accessToken") || "";
        updateSocketAuth?.(at, { reconnect: true });
      } catch { }
      setTick((t) => t + 1);
      // Revalida logo desde cache local (no pisar con falsy)
      const cached = getLocalLogo();
      if (cached) {
        setImgBroken(false);
        setLogoSrc(cached);
      }
    };
    window.addEventListener("auth:updated", onAuthUpdated);
    return () => window.removeEventListener("auth:updated", onAuthUpdated);
  }, [refreshMe]);

  // Guard de navegación según rol/tenant (respeta rutas neutrales)
  useEffect(() => {
    if (!authReady || isSuper) return;
    const path = location.pathname;
    if (isNeutralPath(path)) return; // ✅ no exigir tenant en rutas neutrales

    if (hasNonStoreStaffRole && !hasStoreScopedRole) {
      if (startsWithAny(path, STORE_TENANT_AREAS)) {
        const fallback =
          (roles.includes("SUPPORT_AGENT") && "/support") ||
          (roles.includes("FINANCE_MANAGER") && "/reports") ||
          "/dashboard";
        if (path !== fallback) navigate(fallback, { replace: true });
      }
      return;
    }

    if (hasStoreScopedRole && !hasTenant && startsWithAny(path, STORE_TENANT_AREAS)) {
      if (isStoreApplicant) {
        if (path !== "/admin/sell") navigate("/admin/sell", { replace: true });
        return;
      }
      if ((isDeliveryApplicant || isCourier) && startsWithAny(path, DELIVERY_AREAS)) return;
      if (isCourier && !startsWithAny(path, DELIVERY_AREAS)) {
        navigate("/delivery", { replace: true });
        return;
      }
      navigate("/admin/store/select", { replace: true });
    }
  }, [
    authReady, isSuper, hasTenant, hasStoreScopedRole, hasNonStoreStaffRole,
    isStoreApplicant, isDeliveryApplicant, isCourier, roles, location.pathname, navigate,
  ]);

  const handleClickMyAcc = (event) => setAnchorMyAcc(event.currentTarget);
  const handleCloseMyAcc = () => setAnchorMyAcc(null);

  // === Logout central === (preserva el logo con snapshot defensivo)
  async function onLogout() {
    setAnchorMyAcc(null);

    // snapshot defensivo del logo antes de cualquier limpieza externa
    let logoSnapshot = "";
    try { logoSnapshot = getLocalLogo() || ""; } catch { }

    try {
      await api.post("/api/user/logout", {}, { withCredentials: true });
    } catch (e) {
      console.warn("logout api error (ignorable):", e?.message || e);
    }

    try { clearSessionTokens(); } catch { }
    try { closeSocket(); } catch { }

    // doble protección: regrabar el logo si existía
    try { if (logoSnapshot) setLocalLogo(logoSnapshot); } catch { }

    await Promise.resolve();

    try { navigate("/login", { replace: true }); } catch { }

    setTimeout(() => {
      if (window?.location?.pathname !== "/login") {
        try { window.location.replace("/login"); } catch { }
      }
    }, 50);
  }

  const isMobile = (windowWidth ?? 1200) < 992;

  return (
    <>
      <header className="w-full h-14 px-5 shadow-md bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-[60]">
        <div className="part1 flex items-center gap-4">
          {isSidebarOpen === false && windowWidth > 992 && (
            <Link to="/">
              <img
                src={finalLogo}
                onError={() => setImgBroken(true)}
                className="w-[160px] md:w-[190px] max-h-[48px] object-contain"
                alt="Logo"
              />
            </Link>
          )}
          <Button
            className="!w-[40px] !h-[40px] !rounded-full !min-w-[40px] !text-[rgba(0,0,0,0.8)]"
            onClick={() => setisSidebarOpen(!isSidebarOpen)}
            title="Menú"
          >
            <RiMenu2Line className="text-[18px] text-[rgba(0,0,0,0.8)]" />
          </Button>
        </div>

        <div className="flex-1 flex justify-center px-3">
          <div className="w-full max-w-xl flex items-center justify-center gap-3">
            {authReady && !isSuper && hasStoreScopedRole && hasTenant && <StorePicker />}
          </div>
        </div>

        <div className="part2 flex items-center justify-end gap-5">
          <div className="hidden md:flex flex-col items-end leading-tight">
            <span className="text-[13px] font-medium text-gray-800" title={displayName}>{displayName}</span>
            <span className="text-[12px] text-gray-500 max-w-[220px] truncate" title={displayEmail}>
              {displayEmail || "—"}
            </span>
          </div>

          <IconButton aria-label="notifications" title="Notificaciones">
            <StyledBadge badgeContent={4} color="secondary">
              <FaRegBell />
            </StyledBadge>
          </IconButton>

          {isAuthenticated ? (
            <div className="relative">
              <div
                className="rounded-full w-[35px] h-[35px] overflow-hidden cursor-pointer border"
                onClick={handleClickMyAcc}
                title={displayEmail || "Mi cuenta"}
              >
                {displayAvatar ? (
                  <img src={displayAvatar} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <img src="/user.jpg" className="w-full h-full object-cover" alt="Avatar" />
                )}
              </div>

              <Menu
                anchorEl={anchorMyAcc}
                id="account-menu"
                open={openMyAcc}
                onClose={handleCloseMyAcc}
                onClick={handleCloseMyAcc}
                slotProps={{
                  paper: {
                    elevation: 0,
                    sx: {
                      overflow: "visible",
                      filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                      mt: 1.5,
                      "& .MuiAvatar-root": { width: 32, height: 32, ml: -0.5, mr: 1 },
                      "&::before": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: "background.paper",
                        transform: "translateY(-50%) rotate(45deg)",
                        zIndex: 0,
                      },
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem onClick={handleCloseMyAcc} className="!bg-white">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full w-[35px] h-[35px] overflow-hidden border">
                      {displayAvatar ? (
                        <img src={displayAvatar} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Avatar" />
                      ) : (
                        <img src="/user.jpg" className="w-full h-full object-cover" alt="Avatar" />
                      )}
                    </div>
                    <div className="info">
                      <h3 className="text-[15px] font-[500] leading-5">{displayName}</h3>
                      <p className="text-[12px] font-[400] opacity-70">{displayEmail || "—"}</p>
                    </div>
                  </div>
                </MenuItem>
                <Divider />

                <Link to="/profile">
                  <MenuItem onClick={handleCloseMyAcc} className="flex items-center gap-3">
                    <FaRegUser className="text-[16px]" />
                    <span className="text-[14px]">Mi Perfil</span>
                  </MenuItem>
                </Link>

                <MenuItem onClick={onLogout} className="flex items-center gap-3">
                  <IoMdLogOut className="text-[18px]" />
                  <span className="text-[14px]">Cerrar Sesión</span>
                </MenuItem>
              </Menu>
            </div>
          ) : (
            <Link to="/login">
              <Button className="btn-blue btn-sm !rounded-full">Sign In</Button>
            </Link>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
