// admin/src/main.jsx
import React, { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// WS: rehidrata y reconecta cuando cambie el token/tenant
import { updateSocketAuth } from "./utils/socket";

// 👇 Asegúrate de exportar AuthProvider desde hooks/useAuth
import { AuthProvider } from "./hooks/useAuth";

// Evita duplicar listeners en HMR (bandera en window)
const BOOT_FLAG = "__mtz_boot_ws__";

function safeGetToken() {
  try {
    return localStorage.getItem("accessToken") || "";
  } catch {
    return "";
  }
}

function bootWS() {
  // Si ya se bootstrapeó en esta sesión (HMR), primero limpia
  if (window[BOOT_FLAG]?.didBoot) {
    try {
      const prev = window[BOOT_FLAG];
      prev?.cleanup?.forEach((fn) => {
        try { fn?.(); } catch { /* noop */ }
      });
    } catch { /* noop */ }
  }

  const cleanup = [];

  // Handler único de re-autenticación del socket
  const reauth = () => {
    const tok = safeGetToken();
    updateSocketAuth(tok, { reconnect: true });
  };

  // 1) Arranque inicial: si hay token previo
  try {
    const t = safeGetToken();
    if (t) updateSocketAuth(t, { reconnect: true });
  } catch { /* noop */ }

  // 2) Re-conecta en cambios de sesión (login/logout/impersonate)
  window.addEventListener("auth:updated", reauth);
  cleanup.push(() => window.removeEventListener("auth:updated", reauth));

  // 3) Re-conecta en cambios de tenant (misma sesión)
  const onTenant = () => reauth();
  window.addEventListener("mtz:tenant-changed", onTenant);
  cleanup.push(() => window.removeEventListener("mtz:tenant-changed", onTenant));

  // 4) Al volver a la pestaña (evita sockets “dormidos”)
  const onVisible = () => {
    if (document.visibilityState === "visible") reauth();
  };
  document.addEventListener("visibilitychange", onVisible, { passive: true });
  cleanup.push(() => document.removeEventListener("visibilitychange", onVisible, { passive: true }));

  // 5) Cuando vuelve la conexión a Internet
  window.addEventListener("online", reauth, { passive: true });
  cleanup.push(() => window.removeEventListener("online", reauth, { passive: true }));

  // 6) Limpieza en HMR
  if (import.meta && import.meta.hot) {
    import.meta.hot.dispose(() => {
      cleanup.forEach((fn) => {
        try { fn?.(); } catch { /* noop */ }
      });
    });
  }

  // Guarda bandera para evitar duplicados en HMR
  window[BOOT_FLAG] = { didBoot: true, cleanup };
}

bootWS();

/** Fuerza tema claro y evita que el SO lo cambie a oscuro */
function Boot() {
  useEffect(() => {
    const root = document.documentElement;
    // elimina forzado la clase 'dark' y fija un atributo de tema claro
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
    // ignora cambios del SO a oscuro
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    const keepLight = () => root.classList.remove("dark");
    mql?.addEventListener?.("change", keepLight);
    return () => mql?.removeEventListener?.("change", keepLight);
  }, []);
  return <App />;
}

// Render seguro
const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("No se encontró #root para montar la app.");
}

createRoot(rootEl).render(
  <StrictMode>
    {/* Mantén el AuthProvider para que useAuth funcione en toda la app */}
    <AuthProvider>
      <Boot />
    </AuthProvider>
  </StrictMode>
);
