import { useState, useEffect } from "react";
import { fetchDataFromApi } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";
import SalesGrouped from "./SalesGrouped";
import SalesFilters from "./SalesFilters";

export default function SalesPage() {
  const { isSuper } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    searchCustomer: "",
  });
  const [grouped, setGrouped] = useState(null);

  useEffect(() => {
    loadSales();
  }, [filters]);

  const loadSales = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.searchCustomer) params.append("search", filters.searchCustomer);

      const res = await fetchDataFromApi(`/api/direct-sales?${params}`);
      const allSales = res?.items || res?.sales || [];

      const g = groupSalesByCategory(allSales);
      setGrouped(g);
      setSales(allSales);
    } catch (err) {
      console.error("Load sales error:", err);
      setSales([]);
      setGrouped(null);
    } finally {
      setLoading(false);
    }
  };

  const groupSalesByCategory = (allSales) => {
    const result = {
      platform: {
        label: "Ventas de plataforma",
        count: 0,
        total: 0,
        sales: [],
      },
      stores: {},
    };

    allSales.forEach((sale) => {
      const storeObj = sale.storeId && typeof sale.storeId === "object" ? sale.storeId : null;
      const sid = storeObj ? String(storeObj._id) : (sale.storeId ? String(sale.storeId) : null);

      if (!sid) {
        result.platform.sales.push(sale);
        result.platform.count += 1;
        result.platform.total += Number(sale.total || sale.totalBob || 0);
      } else {
        const storeName = storeObj?.name || sale.storeInfo?.name || "Tienda sin nombre";

        if (!result.stores[sid]) {
          result.stores[sid] = {
            label: `Ventas de ${storeName}`,
            storeName,
            storeId: sid,
            count: 0,
            total: 0,
            sales: [],
          };
        }

        result.stores[sid].sales.push(sale);
        result.stores[sid].count += 1;
        result.stores[sid].total += Number(sale.total || sale.totalBob || 0);
      }
    });

    return result;
  };

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-80px)] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Historial de Ventas</h1>
        <p className="text-sm text-gray-500">
          Total: {sales.length} ventas | Bs. {sales.reduce((sum, s) => sum + Number(s.total || s.totalBob || 0), 0).toFixed(2)}
        </p>
      </div>

      <SalesFilters filters={filters} setFilters={setFilters} />

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Cargando ventas...</p>
        </div>
      ) : (
        <SalesGrouped grouped={grouped} onRefresh={loadSales} isSuper={isSuper} />
      )}
    </div>
  );
}
