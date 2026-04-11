// admin/src/Pages/Dashboard/index.jsx
import React, { useState, useContext, useEffect } from "react";
import DashboardBoxes from "../../Components/DashboardBoxes";
import { FaPlus } from "react-icons/fa6";
import { Button } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, ResponsiveContainer } from "recharts";

import { AppContext } from "../../context/AppContext";
import UIContext from "../../context/UIContext";
import { api } from "../../utils/api";

const Dashboard = () => {
  const [page] = React.useState(0);
  const [rowsPerPage] = React.useState(50);

  const [chartData, setChartData] = useState([]);
  const [chartGroup, setChartGroup] = useState("month"); // day | month | year
  const [chartCurrency, setChartCurrency] = useState("BOB"); // USD | BOB

  const [productData, setProductData] = useState([]);
  const [productTotalData, setProductTotalData] = useState([]);

  const [users, setUsers] = useState([]);       // solo super
  const [allReviews, setAllReviews] = useState([]); // solo super
  const [ordersCount, setOrdersCount] = useState(null);
  const [dsStats, setDsStats] = useState(null);

  const context = useContext(AppContext);    // datos/usuario
  const ui = useContext(UIContext) || {};    // UI
  const authReady = Boolean(context?.authReady);

  // ——— identidad / roles
  const me = context?.userData || context?.viewer || context?.user || {};
  const roles = Array.isArray(me?.roles) ? me.roles : [];
  const isSuper =
    !!me?.isSuper ||
    !!me?.isPlatformSuperAdmin ||
    roles.includes("SUPER_ADMIN") ||
    String(me?.role || "").toUpperCase() === "SUPER_ADMIN";

  // ===== storeId reactivo (lee de localStorage y escucha eventos)
  const [storeId, setStoreId] = useState(() => {
    try { return localStorage.getItem("X-Store-Id") || ""; } catch { return ""; }
  });
  useEffect(() => {
    const update = () => {
      try {
        const sid = localStorage.getItem("X-Store-Id") || "";
        setStoreId((prev) => (prev === sid ? prev : sid));
      } catch { }
    };
    try {
      window.addEventListener("tenant:changed", update);
      window.addEventListener("mtz:tenant-changed", update);
      window.addEventListener("auth:updated", update);
    } catch { }
    return () => {
      try {
        window.removeEventListener("tenant:changed", update);
        window.removeEventListener("mtz:tenant-changed", update);
        window.removeEventListener("auth:updated", update);
      } catch { }
    };
  }, []);

  // --- Headers/Tenant condicional (usa storeId reactivo)
  const getTenantHeaders = () => {
    // SUPER_ADMIN nunca manda X-Store-Id
    if (isSuper) return {};
    return storeId ? { "X-Store-Id": String(storeId) } : {};
  };

  // Agrega scope=all sólo para super
  const withScope = (url) => (isSuper ? (url.includes("?") ? `${url}&scope=all` : `${url}?scope=all`) : url);

  // Cache-busting: agrega _ts para evitar 304 stale
  const fresh = (url) => {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}_ts=${Date.now()}`;
  };

  /* ===================== CARGAS ===================== */

  // PRODUCTS — ahora también para SUPER (global con scope=all y SIN X-Store-Id)
  useEffect(() => {
    if (!authReady) return;
    // Si no es super y aún no hay tenant, no cargamos
    if (!isSuper && !storeId) return;

    ui?.setProgress?.(30);
    (async () => {
      try {
        const res = await api.get(
          fresh(withScope(`/api/product/getAllProducts?page=${page + 1}&limit=${rowsPerPage}`)),
          { headers: { ...getTenantHeaders() } }
        );
        const data = res?.data?.data || res?.data || {};
        setProductData(data);
        setProductTotalData(data);
      } catch {
        setProductData({});
        setProductTotalData({});
      } finally {
        ui?.setProgress?.(100);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, isSuper, storeId, page, rowsPerPage]);

  // ORDERS COUNT (para KPIs)
  useEffect(() => {
    if (!authReady) return;
    if (!isSuper && !storeId) return;

    api.get(fresh(withScope(`/api/order/count`)), {
      headers: { ...getTenantHeaders() },
    }).then((cntRes) => {
      const cntRoot = cntRes?.data || {};
      if (cntRoot?.error === false || cntRoot?.count != null) {
        setOrdersCount(Number(cntRoot?.count ?? 0));
      }
    }).catch(() => setOrdersCount(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, isSuper, storeId]);

  // USERS & REVIEWS — SOLO SUPER_ADMIN (evita 403 para vendedores)
  useEffect(() => {
    if (!authReady) return;
    if (!isSuper) return; // ⛔ sólo super

    api.get(fresh(withScope(`/api/user/getAllUsers`)))
      .then((res) => {
        const root = res?.data || {};
        if (root?.error === false && Array.isArray(root?.users)) setUsers(root.users);
        else if (Array.isArray(root)) setUsers(root);
        else setUsers([]);
      })
      .catch(() => setUsers([]));

    api.get(fresh(withScope(`/api/user/getAllReviews`)))
      .then((res) => {
        const root = res?.data || {};
        if (root?.error === false && Array.isArray(root?.reviews)) setAllReviews(root.reviews);
        else if (Array.isArray(root)) setAllReviews(root);
        else setAllReviews([]);
      })
      .catch(() => setAllReviews([]));
  }, [authReady, isSuper]);

  // DIRECT SALES STATS
  useEffect(() => {
    if (!authReady) return;
    if (!isSuper && !storeId) return;
    const today = new Date().toISOString().split("T")[0];
    api.get(fresh(`/api/direct-sales/stats?period=month&date=${today}`), {
      headers: { ...getTenantHeaders() },
    })
      .then((res) => setDsStats(res?.data?.stats || null))
      .catch(() => setDsStats(null));
  }, [authReady, isSuper, storeId]);

  // CHART: ventas/usuarios por grupo/moneda — super global / tienda con tenant
  useEffect(() => {
    if (!authReady) return;
    if (!isSuper && !storeId) return;

    refreshSalesChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, isSuper, storeId, chartGroup, chartCurrency]);

  const getProducts = async (p, limit) => {
    try {
      const res = await api.get(
        fresh(withScope(`/api/product/getAllProducts?page=${p + 1}&limit=${limit}`)),
        { headers: { ...getTenantHeaders() } }
      );
      const data = res?.data?.data || res?.data || {};
      setProductData(data);
      setProductTotalData(data);
      ui?.setProgress?.(100);
    } catch {
      setProductData({});
      setProductTotalData({});
    }
  };

  // Usuarios por año (global si super; tienda si no)
  const getTotalUsersByYear = () => {
    if (!authReady) return;
    if (!isSuper && !storeId) return;

    api.get(fresh(withScope(`/api/order/users`)), { headers: { ...getTenantHeaders() } })
      .then((res) => {
        const root = res?.data || {};
        const base = Array.isArray(root?.TotalUsers) ? root.TotalUsers
          : Array.isArray(root?.series) ? root.series
            : Array.isArray(root) ? root
              : [];
        const usersArr = base.map((it) => ({
          name: String(it?.name ?? it?.label ?? ""),
          TotalUsers: parseInt(it?.TotalUsers ?? it?.value ?? 0),
        }));
        const uniqueArr = usersArr.filter(
          (obj, index, self) => index === self.findIndex((t) => t.name === obj.name)
        );
        setChartData(uniqueArr);
      })
      .catch(() => setChartData([]));
  };

  const refreshSalesChart = () => {
    api.get(fresh(withScope(`/api/order/sales?group=${chartGroup}&currency=${chartCurrency}`)), {
      headers: { ...getTenantHeaders() },
    })
      .then((res) => {
        const root = res?.data || {};
        const raw = Array.isArray(root?.monthlySales) ? root.monthlySales
          : Array.isArray(root?.series) ? root.series
            : Array.isArray(root) ? root
              : [];
        const sales = raw.map((it) => ({
          name: String(it?.name ?? it?.label ?? ""),
          TotalSales: parseInt(it?.TotalSales ?? it?.value ?? 0),
        })).filter(Boolean);
        const uniqueArr = sales.filter(
          (obj, index, self) => index === self.findIndex((t) => t.name === obj.name)
        );
        setChartData(uniqueArr);
      })
      .catch(() => setChartData([]));
  };

  const openPanel = context?.openPanel || ui?.openPanel;

  return (
    <>
      <div className="w-full py-4 lg:py-1 px-5 border bg-[#f1faff] border-[rgba(0,0,0,0.1)] flex items-center gap-8 mb-5 justify-between rounded-md">
        <div className="info">
          <h1 className="text-[26px] lg:text-[35px] font-bold leading-8 lg:leading-10 mb-3">
            ¡Bienvenido(a)!<br />
            <span className="text-primary">{me?.name}</span>
          </h1>
          <p>
            {authReady
              ? `Esto es lo que está pasando hoy ${isSuper ? "en todas las tiendas" : "en tu tienda"}.`
              : "Cargando…"}
          </p>
          {!isSuper && (
            <>
              <br />
              <Button
                className="btn-blue btn !capitalize"
                onClick={() =>
                  (openPanel ? openPanel("/products/new") : window.location.assign("/products/new"))
                }
              >
                <FaPlus /> Añadir producto
              </Button>
            </>
          )}
        </div>

        <img src="/shop-illustration.webp" className="w-[250px] hidden lg:block" />
      </div>

      {/* KPIs (solo si tenemos datos suficientes) */}
      {Array.isArray(productData?.products) &&
        productData.products.length !== 0 &&
        (isSuper ? users?.length !== 0 : true) && (
          <DashboardBoxes
            orders={ordersCount}
            products={productData?.products?.length}
            users={isSuper ? users?.length : undefined}
            reviews={isSuper ? allReviews?.length : undefined}
            category={context?.catData?.length}
          />
        )}


      {/* Gráfico (solo super admin - e-commerce) */}
      {isSuper && <div className="card my-4 shadow-md sm:rounded-lg bg-white">
        <div className="flex items-center justify-between px-5 py-5 pb-0">
          <h2 className="text-[18px] font-[600]">Usuarios totales y Ventas totales (global)</h2>

          <div className="flex items-center gap-3">
            <select
              className="border rounded-md px-2 py-1"
              value={chartGroup}
              onChange={(e) => setChartGroup(e.target.value)}
              title="Agrupación"
            >
              <option value="day">Día</option>
              <option value="month">Mes</option>
              <option value="year">Año</option>
            </select>

            <select
              className="border rounded-md px-2 py-1"
              value={chartCurrency}
              onChange={(e) => setChartCurrency(e.target.value)}
              title="Moneda"
            >
              <option value="BOB">BOB</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-5 px-5 py-5 pt-1">
          <span className="flex items-center gap-1 text-[15px] cursor-pointer" onClick={getTotalUsersByYear}>
            <span className="block w-[8px] h-[8px] rounded-full bg-primary"></span>
            Usuarios totales
          </span>

          <span className="flex items-center gap-1 text-[15px] cursor-pointer" onClick={() => refreshSalesChart()}>
            <span className="block w-[8px] h-[8px] rounded-full bg-green-600"></span>
            Ventas totales
          </span>
        </div>

        <div className="px-5 overflow-x-scroll">
          {chartData?.length !== 0 && (
            <BarChart
              width={(ui?.windowWidth ?? 1200) > 920 ? (ui?.windowWidth ?? 1200) - 350 : 800}
              height={500}
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <XAxis
                dataKey="name"
                scale="point"
                padding={{ left: 10, right: 10 }}
                tick={{ fontSize: 12 }}
                label={{ position: "insideBottom", fontSize: 14 }}
                style={{ fill: ui?.theme === "dark" ? "white" : "#000" }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{ position: "insideBottom", fontSize: 14 }}
                style={{ fill: ui?.theme === "dark" ? "white" : "#000" }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#071739", color: "white" }}
                labelStyle={{ color: "yellow" }}
                itemStyle={{ color: "cyan" }}
                cursor={{ fill: "white" }}
              />
              <Legend />
              <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={false} />
              <Bar dataKey="TotalSales" stackId="a" fill="#16a34a" />
              <Bar dataKey="TotalUsers" stackId="b" fill="#0858f7" />
            </BarChart>
          )}
        </div>
      </div>}

      {/* ===================== VENTAS DIRECTAS ===================== */}
      {dsStats && (
        <div className="space-y-4 mt-4">
          <h2 className="text-[18px] font-[600] px-1">Ventas Directas (este mes)</h2>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
              <p className="text-xs text-gray-500">Total ventas</p>
              <p className="text-xl font-bold text-blue-600">Bs. {Number(dsStats.totalSales || 0).toFixed(2)}</p>
              <p className="text-xs text-gray-400">{dsStats.salesCount} transacciones</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
              <p className="text-xs text-gray-500">Utilidad estimada</p>
              <p className="text-xl font-bold text-green-600">Bs. {Number(dsStats.totalProfit || 0).toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
              <p className="text-xs text-gray-500">Items vendidos</p>
              <p className="text-xl font-bold text-purple-600">{dsStats.totalItems || 0}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-amber-500">
              <p className="text-xs text-gray-500">Ticket promedio</p>
              <p className="text-xl font-bold text-amber-600">Bs. {Number(dsStats.avgTicket || 0).toFixed(2)}</p>
            </div>
          </div>

          {/* Gráfico: Evolución de ventas por día */}
          {dsStats.salesByDay?.length > 0 && (
            <div className="card shadow-md sm:rounded-lg bg-white p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Evolución de ventas directas</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dsStats.salesByDay}>
                  <defs>
                    <linearGradient id="colorDsSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val) => `Bs. ${Number(val).toFixed(2)}`} />
                  <Area type="monotone" dataKey="sales" stroke="#3B82F6" fillOpacity={1} fill="url(#colorDsSales)" name="Ventas (Bs.)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top 5 productos */}
            {dsStats.topProducts?.length > 0 && (
              <div className="card shadow-md sm:rounded-lg bg-white p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Top 5 productos</h3>
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-xs">
                    <tr>
                      <th className="text-left p-2">Producto</th>
                      <th className="text-center p-2">Qty</th>
                      <th className="text-right p-2">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dsStats.topProducts.map((p, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2 text-xs">{p.name}</td>
                        <td className="p-2 text-center">{p.qty}</td>
                        <td className="p-2 text-right font-medium">Bs. {Number(p.revenue || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Métodos de pago */}
            {dsStats.paymentMethods?.length > 0 && (
              <div className="card shadow-md sm:rounded-lg bg-white p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Metodos de pago</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dsStats.paymentMethods} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="method" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip formatter={(val) => `Bs. ${Number(val).toFixed(2)}`} />
                    <Bar dataKey="amount" fill="#8B5CF6" radius={[0, 8, 8, 0]} name="Monto" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
