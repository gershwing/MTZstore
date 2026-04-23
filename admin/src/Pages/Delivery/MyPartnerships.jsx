// admin/src/Pages/Delivery/MyPartnerships.jsx
// Vista del DELIVERY_AGENT: gestionar sociedades con tiendas
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@mui/material";
import {
  getMyPartnerships,
  getAvailableStores,
  requestPartnership,
  acceptPartnership,
  rejectPartnership,
  suspendPartnership,
} from "../../services/deliveryPartnerships";

const STATUS_TABS = [
  { value: "", label: "Todas" },
  { value: "ACTIVE", label: "Activas" },
  { value: "PENDING", label: "Pendientes" },
  { value: "SUSPENDED", label: "Suspendidas" },
  { value: "REJECTED", label: "Rechazadas" },
];

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACTIVE: "bg-green-100 text-green-800",
  SUSPENDED: "bg-orange-100 text-orange-800",
  REJECTED: "bg-red-100 text-red-800",
};
const STATUS_LABEL = { PENDING: "Pendiente", ACTIVE: "Activa", SUSPENDED: "Suspendida", REJECTED: "Rechazada" };

const SVC_BADGE = {
  express: "bg-purple-100 text-purple-700",
  standard: "bg-blue-100 text-blue-700",
};
const SVC_LABEL = { express: "Express", standard: "Estandar" };

