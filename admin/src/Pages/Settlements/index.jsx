import { useState, useEffect, useCallback } from "react";
import { Tabs, Tab } from "@mui/material";
import Badge from "../../Components/Badge";
import { listSettlements, getPendingSettlements, paySettlement } from "../../services/settlements";

const r = (n) => Number(n || 0).toFixed(2);

export default function SettlementsPage() {
  const [tab, setTab] = useState(0);

  // Pendientes
  const [pending, setPending] = useState([]);
  const [pendLoading, setPendLoading] = useState(false);

  // Historial
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histFilter, setHistFilter] = useState(""); // status filter

  const loadPending = useCallback(async () => {
    setPendLoading(true);
    try {
      const res = await getPendingSettlements();
      const payload = res?.data || res;
      setPending(payload?.data || []);
    } catch {
      setPending([]);
    } finally {
      setPendLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const params = { limit: 50 };
      if (histFilter) params.status = histFilter;
      const res = await listSettlements(params);
      const payload = res?.data || res;
      setHistory(payload?.data || []);
    } catch {
      setHistory([]);
    } finally {
      setHistLoading(false);
    }
  }, [histFilter]);

  useEffect(() => {
    if (tab === 0) loadPending();
    if (tab === 1) loadHistory();
  }, [tab, loadPending, loadHistory]);

  const handlePay = async (settlementId, storeName) => {
    const notes = prompt(`Notas para la liquidacion de ${storeName} (opcional):`);
    if (notes === null) return; // cancelled
    try {
      const res = await paySettlement(settlementId, { notes });
      if (res?.error) throw new Error(res.message);
      alert("Liquidacion marcada como pagada");
      loadPending();
    } catch (err) {
      alert(err?.message || "Error al liberar pago");
    }
  };

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-80px)] overflow-y-auto">
      <h1 className="text-2xl font-bold">Liquidaciones</h1>

      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Pendientes" />
        <Tab label="Historial" />
      </Tabs>

      {/* ========== TAB 0: PENDIENTES ========== */}
      {tab === 0 && (
        <div className="space-y-4">
          {pendLoading ? (
            <p className="text-gray-500">Cargando...</p>
          ) : pending.length === 0 ? (
            <div className="bg-white border rounded-lg p-8 text-center">
              <p className="text-gray-500">No hay liquidaciones pendientes</p>
            </div>
          ) : (
            pending.map((group) => (
              <div key={group.storeId} className="bg-white border rounded-lg overflow-hidden">
                <div className="p-4 bg-blue-50 border-b flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-blue-900">{group.storeName}</h2>
                    {group.storeEmail && <p className="text-xs text-blue-600">{group.storeEmail}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total pendiente</p>
                    <p className="text-xl font-bold text-blue-700">Bs. {r(group.totalPendingBOB)}</p>
                    {group.totalPendingUSD > 0 && (
                      <p className="text-xs text-gray-500">$ {r(group.totalPendingUSD)} USD</p>
                    )}
                  </div>
                </div>

                <div className="divide-y">
                  {group.settlements.map((s) => (
                    <div key={s._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge kind="settlement" status={s.status} />
                          <span className="text-sm font-medium">
                            Bs. {r(s.amountBOB)} {s.amountUSD > 0 && `($ ${r(s.amountUSD)})`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {s.notes || `Periodo: ${new Date(s.periodFrom).toLocaleDateString()} - ${new Date(s.periodTo).toLocaleDateString()}`}
                        </p>
                        {s.metrics && (
                          <div className="text-xs text-gray-400 mt-1 flex gap-3">
                            <span>Bruto: ${r(s.metrics.grossUSD)}</span>
                            <span>Comision ({s.metrics.commissionPct || 10}%): ${r(s.metrics.feesUSD)}</span>
                            <span>Neto: ${r(s.metrics.netUSD)}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handlePay(s._id, group.storeName)}
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700"
                      >
                        Liberar pago
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========== TAB 1: HISTORIAL ========== */}
      {tab === 1 && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {["", "PENDING", "PAID", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setHistFilter(st)}
                className={`px-3 py-1 rounded text-sm border ${histFilter === st ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              >
                {st || "Todos"}
              </button>
            ))}
          </div>

          {histLoading ? (
            <p className="text-gray-500">Cargando...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-500">No hay liquidaciones.</p>
          ) : (
            <div className="bg-white border rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3">Tienda</th>
                    <th className="text-left p-3">Periodo</th>
                    <th className="text-right p-3">Bruto USD</th>
                    <th className="text-right p-3">Comision</th>
                    <th className="text-right p-3">Neto USD</th>
                    <th className="text-right p-3">Neto BOB</th>
                    <th className="text-center p-3">Estado</th>
                    <th className="text-left p-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((s) => (
                    <tr key={s._id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{s.storeId?.name || s.storeId || "—"}</td>
                      <td className="p-3 text-xs">
                        {new Date(s.periodFrom).toLocaleDateString()} - {new Date(s.periodTo).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">${r(s.metrics?.grossUSD)}</td>
                      <td className="p-3 text-right text-red-600">${r(s.metrics?.feesUSD)}</td>
                      <td className="p-3 text-right font-medium">${r(s.amountUSD)}</td>
                      <td className="p-3 text-right font-medium">Bs. {r(s.amountBOB)}</td>
                      <td className="p-3 text-center">
                        <Badge kind="settlement" status={s.status} />
                      </td>
                      <td className="p-3 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
