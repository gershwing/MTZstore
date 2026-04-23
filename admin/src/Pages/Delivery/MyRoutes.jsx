// admin/src/Pages/Delivery/MyRoutes.jsx
// Vista del DELIVERY_AGENT: su ruta activa con paradas
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, CircularProgress } from "@mui/material";
import { getMyRoutes, startRoute } from "../../services/deliveryRoute";
import { updateDeliveryStatus, uploadDeliveryProof } from "../../services/delivery";
import Badge from "../../Components/Badge";

export default function MyRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getMyRoutes();
      setRoutes(Array.isArray(data) ? data : []);
    } catch { setRoutes([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleStart = async (routeId) => {
    try {
      await startRoute(routeId);
      toast.success("Ruta iniciada");
      load();
    } catch (e) { toast.error(e?.response?.data?.message || "Error"); }
  };

  const handleStatusUpdate = async (taskId, status) => {
    setUpdating(taskId);
    try {
      await updateDeliveryStatus(taskId, { status });
      toast.success(`Estado actualizado: ${status}`);
      load();
    } catch (e) { toast.error(e?.response?.data?.message || "Error"); }
    finally { setUpdating(null); }
  };

  const handleUploadProof = async (taskId, files) => {
    if (!files?.length) return;
    setUpdating(taskId);
    try {
      await uploadDeliveryProof(taskId, files);
      toast.success("Prueba subida");
      load();
    } catch (e) { toast.error(e?.response?.data?.message || "Error"); }
    finally { setUpdating(null); }
  };

  if (loading) return <div className="p-4 text-gray-500">Cargando rutas...</div>;

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-80px)] overflow-y-auto">
      <h1 className="text-2xl font-bold">Mi ruta activa</h1>

      {routes.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No tienes rutas asignadas.</p>
          <p className="text-sm mt-1">Las rutas aparecen aqui cuando el administrador te asigna pedidos estandar.</p>
        </div>
      )}

      {routes.map(route => {
        const tasks = route.tasks || [];
        const delivered = route.stats?.delivered || 0;
        const total = route.stats?.totalStops || tasks.length;
        const progress = total > 0 ? Math.round((delivered / total) * 100) : 0;

        return (
          <div key={route._id} className="space-y-3">
            {/* Banner de progreso */}
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="font-semibold text-sm">Ruta #{String(route._id).slice(-8).toUpperCase()}</h2>
                  <p className="text-xs text-gray-500">{route.note || "Sin nota"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">{delivered}/{total}</p>
                  <p className="text-xs text-gray-400">entregas</p>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>

              {route.status === "CREATED" && (
                <Button variant="contained" color="primary" fullWidth onClick={() => handleStart(route._id)}>
                  Iniciar ruta
                </Button>
              )}
              {route.status === "IN_PROGRESS" && (
                <p className="text-xs text-blue-600 font-medium text-center">Ruta en progreso</p>
              )}
            </div>

            {/* Paradas */}
            <div className="space-y-2">
              {tasks.map((t, idx) => {
                const isActive = ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"].includes(t.status);
                const isDone = ["DELIVERED", "FAILED", "CANCELLED"].includes(t.status);

                return (
                  <div key={t._id} className={`bg-white border rounded-lg p-4 space-y-2 ${isDone ? "opacity-60" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isDone ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{t.address?.name || "Sin nombre"}</p>
                        <p className="text-xs text-gray-500">{t.address?.phone || ""}</p>
                      </div>
                      <Badge kind="delivery" status={t.status} />
                    </div>

                    <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                      <p>{t.address?.line1 || "Sin direccion"}</p>
                      {t.address?.line2 && <p>{t.address.line2}</p>}
                      <p>{[t.address?.city, t.address?.state].filter(Boolean).join(", ")}</p>
                      {t.address?.notes && <p className="text-gray-400 mt-1">Ref: {t.address.notes}</p>}
                    </div>

                    {t.orderId && (
                      <p className="text-[11px] text-gray-400">
                        Orden #{String(t.orderId._id || t.orderId).slice(-8).toUpperCase()}
                        {t.orderId.totalBob != null && ` · ${Number(t.orderId.totalBob).toFixed(2)} Bs`}
                      </p>
                    )}

                    {/* Acciones */}
                    {isActive && route.status === "IN_PROGRESS" && (
                      <div className="flex gap-1.5 flex-wrap pt-1">
                        {t.status === "ASSIGNED" && (
                          <button onClick={() => handleStatusUpdate(t._id, "PICKED_UP")} disabled={updating === t._id}
                            className="bg-blue-600 text-white rounded px-2.5 py-1 text-[11px] font-medium hover:bg-blue-700 disabled:opacity-50">
                            {updating === t._id ? "..." : "Recogido"}
                          </button>
                        )}
                        {t.status === "PICKED_UP" && (
                          <button onClick={() => handleStatusUpdate(t._id, "IN_TRANSIT")} disabled={updating === t._id}
                            className="bg-blue-600 text-white rounded px-2.5 py-1 text-[11px] font-medium hover:bg-blue-700 disabled:opacity-50">
                            {updating === t._id ? "..." : "En ruta"}
                          </button>
                        )}
                        {["PICKED_UP", "IN_TRANSIT"].includes(t.status) && (
                          <>
                            <button onClick={() => handleStatusUpdate(t._id, "DELIVERED")} disabled={updating === t._id}
                              className="bg-green-600 text-white rounded px-2.5 py-1 text-[11px] font-medium hover:bg-green-700 disabled:opacity-50">
                              Entregado
                            </button>
                            <button onClick={() => {
                              const reason = prompt("Motivo del fallo:");
                              if (reason) handleStatusUpdate(t._id, "FAILED");
                            }} disabled={updating === t._id}
                              className="bg-red-500 text-white rounded px-2.5 py-1 text-[11px] font-medium hover:bg-red-600 disabled:opacity-50">
                              Fallido
                            </button>
                          </>
                        )}
                        <label className="border border-gray-300 text-gray-600 rounded px-2.5 py-1 text-[11px] hover:bg-gray-50 cursor-pointer">
                          Subir prueba
                          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleUploadProof(t._id, e.target.files)} />
                        </label>
                      </div>
                    )}

                    {/* Proofs thumbnails */}
                    {t.proofs?.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {t.proofs.map((p, pi) => (
                          <img key={pi} src={p.url} alt="" className="w-10 h-10 object-cover rounded border" />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
