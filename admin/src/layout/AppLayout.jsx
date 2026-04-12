// admin/src/layout/AppLayout.jsx
import React, { useContext, useEffect, useMemo } from "react";
import { Outlet } from "react-router-dom";

// ⚠️ Asegúrate: carpeta "components" en minúscula
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";

// Estado de AUTH
import { useAuth } from "../hooks/useAuth";

// Estado de UI/Layout (sidebar, medidas, etc.)
import UIContext from "../context/UIContext";

// Tenant utils
import { getTenantId } from "../utils/tenant";

// Socket helper (singleton con .on() que devuelve off())
import { on } from "@/utils/socket";

export default function AppLayout() {
  // 🚦 Gate de autenticación: NO renderizar layout hasta que la sesión esté lista
  const authHook = (typeof useAuth === "function" ? useAuth() : {}) || {};
  const { authReady, viewer: me, authKey } = authHook;

  if (!authReady) return null; // Loader central vive en ProtectedRoute/App.jsx

  // === 🔑 Identidad (usuario/tenant) para claves internas ===
  const userId =
    me?._id ||
    me?.id ||
    me?.userId ||
    (me?.user && (me.user._id || me.user.id)) ||
    "anon";

  const tenantId = (typeof getTenantId === "function" ? getTenantId() : "") || "";

  // identityKey sigue útil para remontar piezas internas si cambia tenant/usuario
  const identityKey = `${userId}::${tenantId || "none"}`;

  // Estado de UI desde su contexto (con fallbacks defensivos)
  const ui = useContext(UIContext) || {};
  const winWidth =
    (typeof ui?.windowWidth === "number" && ui.windowWidth) ||
    (typeof window !== "undefined" ? window.innerWidth : 1200);

  const isMobile = winWidth < 992;

  // Anchos del sidebar (px)
  const SB_EXPANDED = 260;
  const SB_COLLAPSED = 72;

  const sidebarWidthPx = useMemo(() => {
    if (isMobile) return 0;
    return !!ui?.isSidebarOpen ? SB_EXPANDED : SB_COLLAPSED;
  }, [isMobile, ui?.isSidebarOpen, authReady]);

  const closeMobile = () =>
    (isMobile && ui?.isSidebarOpen) && (ui.setIsSidebarOpen ?? ui.setisSidebarOpen)?.(false);

  // 🔔 Listener global: si backend emite "role:changed", rehidrata /api/user/me
  useEffect(() => {
    const off = on?.("role:changed", () => {
      try { window.dispatchEvent(new CustomEvent("auth:updated")); } catch { }
    });
    return () => off?.();
  }, []);

  return (
    // ⬇⬇⬇ remount del layout entero cuando cambie authKey
    <div key={authKey} className="relative h-screen overflow-hidden flex flex-col bg-gray-50 text-gray-800">
      {/* Sidebar fijo (desktop) */}
      {!isMobile && (
        <aside
          className="fixed inset-y-0 left-0 shrink-0 border-r border-gray-200 bg-white z-40 transition-[width] duration-300"
          style={{ width: sidebarWidthPx }}
          aria-label="MTZ Sidebar"
        >
          {/* ⬇⬇⬇ remount por identidad/tenant */}
          <Sidebar key={`sb:${identityKey}`} collapsed={!ui?.isSidebarOpen} />
        </aside>
      )}

      {/* Drawer móvil */}
      {isMobile && ui?.isSidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={closeMobile} />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-[320px] bg-white shadow-xl">
            {/* ⬇⬇⬇ remount por identidad/tenant */}
            <Sidebar key={`sb:${identityKey}`} collapsed={false} onItemClick={closeMobile} />
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div
        className="flex-1 flex flex-col min-w-0 min-h-0 transition-[padding] duration-300"
        style={{ paddingLeft: isMobile ? 0 : sidebarWidthPx }}
      >
        {/* Header */}
        <div className="sticky top-0 z-50">
          {/* ⬇⬇⬇ remount por identidad/tenant */}
          <Header key={`hdr:${identityKey}`} />
        </div>

        {/* ⬇⬇⬇ remount del Outlet cuando cambie authKey */}
        <main className="flex-1 min-h-0 overflow-hidden relative" key={`out:${authKey}`}>
          <div className="h-full overflow-auto p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
