// admin/src/Pages/Applications/index.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useMySellerApplication } from "../../hooks/useSellerApp"; // ⬅️ NUEVO

// Tarjetas livianas para onboarding (ya las tienes)
import RequestSellerCard from "../Stores/RequestSellerCard";
const ApplyDelivery = React.lazy(() => import("../Delivery/ApplyDelivery"));

export default function ApplicationsBridgePage({ embedded = false }) {
  const navigate = useNavigate();
  const { me } = (typeof useAuth === "function" ? useAuth() : {}) || {};
  const roles = Array.isArray(me?.roles) ? me.roles : [];

  // ⬇️ Estado de mi postulación (si existe)
  const { data: app, isLoading, refetch } = useMySellerApplication(); // refetch opcional

  const isSuper = useMemo(() => {
    return Boolean(
      me?.isSuper ||
      me?.isPlatformSuperAdmin ||
      roles.includes("SUPER_ADMIN") ||
      String(me?.role || "").toUpperCase() === "SUPER_ADMIN"
    );
  }, [me, roles]);

  // util simple para fecha legible sin libs externas
  const fmt = (d) => (d ? new Date(d).toLocaleString() : "—");

  // clase dinámica para la píldora
  const statusClass = (s) => {
    const v = String(s || "").toUpperCase();
    if (v === "APPROVED") return "approved";
    if (v === "REJECTED") return "rejected";
    return "pending"; // default
  };

  // 🔔 Escucha eventos push desde socket (reenviados como DOMEvent en socket.js)
  React.useEffect(() => {
    const onStatus = (ev) => {
      const detail = ev?.detail || {};
      try { refetch?.(); } catch { }
      // Redirección opcional cuando aprueban
      if (String(detail?.status).toUpperCase() === "APPROVED") {
        navigate("/admin/my-store");
      }
    };
    try { window.addEventListener("seller-app:status", onStatus); } catch { }
    return () => {
      try { window.removeEventListener("seller-app:status", onStatus); } catch { }
    };
  }, [navigate, refetch]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Empezar</h1>
      <p className="text-sm mb-6">Elige cómo quieres participar en la plataforma.</p>

      {/* ===================== Estado de mi solicitud ===================== */}
      {isLoading ? (
        <p className="mb-6 text-sm text-gray-500">Cargando estado…</p>
      ) : app ? (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border">
          <div className={`status-pill ${statusClass(app.status)}`}>
            <span>Estado: {app.status}</span>
          </div>

          {/* Motivo del rechazo (si aplica) */}
          {String(app.status).toUpperCase() === "REJECTED" && (
            <p className="text-sm mt-2">
              <b>Motivo:</b> {app.notes || "—"}
            </p>
          )}

          <div className="text-xs text-gray-600 mt-2 space-y-0.5">
            <p>Enviada el: {fmt(app.createdAt)}</p>
            {app.reviewedAt && <p>Revisada el: {fmt(app.reviewedAt)}</p>}
          </div>
        </div>
      ) : null}

      {/* ===================== Tarjetas de acciones ===================== */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quiero vender */}
        <div className="rounded-2xl p-5 shadow bg-white">
          <h2 className="text-lg font-medium mb-2">Vender en la plataforma</h2>
          <p className="text-sm mb-4">Postula tu tienda para publicar productos y gestionar pedidos.</p>
          <button onClick={() => navigate("/admin/sell")} className="btn btn-blue rounded-lg">
            Solicitar ser vendedor
          </button>
        </div>

        {/* Quiero hacer delivery */}
        <div className="rounded-2xl p-5 shadow bg-white">
          <h2 className="text-lg font-medium mb-2">Ser repartidor (delivery)</h2>
          <p className="text-sm mb-4">Aplica para completar entregas y registrar comprobantes.</p>
          <button onClick={() => navigate("/admin/apply-delivery")} className="btn btn-blue rounded-lg">
            Solicitar ser delivery
          </button>
        </div>
      </div>

      {/* Accesos extra para SUPER (opcional) */}
      {isSuper && (
        <div className="mt-8 text-sm">
          <div className="opacity-70 mb-2">Solo SUPER / Staff</div>
          <ul className="list-disc ml-5 space-y-1">
            <li>
              <a className="underline" href="/admin/seller-applications/admin">
                Revisión de postulaciones de vendedores
              </a>
            </li>
            <li>
              <a className="underline" href="/admin/delivery-applications/admin">
                Revisión de postulaciones de delivery
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
