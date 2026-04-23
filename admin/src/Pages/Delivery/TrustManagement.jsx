// admin/src/Pages/Delivery/TrustManagement.jsx
// Vista SUPER_ADMIN: gestión de niveles de confianza de agentes
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  listAgentProfiles,
  getCandidatesVerified,
  promoteAgent,
  demoteAgent,
  suspendAgent,
} from "../../services/deliveryAgentProfile";

const TRUST_BADGE = {
  BASIC: "bg-gray-100 text-gray-600",
  VERIFIED: "bg-blue-100 text-blue-700",
  TRUSTED: "bg-amber-100 text-amber-700",
};
const TRUST_LABEL = { BASIC: "Basico", VERIFIED: "Verificado", TRUSTED: "Confiable" };

const STATUS_BADGE = {
  ACTIVE: "bg-green-100 text-green-700",
  PAUSED: "bg-yellow-100 text-yellow-700",
  SUSPENDED: "bg-red-100 text-red-700",
};
const STATUS_LABEL = { ACTIVE: "Activo", PAUSED: "Pausado", SUSPENDED: "Suspendido" };

const TRUST_LEVELS = ["", "BASIC", "VERIFIED", "TRUSTED"];
const TRUST_LEVEL_LABELS = { "": "Todos", BASIC: "Basico", VERIFIED: "Verificado", TRUSTED: "Confiable" };

