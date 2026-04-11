// admin/src/Pages/Reports/ReportsPrint.jsx
import React, { useEffect, useState } from "react";
import {
  getSalesSeries, getUsersSeries, getOrdersByStatus, getTopProducts, getDeliverySLA
} from "../../services/reports";

export default function ReportsPrint() {
  const [data, setData] = useState(null);

  // lee filtros desde query (?storeId=...&from=...&to=...&group=day&currency=BOB)
  const params = new URLSearchParams(window.location.search);
  const storeId = params.get("storeId") || undefined;
  const from = params.get("from") || undefined;
  const to = params.get("to") || undefined;
  const group = params.get("group") || "day";
  const currency = params.get("currency") || "BOB";

  useEffect(() => {
    (async () => {
      const common = { storeId, from, to, group };
      const [sales, users, byStatus, top, sla] = await Promise.all([
        getSalesSeries({ ...common, currency }),
        getUsersSeries(common),
        getOrdersByStatus(common),
        getTopProducts({ ...common, limit: 15 }),
        getDeliverySLA(common),
      ]);
      setData({ sales, users, byStatus, top, sla, currency, group, from, to });
      // fuerza modo claro para imprimir
      document.documentElement.setAttribute("data-theme", "light");
    })();
  }, []); // eslint-disable-line

  if (!data) return <div className="p-6">Preparando vista de impresión…</div>;

  const k = data.currency === "BOB" ? "totalBob" : "totalUsd";
  const totalSales = (data.sales?.data || data.sales || []).reduce((a, x) => a + (+x[k] || 0), 0);
  const totalUsers = (data.users?.data || data.users || []).reduce((a, x) => a + (+x.users || 0), 0);
  const totalOrders = (data.byStatus?.data || data.byStatus || []).reduce((a, x) => a + (+x.count || 0), 0);
  const slaSummary = (data.sla?.data || data.sla || {}).summary;

  return (
    <div className="print-container">
      <header className="no-print p-3 flex items-center gap-2 bg-white shadow">
        <button className="btn" onClick={() => window.print()}>Imprimir / Guardar PDF</button>
      </header>

      <section className="sheet">
        <h1 className="title">Reporte — {data.from || "inicio"} a {data.to || "hoy"}</h1>
        <div className="kpis">
          <div><div>Ventas ({data.currency})</div><b>{new Intl.NumberFormat().format(totalSales)}</b></div>
          <div><div>Pedidos</div><b>{totalOrders}</b></div>
          <div><div>Usuarios nuevos</div><b>{totalUsers}</b></div>
          <div><div>Delivery SLA</div>
            <b>{slaSummary ? `${Math.round(slaSummary.avg)} min` : "—"}</b>
            <small>{slaSummary ? `P50 ${Math.round(slaSummary.p50)} • P90 ${Math.round(slaSummary.p90)} • N=${slaSummary.count}` : ""}</small>
          </div>
        </div>

        {/* Tabla: Pedidos por estado */}
        <h2>Pedidos por estado</h2>
        <table>
          <thead><tr><th>Estado</th><th className="ta-right">Cantidad</th></tr></thead>
          <tbody>
            {(data.byStatus?.data || data.byStatus || []).map((r, i) => (
              <tr key={i}><td>{r.status}</td><td className="ta-right">{r.count}</td></tr>
            ))}
          </tbody>
        </table>

        {/* Quebrador de página */}
        <div className="page-break" />

        {/* Tabla: Top productos */}
        <h2>Top productos</h2>
        <table>
          <thead>
            <tr><th>Producto</th><th className="ta-right">Unidades</th><th className="ta-right">Revenue ({data.currency})</th></tr>
          </thead>
          <tbody>
            {(data.top?.data || data.top || []).map((p) => (
              <tr key={p.productId}>
                <td>{p.name || p.productName || p.productId}</td>
                <td className="ta-right">{p.qty}</td>
                <td className="ta-right">{new Intl.NumberFormat().format(data.currency === "BOB" ? p.revenueBob : p.revenueUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tabla: SLA por fecha (si hay) */}
        {(data.sla?.data?.series || data.sla?.series || []).length > 0 && <>
          <div className="page-break" />
          <h2>Delivery SLA por {data.group}</h2>
          <table>
            <thead>
              <tr><th>Fecha</th><th className="ta-right">Avg</th><th className="ta-right">P50</th><th className="ta-right">P90</th><th className="ta-right">N</th></tr>
            </thead>
            <tbody>
              {(data.sla?.data?.series || data.sla?.series || []).map((d, i) => (
                <tr key={i}>
                  <td>{d.date}</td>
                  <td className="ta-right">{Math.round(d.avg)}</td>
                  <td className="ta-right">{Math.round(d.p50)}</td>
                  <td className="ta-right">{Math.round(d.p90)}</td>
                  <td className="ta-right">{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>}
      </section>
    </div>
  );
}
