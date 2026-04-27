// admin/src/Pages/Delivery/StorePartnerships.jsx
// Vista del STORE_OWNER: gestionar sociedades con repartidores
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@mui/material";
import VerifiedBadge from "../../Components/VerifiedBadge";
import {
  getStorePartnerships,
  getAvailableAgents,
  invitePartnership,
  acceptPartnership,
  rejectPartnership,
  suspendPartnership,
} from "../../services/deliveryPartnerships";

const TRUST_BADGE = {
  BASIC: "bg-gray-100 text-gray-600",
  VERIFIED: "bg-blue-100 text-blue-700",
  TRUSTED: "bg-amber-100 text-amber-700",
};
const TRUST_LABEL = { BASIC: "Basico", VERIFIED: "Verificado", TRUSTED: "Confiable" };

const SVC_BADGE = {
  express: "bg-purple-100 text-purple-700",
  standard: "bg-blue-100 text-blue-700",
};
const SVC_LABEL = { express: "Express", standard: "Estándar" };

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACTIVE: "bg-green-100 text-green-800",
  SUSPENDED: "bg-orange-100 text-orange-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function StorePartnerships() {
  const [tab, setTab] = useState("partners"); // partners | requests | invite
  const [items, setItems] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal invitar
  const [invOpen, setInvOpen] = useState(false);
  const [invAgentId, setInvAgentId] = useState(null);
  const [invAgentName, setInvAgentName] = useState("");
  const [invType, setInvType] = useState("express");
  const [invNotes, setInvNotes] = useState("");

  // Modal suspender
  const [suspOpen, setSuspOpen] = useState(false);
  const [suspId, setSuspId] = useState(null);
  const [suspReason, setSuspReason] = useState("");

  const loadPartners = async (statusFilter) => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await getStorePartnerships(params);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  const loadAgents = async () => {
    setLoading(true);
    try {
      const res = await getAvailableAgents({ limit: 50 });
      setAgents(Array.isArray(res.data) ? res.data : []);
    } catch { setAgents([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === "partners") loadPartners("ACTIVE");
    else if (tab === "requests") loadPartners("PENDING");
    else loadAgents();
  }, [tab]);

  const handleAccept = async (id) => {
    try { await acceptPartnership(id); toast.success("Sociedad aceptada"); loadPartners("PENDING"); }
    catch (e) { toast.error(e?.response?.data?.message || "Error"); }
  };

  const handleReject = async (id) => {
    const reason = prompt("Motivo del rechazo:");
    if (!reason || reason.trim().length < 3) return;
    try { await rejectPartnership(id, reason); toast.success("Solicitud rechazada"); loadPartners("PENDING"); }
    catch (e) { toast.error(e?.response?.data?.message || "Error"); }
  };

  const handleSuspendConfirm = async () => {
    if (!suspId || suspReason.trim().length < 3) { toast.warn("Motivo requerido"); return; }
    try {
      await suspendPartnership(suspId, suspReason);
      toast.success("Sociedad suspendida");
      setSuspOpen(false); loadPartners("ACTIVE");
    } catch (e) { toast.error(e?.response?.data?.message || "Error"); }
  };

  const handleInviteConfirm = async () => {
    if (!invAgentId) return;
    try {
      await invitePartnership(invAgentId, invType, invNotes);
      toast.success("Invitacion enviada");
      setInvOpen(false); loadAgents();
    } catch (e) { toast.error(e?.response?.data?.message || "Error al invitar"); }
  };

  const getTrustLevel = (p) => p.agentProfile?.platformTrustLevel || "BASIC";

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-80px)] overflow-y-auto">
      <h1 className="text-2xl font-bold">Repartidores socios</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {[
          { key: "partners", label: "Mis socios" },
          { key: "requests", label: "Solicitudes" },
          { key: "invite", label: "Invitar agentes" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t ${tab === t.key ? "bg-white border border-b-0 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500 py-8 text-center">Cargando...</p>}

      {/* Tab: Socios activos */}
      {!loading && tab === "partners" && (
        items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No tienes socios activos.</p>
            <p className="text-sm mt-1">Invita repartidores o espera solicitudes.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((p) => (
              <div key={p._id} className="bg-white border rounded-lg px-4 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{p.agentId?.name || "Agente"}</span>
                    <VerifiedBadge trustLevel={p.agentProfile?.platformTrustLevel} size={14} />
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${SVC_BADGE[p.serviceType] || ""}`}>
                      {SVC_LABEL[p.serviceType] || p.serviceType}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${TRUST_BADGE[getTrustLevel(p)]}`}>
                      {TRUST_LABEL[getTrustLevel(p)] || getTrustLevel(p)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 flex gap-3">
                    {p.agentId?.email && <span>{p.agentId.email}</span>}
                    {p.stats?.deliveriesCompleted > 0 && <span>{p.stats.deliveriesCompleted} entregas</span>}
                    {p.stats?.rating > 0 && <span>Rating: {p.stats.rating.toFixed(1)}</span>}
                  </div>
                </div>
                <button onClick={() => { setSuspId(p._id); setSuspReason(""); setSuspOpen(true); }}
                  className="border border-orange-300 text-orange-600 rounded px-2.5 py-1 text-[11px] hover:bg-orange-50">
                  Suspender
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Tab: Solicitudes pendientes */}
      {!loading && tab === "requests" && (
        items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No hay solicitudes pendientes.</div>
        ) : (
          <div className="space-y-2">
            {items.filter((p) => p.requestedBy === "agent").map((p) => (
              <div key={p._id} className="bg-white border rounded-lg px-4 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{p.agentId?.name || "Agente"}</span>
                    <VerifiedBadge trustLevel={p.agentProfile?.platformTrustLevel} size={14} />
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${SVC_BADGE[p.serviceType] || ""}`}>
                      {SVC_LABEL[p.serviceType] || p.serviceType}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${TRUST_BADGE[getTrustLevel(p)]}`}>
                      {TRUST_LABEL[getTrustLevel(p)] || getTrustLevel(p)}
                    </span>
                  </div>
                  {p.notes && <p className="text-xs text-gray-500 mt-0.5">{p.notes}</p>}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => handleAccept(p._id)} className="bg-green-600 text-white rounded px-2.5 py-1 text-[11px] font-medium hover:bg-green-700">Aceptar</button>
                  <button onClick={() => handleReject(p._id)} className="bg-orange-500 text-white rounded px-2.5 py-1 text-[11px] font-medium hover:bg-orange-600">Rechazar</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Tab: Invitar agentes */}
      {!loading && tab === "invite" && (
        agents.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No hay agentes disponibles para invitar.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {agents.map((a) => {
              const user = a.userId || {};
              return (
                <div key={a._id} className="bg-white border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{user.name || "Agente"}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${TRUST_BADGE[a.platformTrustLevel]}`}>
                      {a.platformTrustLevel}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-0.5">
                    {user.email && <p>{user.email}</p>}
                    <p>Servicios: {a.approvedServiceTypes?.join(", ") || "—"}</p>
                    <p>{a.stats?.totalDeliveries || 0} entregas · Rating: {a.stats?.rating?.toFixed(1) || "—"}</p>
                  </div>
                  <Button size="small" variant="outlined" fullWidth onClick={() => {
                    setInvAgentId(user._id || a.userId); setInvAgentName(user.name || "Agente");
                    setInvType("express"); setInvNotes(""); setInvOpen(true);
                  }}>
                    Invitar
                  </Button>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Modal: Invitar */}
      {invOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold">Invitar a {invAgentName}</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de servicio</label>
              <select value={invType} onChange={(e) => setInvType(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="express">Express</option>
                <option value="standard">Estandar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
              <textarea rows={2} value={invNotes} onChange={(e) => setInvNotes(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setInvOpen(false)} className="flex-1 border rounded py-2 text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={handleInviteConfirm} className="flex-1 bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700">Enviar invitacion</button>
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
