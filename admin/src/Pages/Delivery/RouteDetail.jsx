// admin/src/Pages/Delivery/RouteDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoute } from "../../services/deliveryRoute";
import Badge from "../../Components/Badge";
import VerifiedBadge from "../../Components/VerifiedBadge";

const STATUS_BADGE = {
  CREATED: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  PARTIAL: "bg-orange-100 text-orange-700",
};
const STATUS_LABEL = { CREATED: "Creada", IN_PROGRESS: "En progreso", COMPLETED: "Completada", PARTIAL: "Parcial" };

export default function RouteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getRoute(id)
      .then(r => { const d = r?.data || r; setRoute(d); })
      .catch(() => setRoute(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-4 text-gray-500">Cargando ruta...</div>;
  if (!route) return <div className="p-4 text-gray-500">Ruta no encontrada.</div>;

  const tasks = route.tasks || [];
  const fmt = (d) => d ? new Date(d).toLocaleString("es-BO") : "—";

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-80px)] overflow-y-auto">
      <button onClick={() => navigate(-1)} className="text-blue-600 text-sm hover:underline mb-2">&larr; Volver</button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ruta #{String(route._id).slice(-8).toUpperCase()}</h1>
        <span className={`text-xs px-3 py-1 rounded font-medium ${STATUS_BADGE[route.status] || ""}`}>
          {STATUS_LABEL[route.status] || route.status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{route.stats?.totalStops || 0}</p>
          <p className="text-xs text-gray-500">Paradas</p>
        </div>
        <div className="bg-white border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{route.stats?.delivered || 0}</p>
          <p className="text-xs text-gray-500">Entregados</p>
        </div>
        <div className="bg-white border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-500">{route.stats?.failed || 0}</p>
          <p className="text-xs text-gray-500">Fallidos</p>
        </div>
        <div className="bg-white border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{route.stats?.pending || 0}</p>
          <p className="text-xs text-gray-500">Pendientes</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white border rounded-lg p-4 space-y-2 text-sm">
        <p><span className="text-gray-500">Repartidor:</span> <span className="font-medium">{route.agentId?.name || "—"}</span> <VerifiedBadge trustLevel={route.agentTrustLevel} size={14} /> {route.agentId?.phone && <span className="text-gray-400">({route.agentId.phone})</span>}</p>
        <p><span className="text-gray-500">Creada por:</span> {route.createdBy?.name || "—"}</p>
        <p><span className="text-gray-500">Creada:</span> {fmt(route.createdAt)}</p>
        {route.startedAt && <p><span className="text-gray-500">Iniciada:</span> {fmt(route.startedAt)}</p>}
        {route.completedAt && <p><span className="text-gray-500">Completada:</span> {fmt(route.completedAt)}</p>}
        {route.note && <p><span className="text-gray-500">Nota:</span> {route.note}</p>}
      </div>

      {/* Paradas */}
      <h2 className="text-lg font-semibold">Paradas ({tasks.length})</h2>
      <div className="space-y-2">
        {tasks.map((t, idx) => (
          <div key={t._id} className="bg-white border rounded-lg px-4 py-3 flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{t.address?.name || "Sin nombre"}</span>
                <span className="text-xs text-gray-400">{t.address?.phone || ""}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">{t.address?.line1} {t.address?.city && `· ${t.address.city}`}</p>
              {t.orderId && (
                <p className="text-[11px] text-gray-400">
                  Orden #{String(t.orderId._id || t.orderId).slice(-8).toUpperCase()}
                  {t.orderId.totalBob != null && ` · ${Number(t.orderId.totalBob).toFixed(2)} Bs`}
                </p>
              )}
            </div>
            <Badge kind="delivery" status={t.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
