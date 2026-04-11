import { useState, useEffect } from "react";
import { fetchDataFromApi } from "../../utils/api";
import { listStores } from "../../services/stores";
import { getTenantId } from "../../utils/tenant";
import { useAuth } from "../../hooks/useAuth";
import PnLSelector from "./components/PnLSelector";
import PnLStatement from "./components/PnLStatement";
import { generatePnLPDF } from "./components/PnLPdf";

export default function ProfitLossPage() {
  const { isSuper } = useAuth();
  const today = new Date().toISOString().split("T")[0];
  const [period, setPeriod] = useState("month");
  const [date, setDate] = useState(today);
  // Si hay tenant activo (STORE_OWNER), usar su tienda; si es super, "all"
  const tenantId = getTenantId();
  const [storeId, setStoreId] = useState(tenantId && !isSuper ? tenantId : "all");
  const [stores, setStores] = useState([]);
  const [pnlData, setPnlData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSuper) {
      listStores({ limit: 100 }).then((res) => setStores(res?.data || [])).catch(() => {});
    }
  }, [isSuper]);

  useEffect(() => {
    loadPnL();
  }, [period, date, storeId]);

  const loadPnL = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period, date, storeId, _ts: Date.now() });
      const res = await fetchDataFromApi(`/api/profit-loss?${params}`);
      setPnlData(res?.pnlData || null);
    } catch (err) {
      console.error("P&L error:", err);
      setPnlData(null);
    } finally {
      setLoading(false);
    }
  };

  const storeName = storeId === "all"
    ? "Consolidado (todas las tiendas)"
    : storeId === "platform"
    ? "MTZstore (plataforma)"
    : stores.find((s) => String(s._id) === storeId)?.name || storeId;

  return (
    <div className="p-4 space-y-6 h-[calc(100vh-80px)] overflow-y-auto">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold">Estado de Resultados</h1>
        {pnlData && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                const pdf = generatePnLPDF(pnlData, storeName);
                pdf.save(`Estado_Resultados_${pnlData.periodLabel || "reporte"}.pdf`);
              }}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Descargar PDF
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Imprimir
            </button>
          </div>
        )}
      </div>

      <div className="print:hidden">
        <PnLSelector
          period={period}
          setPeriod={setPeriod}
          date={date}
          setDate={setDate}
          storeId={storeId}
          setStoreId={setStoreId}
          stores={stores}
          isSuper={isSuper}
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Calculando estado de resultados...</p>
        </div>
      ) : pnlData ? (
        <PnLStatement pnlData={pnlData} storeName={storeName} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Sin datos para el periodo seleccionado</p>
        </div>
      )}
    </div>
  );
}
