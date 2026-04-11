// admin/src/Pages/Reports/ReportsPage.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import ContentFilters from "../../components/Filters/ContentFilters";
import MetricCard from "../../components/KPI/MetricCard";
import { Button, MenuItem, Select } from "@mui/material";
import {
  getSalesSeries,
  getUsersSeries,
  getOrdersByStatus,
  getTopProducts,
  getDeliverySLA,
} from "../../services/reports";
import { exportCsv } from "../../utils/exportCsv";
import { exportElementToPdf } from "../../utils/exportPdf";
import { downloadWithAuth } from "../../utils/downloadBlob";

import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { fetchDataFromApi } from "../../utils/api";

const COLORS = ["#3872fa", "#ff5252", "#10b981", "#f59e0b", "#8b5cf6", "#14b8a6"];

export default function ReportsPage() {
  const [filters, setFilters] = useState({
    storeId: "",
    dateFrom: "",
    dateTo: "",
    q: "",
    status: "",
  });
  const [group, setGroup] = useState("day");
  const [currency, setCurrency] = useState("BOB");

  const [sales, setSales] = useState([]);            // [{ date, totalBob, totalUsd }]
  const [users, setUsers] = useState([]);            // [{ date, users }]
  const [byStatus, setByStatus] = useState([]);      // [{ status, count }]
  const [topProducts, setTopProducts] = useState([]); // [{ productId, name, qty, revenueBob, revenueUsd }]
  const [sla, setSla] = useState({ summary: null, series: [] }); // {summary:{avg,p50,p90,count}, series:[{date,avg,p50,p90}]}
  const [dsStats, setDsStats] = useState(null); // DirectSales stats

  const load = async () => {
    const common = {
      from: filters.dateFrom || undefined,
      to: filters.dateTo || undefined,
      storeId: filters.storeId || undefined,
      group,
    };
    const [sres, ures, ores, tres, dres] = await Promise.all([
      getSalesSeries({ ...common, currency }),
      getUsersSeries({ ...common }),
      getOrdersByStatus({ ...common }),
      getTopProducts({ ...common, limit: 10 }),
      getDeliverySLA({ ...common }),
    ]);

    const toArr = (v) => Array.isArray(v) ? v : Array.isArray(v?.data) ? v.data : Array.isArray(v?.monthlySales) ? v.monthlySales : Array.isArray(v?.series) ? v.series : [];
    setSales(toArr(sres?.data ?? sres));
    setUsers(toArr(ures?.data ?? ures));
    setByStatus(toArr(ores?.data ?? ores));
    setTopProducts(toArr(tres?.data ?? tres));
    const d = dres?.data || dres || {};
    setSla({
      summary: d.summary || null,
      series: d.series || [],
    });

    // Ventas Directas
    try {
      const today = new Date().toISOString().split("T")[0];
      const dsRes = await fetchDataFromApi(`/api/direct-sales/stats?period=month&date=${today}&_ts=${Date.now()}`);
      setDsStats(dsRes?.stats || null);
    } catch { setDsStats(null); }
  };

  useEffect(() => { load(); }, [group, currency]);
  useEffect(() => { load(); }, [JSON.stringify(filters)]);

  const kpiSales = useMemo(() => {
    const key = currency === "BOB" ? "totalBob" : "totalUsd";
    const total = (sales || []).reduce((acc, x) => acc + (Number(x?.[key]) || 0), 0);
    return total;
  }, [sales, currency]);

  const kpiUsers = useMemo(
    () => (users || []).reduce((a, x) => a + (Number(x?.users) || 0), 0),
    [users]
  );

  const kpiOrders = useMemo(
    () => (byStatus || []).reduce((a, x) => a + (Number(x?.count) || 0), 0),
    [byStatus]
  );

  const salesUsersData = useMemo(() => {
    const map = new Map();
    (sales || []).forEach((s) => {
      const k = s.date || s._id || s.day;
      const v = map.get(k) || { date: k };
      v.Sales = Number(currency === "BOB" ? s.totalBob : s.totalUsd) || 0;
      map.set(k, v);
    });
    (users || []).forEach((u) => {
      const k = u.date || u._id || u.day;
      const v = map.get(k) || { date: k };
      v.Users = Number(u.users) || 0;
      map.set(k, v);
    });
    return Array.from(map.values()).sort((a, b) =>
      String(a.date).localeCompare(String(b.date))
    );
  }, [sales, users, currency]);

  const exportTopProducts = () => {
    exportCsv(
      `top-products-${currency}-${group}`,
      (topProducts || []).map((r) => ({
        productId: r.productId,
        name: r.name,
        qty: r.qty,
        revenue: currency === "BOB" ? r.revenueBob : r.revenueUsd,
      }))
    );
  };

  const exportOrdersByStatus = () => {
    exportCsv(
      `orders-by-status-${group}`,
      (byStatus || []).map((r) => ({
        status: r.status,
        count: r.count,
      }))
    );
  };

  const exportSLA = () => {
    exportCsv(
      `delivery-sla-${group}`,
      (sla.series || []).map((it) => ({
        date: it.date,
        avg_minutes: it.avg,
        p50_minutes: it.p50,
        p90_minutes: it.p90,
      }))
    );
  };

  // ---- DESCARGA PDF DESDE EL SERVIDOR (con token) ----
  const downloadPdfFromServer = async () => {
    const q = new URLSearchParams({
      storeId: filters.storeId || "",
      from: filters.dateFrom || "",
      to: filters.dateTo || "",
      group,
      currency,
    }).toString();

    try {
      await downloadWithAuth(`/api/report/export.pdf?${q}`, `reporte-${group}-${currency}.pdf`);
      // context.alertBox("success", "PDF descargado"); // opcional
    } catch (err) {
      console.error(err);
      // context.alertBox("error", "No se pudo descargar el PDF"); // opcional
    }
  };

  // ---- DESCARGA CSV DESDE EL SERVIDOR (con token) ----
  const downloadCsvFromServer = async () => {
    const q = new URLSearchParams({
      storeId: filters.storeId || "",
      from: filters.dateFrom || "",
      to: filters.dateTo || "",
      group,
    }).toString();
    try {
      await downloadWithAuth(`/api/report/export.csv?${q}`, `reporte-${group}.csv`, {
        headers: { Accept: "text/csv" },
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-[20px] font-semibold">Reportes & Métricas</h1>

      {/* Filtros generales */}
      <div className="bg-white rounded-2xl shadow p-3">
        <ContentFilters
          value={filters}
          onChange={(patch) => setFilters((v) => ({ ...v, ...patch }))}
          showSearch={false}
          showDates={true}
          showStore={true}
        />

        <div className="flex flex-wrap items-center gap-3 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">Agrupar:</span>
            <Select size="small" value={group} onChange={(e) => setGroup(e.target.value)}>
              <MenuItem value="day">Día</MenuItem>
              <MenuItem value="month">Mes</MenuItem>
              <MenuItem value="year">Año</MenuItem>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Moneda:</span>
            <Select size="small" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <MenuItem value="BOB">BOB</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
            </Select>
          </div>

          {/* Acciones de exportación alineadas a la derecha */}
          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            {/* Vista de impresión (servidor) */}
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                const q = new URLSearchParams({
                  storeId: filters.storeId || "",
                  from: filters.dateFrom || "",
                  to: filters.dateTo || "",
                  group,
                  currency,
                }).toString();
                window.open(`/reports/print?${q}`, "_blank");
              }}
            >
              Ver/Imprimir (PDF)
            </Button>

            {/* Descargar PDF generado por el servidor */}
            <Button size="small" variant="outlined" onClick={downloadPdfFromServer}>
              Descargar PDF (servidor)
            </Button>

            {/* Descargar CSV (servidor) */}
            <Button size="small" variant="outlined" onClick={downloadCsvFromServer}>
              Descargar CSV
            </Button>

            {/* Descargar PDF del DOM (cliente) */}
            <Button
              size="small"
              variant="contained"
              onClick={() => exportElementToPdf("report-root", `reporte-${group}-${currency}.pdf`)}
            >
              Descargar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* -------- INICIO: contenido exportable -------- */}
      <div id="report-root" className="space-y-4">
        {/* Ventas Directas — al inicio */}
        {dsStats && (
          <div className="space-y-4">
            <h2 className="text-[18px] font-[600]">Ventas Directas (este mes)</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard title="Total ventas (Bs.)" value={`Bs. ${Number(dsStats.totalSales || 0).toFixed(2)}`} />
              <MetricCard title="Transacciones" value={dsStats.salesCount || 0} />
              <MetricCard title="Items vendidos" value={dsStats.totalItems || 0} />
              <MetricCard title="Ticket promedio" value={`Bs. ${Number(dsStats.avgTicket || 0).toFixed(2)}`} />
            </div>

            {dsStats.salesByDay?.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-4">
                <div className="font-semibold mb-2">Evolución de ventas directas</div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dsStats.salesByDay}>
                      <defs>
                        <linearGradient id="colorDsReport" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => `Bs. ${Number(v).toFixed(2)}`} />
                      <Area type="monotone" dataKey="sales" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorDsReport)" name="Ventas (Bs.)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {dsStats.topProducts?.length > 0 && (
                <div className="bg-white rounded-2xl shadow p-4">
                  <div className="font-semibold mb-2">Top productos (ventas directas)</div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left">Producto</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Revenue (Bs.)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dsStats.topProducts.map((p, i) => (
                        <tr key={i} className="border-b">
                          <td className="px-3 py-2 text-xs">{p.name}</td>
                          <td className="px-3 py-2 text-right">{p.qty}</td>
                          <td className="px-3 py-2 text-right font-medium">Bs. {Number(p.revenue || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {dsStats.paymentMethods?.length > 0 && (
                <div className="bg-white rounded-2xl shadow p-4">
                  <div className="font-semibold mb-2">Metodos de pago (ventas directas)</div>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dsStats.paymentMethods} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="method" tick={{ fontSize: 11 }} width={90} />
                        <Tooltip formatter={(v) => `Bs. ${Number(v).toFixed(2)}`} />
                        <Bar dataKey="amount" fill="#8B5CF6" radius={[0, 8, 8, 0]} name="Monto" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---- PEDIDOS (E-COMMERCE) ---- */}
        <h2 className="text-[18px] font-[600] mt-4">Pedidos (E-commerce)</h2>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard title={`Ventas (${currency})`} value={new Intl.NumberFormat().format(kpiSales)} />
          <MetricCard title="Pedidos (total)" value={new Intl.NumberFormat().format(kpiOrders)} />
          <MetricCard title="Usuarios nuevos" value={new Intl.NumberFormat().format(kpiUsers)} />
          <MetricCard
            title="Delivery SLA"
            value={sla?.summary ? `${Math.round(sla.summary.avg)} min` : "—"}
            subtitle={
              sla?.summary
                ? `P50 ${Math.round(sla.summary.p50)} • P90 ${Math.round(sla.summary.p90)} • N=${sla.summary.count}`
                : ""
            }
          />
        </div>

        {/* Serie: Ventas vs Usuarios */}
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Ventas vs Usuarios</div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesUsersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Sales" />
                <Line type="monotone" dataKey="Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Barras: Pedidos por estado */}
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Pedidos por estado</div>
            <Button size="small" variant="outlined" onClick={exportOrdersByStatus}>
              Exportar CSV
            </Button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top productos */}
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Top productos</div>
            <Button size="small" variant="outlined" onClick={exportTopProducts}>
              Exportar CSV
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tabla simple */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Producto</th>
                    <th className="px-3 py-2 text-right">Unidades</th>
                    <th className="px-3 py-2 text-right">Revenue ({currency})</th>
                  </tr>
                </thead>
                <tbody>
                  {(topProducts || []).map((p) => (
                    <tr key={p.productId} className="border-b">
                      <td className="px-3 py-2">{p.name || p.productName || p.productId}</td>
                      <td className="px-3 py-2 text-right">{p.qty}</td>
                      <td className="px-3 py-2 text-right">
                        {new Intl.NumberFormat().format(
                          currency === "BOB" ? p.revenueBob : p.revenueUsd
                        )}
                      </td>
                    </tr>
                  ))}
                  {(!topProducts || topProducts.length === 0) && (
                    <tr>
                      <td className="px-3 py-4 text-gray-500" colSpan={3}>
                        Sin datos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pie (proporción por revenue) */}
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={(topProducts || []).map((tp) => ({
                      name: tp.name || tp.productName || tp.productId,
                      value: currency === "BOB" ? tp.revenueBob : tp.revenueUsd,
                    }))}
                    dataKey="value"
                    nameKey="name"
                    outerRadius="80%"
                    label
                  >
                    {(topProducts || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SLA de Delivery */}
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Delivery SLA (minutos)</div>
            <Button size="small" variant="outlined" onClick={exportSLA}>
              Exportar CSV
            </Button>
          </div>

          {sla?.series?.length ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sla.series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avg" />
                  <Line type="monotone" dataKey="p50" />
                  <Line type="monotone" dataKey="p90" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Sin datos en el rango seleccionado.</div>
          )}
        </div>
      </div>
      {/* -------- FIN: contenido exportable -------- */}
    </div>
  );
}
