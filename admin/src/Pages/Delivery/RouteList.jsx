// admin/src/Pages/Delivery/RouteList.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { listRoutes, cancelRoute } from "../../services/deliveryRoute";
import CreateRouteModal from "./CreateRouteModal";

const STATUS_BADGE = {
  CREATED: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  PARTIAL: "bg-orange-100 text-orange-700",
};
const STATUS_LABEL = { CREATED: "Creada", IN_PROGRESS: "En progreso", COMPLETED: "Completada", PARTIAL: "Parcial" };

export default function RouteList() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const load = async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await listRoutes(params);
      setRoutes(Array.isArray(res.data) ? res.data : []);
      setTotalPages(res.totalPages || 1);
      setPage(res.page || 1);
    } catch { setRoutes([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [statusFilter]);

  const handleCancel = async (id) => {
    if (!confirm("Cancelar esta ruta? Los pedidos volveran a estado pendiente.")) return;
    try {
      await cancelRoute(id);
      toast.success("Ruta cancelada");
      load(page);
    } catch (e) { toast.error(e?.response?.data?.message || "Error"); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString("es-BO", { day: "numeric", month: "short" }) : "";

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-80px)] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rutas de reparto</h1>
        <Button variant="contained" onClick={() => setModalOpen(true)}>Crear ruta</Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-1 flex-wrap">
        {[{ v: "", l: "Todas" }, { v: "CREATED", l: "Creadas" }, { v: "IN_PROGRESS", l: "En progreso" }, { v: "COMPLETED", l: "Completadas" }, { v: "PARTIAL", l: "Parciales" }].map(s => (
          <button key={s.v} onClick={() => setStatusFilter(s.v)}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${statusFilter === s.v ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
            {s.l}
          </button>
        ))}
      </div>

      {loading ? <p className="text-gray-500 py-8 text-center">Cargando...</p> : routes.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No hay rutas de reparto.</p>
          <p className="text-sm mt-1">Crea una ruta seleccionando pedidos estandar pendientes.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Repartidor</th>
                <th className="text-center p-3">Estado</th>
                <th className="text-center p-3">Progreso</th>
                <th className="text-left p-3">Creada</th>
                <th className="text-center p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {routes.map(r => (
                <tr key={r._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs text-blue-600 cursor-pointer" onClick={() => navigate(`/admin/delivery-routes/${r._id}`)}>
                    {String(r._id).slice(-8).toUpperCase()}
                  </td>
                  <td className="p-3 text-sm">{r.agentId?.name || "—"}</td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${STATUS_BADGE[r.status] || ""}`}>
                      {STATUS_LABEL[r.status] || r.status}
                    </span>
                  </td>
                  <td className="p-3 text-center text-xs">
                    <span className="font-semibold text-green-600">{r.stats?.delivered || 0}</span>
                    <span className="text-gray-400">/{r.stats?.totalStops || 0}</span>
                    {(r.stats?.failed || 0) > 0 && <span className="ml-1 text-red-500">({r.stats.failed} fallidos)</span>}
                  </td>
                  <td className="p-3 text-xs text-gray-500">{fmt(r.createdAt)}</td>
                  <td className="p-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => navigate(`/admin/delivery-routes/${r._id}`)} className="text-blue-600 text-[11px] hover:underline">Ver</button>
                      {r.status === "CREATED" && (
                        <button onClick={() => handleCancel(r._id)} className="text-red-600 text-[11px] hover:underline">Cancelar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-2">
          <button onClick={() => load(page - 1)} disabled={page <= 1} className="border rounded px-4 py-1 text-sm disabled:opacity-30">Anterior</button>
          <span className="text-sm text-gray-500">Pagina {page} de {totalPages}</span>
          <button onClick={() => load(page + 1)} disabled={page >= totalPages} className="border rounded px-4 py-1 text-sm disabled:opacity-30">Siguiente</button>
        </div>
      )}

      {modalOpen && <CreateRouteModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={() => { setModalOpen(false); load(1); }} />}
    </div>
  );
}