export default function MyPartnerships() {
  const [tab, setTab] = useState("partnerships"); // partnerships | stores
  const [statusFilter, setStatusFilter] = useState("");
  const [partnerships, setPartnerships] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal solicitar
  const [reqOpen, setReqOpen] = useState(false);
  const [reqStoreId, setReqStoreId] = useState(null);
  const [reqStoreName, setReqStoreName] = useState("");
  const [reqType, setReqType] = useState("express");
  const [reqNotes, setReqNotes] = useState("");

  // Modal suspender
  const [suspOpen, setSuspOpen] = useState(false);
  const [suspId, setSuspId] = useState(null);
  const [suspReason, setSuspReason] = useState("");

  const loadPartnerships = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await getMyPartnerships(params);
      setPartnerships(Array.isArray(res.data) ? res.data : []);
    } catch { setPartnerships([]); }
    finally { setLoading(false); }
  };

  const loadStores = async () => {
    setLoading(true);
    try {
      const res = await getAvailableStores({ limit: 50 });
      setStores(Array.isArray(res.data) ? res.data : []);
    } catch { setStores([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === "partnerships") loadPartnerships();
    else loadStores();
  }, [tab, statusFilter]);

  const handleAccept = async (id) => {
    try {
      await acceptPartnership(id);
      toast.success("Sociedad aceptada");
      loadPartnerships();
    } catch (e) { toast.error(e?.response?.data?.message || "Error"); }
  };

  const handleReject = async (id) => {
    const reason = prompt("Motivo del rechazo:");
    if (!reason || reason.trim().length < 3) return;
    try {
      await rejectPartnership(id, reason);
      toast.success("Sociedad rechazada");
      loadPartnerships();
    } catch (e) { toast.error(e?.response?.data?.message || "Error"); }
  };

  const handleSuspendConfirm = async () => {
    if (!suspId || suspReason.trim().length < 3) { toast.warn("Motivo requerido (min 3 chars)"); return; }
    try {
      await suspendPartnership(suspId, suspReason);
      toast.success("Sociedad suspendida");
      setSuspOpen(false); setSuspId(null); setSuspReason("");
      loadPartnerships();
    } catch (e) { toast.error(e?.response?.data?.message || "Error"); }
  };

  const handleRequestConfirm = async () => {
    if (!reqStoreId) return;
    try {
      await requestPartnership(reqStoreId, reqType, reqNotes);
      toast.success("Solicitud enviada");
      setReqOpen(false); setReqStoreId(null); setReqNotes("");
      loadStores();
    } catch (e) { toast.error(e?.response?.data?.message || "Error al solicitar"); }
  };

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-80px)] overflow-y-auto">
      <h1 className="text-2xl font-bold">Mis sociedades</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <button onClick={() => setTab("partnerships")} className={`px-4 py-2 text-sm font-medium rounded-t ${tab === "partnerships" ? "bg-white border border-b-0 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
          Sociedades
        </button>
        <button onClick={() => setTab("stores")} className={`px-4 py-2 text-sm font-medium rounded-t ${tab === "stores" ? "bg-white border border-b-0 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
          Buscar tiendas
        </button>
      </div>

      {/* Tab: Partnerships */}
      {tab === "partnerships" && (
        <>
          <div className="flex gap-1 flex-wrap">
            {STATUS_TABS.map((s) => (
              <button key={s.value} onClick={() => setStatusFilter(s.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${statusFilter === s.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
                {s.label}
              </button>
            ))}
          </div>

          {loading ? <p className="text-gray-500 py-8 text-center">Cargando...</p> : partnerships.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">No tienes sociedades{statusFilter ? ` con estado "${STATUS_LABEL[statusFilter] || statusFilter}"` : ""}.</p>
              <p className="text-sm mt-1">Busca tiendas y solicita ser su repartidor.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {partnerships.map((p) => (
                <div key={p._id} className="bg-white border rounded-lg px-4 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{p.storeId?.name || "Tienda"}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${SVC_BADGE[p.serviceType] || ""}`}>
                        {SVC_LABEL[p.serviceType] || p.serviceType}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${STATUS_COLORS[p.status] || ""}`}>
                        {STATUS_LABEL[p.status] || p.status}
                      </span>
                      {p.requestedBy === "store" && p.status === "PENDING" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">Invitación</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {p.stats?.deliveriesCompleted > 0 && <span>{p.stats.deliveriesCompleted} entregas</span>}
                      {p.stats?.rating > 0 && <span className="ml-2">Rating: {p.stats.rating.toFixed(1)}</span>}
                    </div>
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    {p.status === "PENDING" && p.requestedBy === "store" && (
                      <>
                        <button onClick={() => handleAccept(p._id)} className="bg-green-600 text-white rounded px-2.5 py-1 text-[11px] font-medium hover:bg-green-700">Aceptar</button>
                        <button onClick={() => handleReject(p._id)} className="bg-orange-500 text-white rounded px-2.5 py-1 text-[11px] font-medium hover:bg-orange-600">Rechazar</button>
                      </>
                    )}
                    {p.status === "PENDING" && p.requestedBy === "agent" && (
                      <span className="text-xs text-gray-400">Esperando respuesta...</span>
                    )}
                    {p.status === "ACTIVE" && (
                      <button onClick={() => { setSuspId(p._id); setSuspReason(""); setSuspOpen(true); }}
                        className="border border-orange-300 text-orange-600 rounded px-2.5 py-1 text-[11px] hover:bg-orange-50">
                        Suspender
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: Buscar tiendas */}
      {tab === "stores" && (
        <>
          {loading ? <p className="text-gray-500 py-8 text-center">Cargando...</p> : stores.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">No hay tiendas disponibles para solicitar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stores.map((s) => (
                <div key={s._id} className="bg-white border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    {s.branding?.logo && <img src={s.branding.logo} alt="" className="w-10 h-10 rounded object-cover" />}
                    <div>
                      <p className="font-semibold text-sm">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {s.delivery?.expressMode && <span>Express: {s.delivery.expressMode}</span>}
                    {s.delivery?.standardMode && <span>Estandar: {s.delivery.standardMode}</span>}
                  </div>
                  <Button size="small" variant="outlined" fullWidth onClick={() => {
                    setReqStoreId(s._id); setReqStoreName(s.name); setReqType("express"); setReqNotes(""); setReqOpen(true);
                  }}>
                    Solicitar sociedad
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal: Solicitar partnership */}
      {reqOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold">Solicitar sociedad con {reqStoreName}</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de servicio</label>
              <select value={reqType} onChange={(e) => setReqType(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="express">Express</option>
                <option value="standard">Estandar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
              <textarea rows={2} value={reqNotes} onChange={(e) => setReqNotes(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Mensaje para la tienda..." />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setReqOpen(false)} className="flex-1 border rounded py-2 text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={handleRequestConfirm} className="flex-1 bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700">Enviar solicitud</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Suspender */}
      {suspOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold">Suspender sociedad</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Motivo *</label>
              <textarea autoFocus rows={2} value={suspReason} onChange={(e) => setSuspReason(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSuspOpen(false)} className="flex-1 border rounded py-2 text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSuspendConfirm} disabled={suspReason.trim().length < 3} className="flex-1 bg-orange-500 text-white rounded py-2 text-sm font-medium hover:bg-orange-600 disabled:opacity-50">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