export default function TrustManagement() {
  const [tab, setTab] = useState("candidates"); // candidates | agents
  const [candidates, setCandidates] = useState([]);
  const [agents, setAgents] = useState([]);
  const [trustFilter, setTrustFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal promote/demote
  const [actionOpen, setActionOpen] = useState(false);
  const [actionType, setActionType] = useState("promote"); // promote | demote | suspend
  const [actionId, setActionId] = useState(null);
  const [actionName, setActionName] = useState("");
  const [actionLevel, setActionLevel] = useState("VERIFIED");
  const [actionReason, setActionReason] = useState("");

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await getCandidatesVerified();
      setCandidates(Array.isArray(res.data) ? res.data : []);
    } catch { setCandidates([]); }
    finally { setLoading(false); }
  };

  const loadAgents = async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 20 };
      if (trustFilter) params.trustLevel = trustFilter;
      const res = await listAgentProfiles(params);
      setAgents(Array.isArray(res.data) ? res.data : []);
      setTotalPages(res.totalPages || 1);
      setPage(res.page || 1);
    } catch { setAgents([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === "candidates") loadCandidates();
    else loadAgents(1);
  }, [tab, trustFilter]);

  const openAction = (type, profile) => {
    setActionType(type);
    setActionId(profile._id);
    setActionName(profile.userId?.name || "Agente");
    setActionLevel(type === "promote"
      ? (profile.platformTrustLevel === "BASIC" ? "VERIFIED" : "TRUSTED")
      : (profile.platformTrustLevel === "TRUSTED" ? "VERIFIED" : "BASIC")
    );
    setActionReason("");
    setActionOpen(true);
  };

  const handleActionConfirm = async () => {
    if (!actionId) return;
    if ((actionType === "demote" || actionType === "suspend") && actionReason.trim().length < 3) {
      toast.warn("Motivo requerido (min 3 caracteres)"); return;
    }
    try {
      if (actionType === "promote") await promoteAgent(actionId, actionLevel, actionReason);
      else if (actionType === "demote") await demoteAgent(actionId, actionLevel, actionReason);
      else await suspendAgent(actionId, actionReason);

      toast.success(
        actionType === "promote" ? "Agente promovido"
        : actionType === "demote" ? "Agente degradado"
        : "Agente suspendido"
      );
      setActionOpen(false);
      if (tab === "candidates") loadCandidates(); else loadAgents(page);
    } catch (e) { toast.error(e?.response?.data?.message || "Error"); }
  };

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-80px)] overflow-y-auto">
      <h1 className="text-2xl font-bold">Niveles de confianza</h1>
      <p className="text-sm text-gray-500">Gestiona niveles de confianza de repartidores de la plataforma.</p>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <button onClick={() => setTab("candidates")} className={`px-4 py-2 text-sm font-medium rounded-t ${tab === "candidates" ? "bg-white border border-b-0 text-blue-600" : "text-gray-500"}`}>
          Candidatos a Verificado
        </button>
        <button onClick={() => setTab("agents")} className={`px-4 py-2 text-sm font-medium rounded-t ${tab === "agents" ? "bg-white border border-b-0 text-blue-600" : "text-gray-500"}`}>
          Todos los agentes
        </button>
      </div>

      {/* Tab: Candidatos */}
      {tab === "candidates" && (
        loading ? <p className="text-gray-500 py-8 text-center">Cargando...</p> : candidates.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No hay candidatos que cumplan los criterios para Verificado.</div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">{candidates.length} candidatos encontrados (50+ entregas, rating 4.5+, 0 incidentes)</p>
            {candidates.map((p) => {
              const user = p.userId || {};
              return (
                <div key={p._id} className="bg-white border rounded-lg px-4 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{user.name || "Agente"}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${TRUST_BADGE.BASIC}`}>Basico</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex gap-3">
                      <span>{p.stats?.totalDeliveries || 0} entregas</span>
                      <span>Rating: {p.stats?.rating?.toFixed(1) || "—"}</span>
                      <span>Incidentes: {p.stats?.incidentCount || 0}</span>
                      <span>Servicios: {p.approvedServiceTypes?.join(", ")}</span>
                    </div>
                  </div>
                  <button onClick={() => openAction("promote", p)}
                    className="bg-blue-600 text-white rounded px-3 py-1.5 text-xs font-medium hover:bg-blue-700">
                    Promover a Verificado
                  </button>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Tab: Todos los agentes */}
      {tab === "agents" && (
        <>
          <div className="flex gap-1 flex-wrap">
            {TRUST_LEVELS.map((l) => (
              <button key={l} onClick={() => setTrustFilter(l)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${trustFilter === l ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
                {TRUST_LEVEL_LABELS[l] || l}
              </button>
            ))}
          </div>

          {loading ? <p className="text-gray-500 py-8 text-center">Cargando...</p> : agents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No hay agentes.</div>
          ) : (
            <div className="bg-white border rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Agente</th>
                    <th className="text-center p-3">Nivel</th>
                    <th className="text-center p-3">Estado</th>
                    <th className="text-center p-3">Servicios</th>
                    <th className="text-right p-3">Entregas</th>
                    <th className="text-right p-3">Rating</th>
                    <th className="text-center p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((p) => {
                    const user = p.userId || {};
                    return (
                      <tr key={p._id} className="border-t hover:bg-gray-50">
                        <td className="p-3">
                          <p className="font-medium text-sm">{user.name || "—"}</p>
                          <p className="text-xs text-gray-400">{user.email || ""}</p>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${TRUST_BADGE[p.platformTrustLevel]}`}>
                            {TRUST_LABEL[p.platformTrustLevel] || p.platformTrustLevel}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${STATUS_BADGE[p.status] || ""}`}>
                            {STATUS_LABEL[p.status] || p.status}
                          </span>
                        </td>
                        <td className="p-3 text-center text-xs">{p.approvedServiceTypes?.join(", ") || "—"}</td>
                        <td className="p-3 text-right text-xs">{p.stats?.totalDeliveries || 0}</td>
                        <td className="p-3 text-right text-xs">{p.stats?.rating?.toFixed(1) || "—"}</td>
                        <td className="p-3 text-center">
                          <div className="flex gap-1 justify-center">
                            {p.platformTrustLevel !== "TRUSTED" && p.status === "ACTIVE" && (
                              <button onClick={() => openAction("promote", p)} className="text-blue-600 text-[11px] hover:underline">Promover</button>
                            )}
                            {p.platformTrustLevel !== "BASIC" && (
                              <button onClick={() => openAction("demote", p)} className="text-orange-600 text-[11px] hover:underline">Degradar</button>
                            )}
                            {p.status !== "SUSPENDED" && (
                              <button onClick={() => openAction("suspend", p)} className="text-red-600 text-[11px] hover:underline">Suspender</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-2">
              <button onClick={() => loadAgents(page - 1)} disabled={page <= 1} className="border rounded px-4 py-1 text-sm hover:bg-gray-50 disabled:opacity-30">Anterior</button>
              <span className="text-sm text-gray-500">Pagina {page} de {totalPages}</span>
              <button onClick={() => loadAgents(page + 1)} disabled={page >= totalPages} className="border rounded px-4 py-1 text-sm hover:bg-gray-50 disabled:opacity-30">Siguiente</button>
            </div>
          )}
        </>
      )}

      {/* Modal: Accion */}
      {actionOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold">
              {actionType === "promote" ? "Promover" : actionType === "demote" ? "Degradar" : "Suspender"} a {actionName}
            </h2>

            {actionType !== "suspend" && (
              <div>
                <label className="block text-sm font-medium mb-1">Nivel destino</label>
                <select value={actionLevel} onChange={(e) => setActionLevel(e.target.value)} className="w-full border rounded px-3 py-2">
                  {actionType === "promote"
                    ? [<option key="VERIFIED" value="VERIFIED">Verificado</option>, <option key="TRUSTED" value="TRUSTED">Confiable</option>]
                    : [<option key="BASIC" value="BASIC">Basico</option>, <option key="VERIFIED" value="VERIFIED">Verificado</option>]
                  }
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Motivo {actionType !== "promote" ? "*" : "(opcional)"}
              </label>
              <textarea autoFocus rows={2} value={actionReason} onChange={(e) => setActionReason(e.target.value)} className="w-full border rounded px-3 py-2"
                placeholder={actionType === "promote" ? "Buen desempeño..." : "Motivo de la accion..."} />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setActionOpen(false)} className="flex-1 border rounded py-2 text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={handleActionConfirm}
                disabled={(actionType !== "promote") && actionReason.trim().length < 3}
                className={`flex-1 text-white rounded py-2 text-sm font-medium disabled:opacity-50 ${
                  actionType === "promote" ? "bg-blue-600 hover:bg-blue-700"
                  : actionType === "demote" ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-red-600 hover:bg-red-700"
                }`}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
