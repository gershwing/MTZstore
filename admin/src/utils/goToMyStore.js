// admin/src/utils/goToMyStore.js
import { api } from "./api";
import { getSocket } from "./socket";
import { setCurrentStoreId, clearTenantId } from "./tenant";

/**
 * Decide el destino y fija X-Store-Id cuando corresponda.
 * - 1 tienda  → activa tenant y va a /dashboard
 * - >1 tiendas → /admin/store/select
 * - 0 tiendas → /admin/applications
 */
export async function goToMyStore(navigate, ctx) {
  try {
    // 🚫 Guard: no llames /me si no hay tokens en LS
    const access = (() => { try { return localStorage.getItem("accessToken") || ""; } catch { return ""; } })();
    const refresh = (() => { try { return localStorage.getItem("refreshToken") || ""; } catch { return ""; } })();
    if (!access && !refresh) {
      clearTenantId();
      navigate("/login", { replace: true });
      return;
    }

    const res = await api.get("/api/user/me", {
      params: { _ts: Date.now() },                // cache buster
      headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" },
      withCredentials: true,                      // para cookie httpOnly (refresh)
      omitTenantHeader: true,                     // NO enviar X-Store-Id a /me
      __noTenant: true,                           // explícito para el interceptor
      __noRetry401: true,                         // evita refresh loop (post-logout)
    });

    const me = res?.data?.data ?? res?.data ?? {};
    const memberships = Array.isArray(me?.memberships) ? me.memberships : [];

    // Super admin: sin tenant
    if (me?.isSuper) {
      clearTenantId();
      if (ctx?.reloadViewer) { try { await ctx.reloadViewer(); } catch { } }
      navigate("/dashboard", { replace: true });
      return;
    }

    if (memberships.length === 1) {
      const sid =
        memberships[0]?.storeId ||
        memberships[0]?.store?._id ||
        memberships[0]?.store ||
        memberships[0]?.tenantId;

      if (sid) setCurrentStoreId(sid);
      if (ctx?.reloadViewer) { try { await ctx.reloadViewer(); } catch { } }
      navigate("/dashboard", { replace: true });
      return;
    }

    if (memberships.length > 1) {
      clearTenantId();
      navigate("/admin/store/select", { replace: true }); // ← ruta coherente con tu código
      return;
    }

    // Sin tiendas: a la pantalla de solicitud
    clearTenantId();
    navigate("/admin/applications", { replace: true });
  } catch {
    clearTenantId();
    navigate("/admin/applications", { replace: true });
  }
}

/**
 * Observa el estado de la solicitud del vendedor y navega en caliente cuando se apruebe.
 * - Sin setInterval/setTimeout.
 * - Una sola suscripción al evento de socket.
 *
 * Uso típico desde /admin/applications (o el contenedor de esa vista):
 *   useEffect(() => watchSellerAppAndGo({ navigate, ctx }), [navigate]);
 */
export function watchSellerAppAndGo({ navigate, ctx } = {}) {
  const socket = getSocket?.() || null;

  // 1) Chequeo inicial (por si ya estaba aprobada)
  api
    .get("/api/seller-applications/me", {
      params: { _ts: Date.now() },
      headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" },
      withCredentials: true,
      omitTenantHeader: true,   // normalmente esta ruta no requiere tenant
      __noTenant: true,
      __noRetry401: true,       // evita refresh loop si venimos de logout
    })
    .then(({ data }) => {
      const app = data?.data;
      if (app?.status === "APPROVED" && app?.storeId) {
        try { setCurrentStoreId(app.storeId); } catch { }
        if (ctx?.reloadViewer) {
          Promise
            .resolve(ctx.reloadViewer())
            .finally(() => navigate(`/admin/store/${app.storeId}`, { replace: true }));
        } else {
          navigate(`/admin/store/${app.storeId}`, { replace: true });
        }
      }
    })
    .catch(() => { /* silencioso: puede no existir solicitud aún */ });

  // 2) Reacción por socket (evento emitido por el server)
  const onStatus = (payload) => {
    if (payload?.status === "APPROVED" && payload?.storeId) {
      try { setCurrentStoreId(payload.storeId); } catch { }
      if (ctx?.reloadViewer) {
        Promise
          .resolve(ctx.reloadViewer())
          .finally(() => navigate(`/admin/store/${payload.storeId}`, { replace: true }));
      } else {
        navigate(`/admin/store/${payload.storeId}`, { replace: true });
      }
    }
  };

  if (socket) {
    // Evita duplicados si el componente se monta/desmonta
    try { socket.off("seller-app:status", onStatus); } catch { }
    socket.on("seller-app:status", onStatus);
  }

  // Limpieza al desmontar
  return () => {
    try { socket?.off("seller-app:status", onStatus); } catch { }
  };
}
