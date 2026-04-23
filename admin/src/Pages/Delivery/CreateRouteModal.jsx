// admin/src/Pages/Delivery/CreateRouteModal.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { listDeliveries } from "../../services/delivery";
import { createRoute } from "../../services/deliveryRoute";

export default function CreateRouteModal({ open, onClose, onCreated }) {
  const [step, setStep] = useState(1); // 1=seleccionar tasks, 2=seleccionar agente
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [agents, setAgents] = useState([]);
  const [agentId, setAgentId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar tasks pendientes estándar
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listDeliveries({ status: "PENDING", shippingMethod: "MTZSTORE_STANDARD", limit: 100 })
      .then(r => {
        const data = r?.data?.data || r?.data || [];
        // Filtrar solo los que no tienen ruta y no tienen agente
        const pending = (Array.isArray(data) ? data : []).filter(t => !t.routeId && !t.assigneeId);
        setTasks(pending);
      })
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [open]);

  // También cargar STORE_STANDARD
  useEffect(() => {
    if (!open) return;
    listDeliveries({ status: "PENDING", shippingMethod: "STORE_STANDARD", limit: 100 })
      .then(r => {
        const data = r?.data?.data || r?.data || [];
        const pending = (Array.isArray(data) ? data : []).filter(t => !t.routeId && !t.assigneeId);
        setTasks(prev => [...prev, ...pending]);
      })
      .catch(() => {});
  }, [open]);

  // Cargar agentes estándar al pasar a step 2
  useEffect(() => {
    if (step !== 2) return;
    setLoading(true);
    import("../../services/deliveryAgentProfile").then(mod => {
      mod.listAgentProfiles({ serviceType: "standard", status: "ACTIVE", limit: 50 })
        .then(r => {
          const data = r?.data || [];
          setAgents(Array.isArray(data) ? data : []);
        })
        .catch(() => setAgents([]))
        .finally(() => setLoading(false));
    });
  }, [step]);

  const toggleTask = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === tasks.length) setSelected(new Set());
    else setSelected(new Set(tasks.map(t => t._id)));
  };

  const handleCreate = async () => {
    if (!agentId || !selected.size) return;
    setLoading(true);
    try {
      await createRoute([...selected], agentId, note);
      toast.success(`Ruta creada con ${selected.size} paradas`);
      onCreated?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Error al crear ruta");
    } finally { setLoading(false); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">
            {step === 1 ? "Seleccionar pedidos" : "Seleccionar repartidor"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {step === 1 && (
            <>
              <p className="text-xs text-gray-500 mb-3">Selecciona los pedidos estandar que formaran parte de esta ruta de reparto.</p>
              {loading ? <p className="text-gray-400 text-center py-4">Cargando...</p> : tasks.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No hay pedidos estandar pendientes disponibles.</p>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <input type="checkbox" checked={selected.size === tasks.length && tasks.length > 0} onChange={toggleAll} />
                    <span className="text-xs text-gray-500">Seleccionar todos ({tasks.length})</span>
                    <span className="ml-auto text-xs font-medium text-blue-600">{selected.size} seleccionados</span>
                  </div>
                  <div className="space-y-1">
                    {tasks.map(t => (
                      <label key={t._id} className={`flex items-center gap-3 p-2 border rounded cursor-pointer text-sm ${selected.has(t._id) ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                        <input type="checkbox" checked={selected.has(t._id)} onChange={() => toggleTask(t._id)} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs truncate">{t.address?.name || "Sin nombre"} — {t.address?.city || ""}</p>
                          <p className="text-[11px] text-gray-400">{t.address?.line1 || ""} · Orden #{String(t.orderId?._id || t.orderId || t._id).slice(-8).toUpperCase()}</p>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 shrink-0">
                          {t.shippingMethod?.includes("MTZ") ? "MTZ" : "Tienda"}
                        </span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-xs text-gray-500 mb-3">{selected.size} pedidos seleccionados. Elige el repartidor estandar para esta ruta.</p>
              {loading ? <p className="text-gray-400 text-center py-4">Cargando agentes...</p> : (
                <>
                  <select value={agentId} onChange={e => setAgentId(e.target.value)} className="w-full border rounded px-3 py-2 text-sm mb-3">
                    <option value="">Seleccionar repartidor...</option>
                    {agents.map(a => (
                      <option key={a._id} value={a.userId?._id || a.userId}>
                        {a.userId?.name || "Agente"} — {a.platformTrustLevel} · {a.stats?.totalDeliveries || 0} entregas
                      </option>
                    ))}
                  </select>
                  <div>
                    <label className="block text-xs font-medium mb-1">Nota (opcional)</label>
                    <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="Ej: Ruta zona sur lunes" />
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2 p-4 border-t">
          {step === 2 && (
            <button onClick={() => setStep(1)} className="border rounded px-4 py-2 text-sm hover:bg-gray-50">Atras</button>
          )}
          <div className="flex-1" />
          <button onClick={onClose} className="border rounded px-4 py-2 text-sm hover:bg-gray-50">Cancelar</button>
          {step === 1 ? (
            <button onClick={() => setStep(2)} disabled={!selected.size}
              className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              Siguiente ({selected.size})
            </button>
          ) : (
            <button onClick={handleCreate} disabled={!agentId || loading}
              className="bg-green-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50">
              {loading ? "Creando..." : "Crear ruta"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
