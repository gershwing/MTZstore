// admin/src/Pages/Orders/index.jsx
import React, { useEffect, useState } from "react";
import { Button, Pagination } from "@mui/material";
import { FaAngleDown, FaAngleRight } from "react-icons/fa6";
import { GoTrash } from "react-icons/go";

import { useAuth } from "../../hooks/useAuth";
import { api } from "../../utils/api";
import { formatPrice } from "../../utils/formatPrice";

const PAYMENT_METHODS = {
  PayPal: "PayPal",
  CashBOB: "Contra entrega",
  Cryptomus: "Cryptomus",
  "": "Contra entrega",
};

const PAY_STATUS = {
  CAPTURED: { label: "Pagado", cls: "bg-green-100 text-green-700" },
  PAID: { label: "Pagado", cls: "bg-green-100 text-green-700" },
  COMPLETED: { label: "Pagado", cls: "bg-green-100 text-green-700" },
  COMPLETE: { label: "Pagado", cls: "bg-green-100 text-green-700" },
  CREATED: { label: "Pendiente", cls: "bg-yellow-100 text-yellow-700" },
  PENDING: { label: "Pendiente", cls: "bg-yellow-100 text-yellow-700" },
  AUTHORIZED: { label: "Autorizado", cls: "bg-blue-100 text-blue-700" },
  FAILED: { label: "Fallido", cls: "bg-red-100 text-red-700" },
  CANCELED: { label: "Cancelado", cls: "bg-gray-100 text-gray-700" },
  "CASH ON DELIVERY": { label: "Contra entrega", cls: "bg-amber-100 text-amber-700" },
  NONE: { label: "---", cls: "bg-gray-100 text-gray-500" },
};

const SHIPPING_LABELS = {
  MTZSTORE_EXPRESS: { label: "Express", cls: "bg-purple-100 text-purple-700" },
  MTZSTORE_STANDARD: { label: "Estándar", cls: "bg-blue-100 text-blue-700" },
  STORE_EXPRESS: { label: "Tienda Express", cls: "bg-orange-100 text-orange-700" },
  STORE_STANDARD: { label: "Tienda Estándar", cls: "bg-teal-100 text-teal-700" },
  STORE: { label: "Tienda", cls: "bg-gray-100 text-gray-600" },
};

const SHIPPING_PAGE_TITLES = {
  MTZSTORE_EXPRESS: "MTZstore Express",
  MTZSTORE_STANDARD: "MTZstore Estándar",
  STORE_EXPRESS: "Mi tienda Express",
  STORE_STANDARD: "Mi tienda Estándar",
};

const ORDER_STATUS_LABELS = {
  created: "Creado",
  confirm: "Confirmado",
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default function OrdersPage({ shippingFilter } = {}) {
  const { alertBox, viewer, isSuper: authIsSuper } = useAuth();

  const me = viewer || {};
  const roles = Array.isArray(me?.roles) ? me.roles : [];
  const isSuper =
    authIsSuper ||
    !!me?.isSuper ||
    !!me?.isPlatformSuperAdmin ||
    roles.includes("SUPER_ADMIN") ||
    String(me?.role || "").toUpperCase() === "SUPER_ADMIN";

  // ---- Filtros ----
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [q, setQ] = useState("");

  // ---- Datos ----
  const [orders, setOrders] = useState([]);
  const [pageMeta, setPageMeta] = useState({ totalPages: 1, page: 1 });
  const [isLoading, setIsLoading] = useState(false);

  // ---- Agrupación (super admin) ----
  const [grouped, setGrouped] = useState(null);
  const [expanded, setExpanded] = useState({ platform: true });

  // === Helpers ===
  const getTotal = (order) => {
    const bob = Number(order?.totalBob);
    if (Number.isFinite(bob) && bob > 0) return bob;
    const legacy = Number(order?.totalAmt);
    if (Number.isFinite(legacy) && legacy > 0) return legacy;
    return 0;
  };

  const getPaymentStatus = (order) =>
    order?.paymentStatus || order?.paymentSummary?.lastStatus || order?.payment_status || "NONE";

  const getPaymentMethod = (order) => {
    const m = order?.paymentMethod || "";
    if (PAYMENT_METHODS[m]) return PAYMENT_METHODS[m];
    if (String(order?.payment_status || "").toUpperCase().includes("CASH")) return "Contra entrega";
    return m || "Contra entrega";
  };

  // === Agrupar por tienda ===
  const groupOrdersByStore = (orderList) => {
    const platform = { label: "Órdenes de plataforma", orders: [], count: 0, total: 0 };
    const stores = {};

    for (const order of orderList) {
      const sid = order?.storeId?._id || (typeof order?.storeId === "string" ? order.storeId : null);
      const storeName = order?.storeId?.name || null;
      const total = getTotal(order);

      if (!sid || !storeName) {
        platform.orders.push(order);
        platform.count += 1;
        platform.total += total;
      } else {
        const key = String(sid);
        if (!stores[key]) {
          stores[key] = { label: storeName, orders: [], count: 0, total: 0 };
        }
        stores[key].orders.push(order);
        stores[key].count += 1;
        stores[key].total += total;
      }
    }

    return { platform, stores };
  };

  // === Carga ===
  const load = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = { page, limit: 20, q, status, dateFrom, dateTo };
      if (shippingFilter) params.shippingMethod = shippingFilter;
      const config = isSuper ? { params, __noTenant: true } : { params };

      const res = await api.get("/api/order/order-list", config);
      const body = res?.data?.data || res?.data || {};
      const list = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
      setOrders(list);
      setPageMeta({ totalPages: body?.totalPages || res?.data?.totalPages || 1, page });

      if (isSuper) {
        setGrouped(groupOrdersByStore(list));
      }
    } catch {
      alertBox?.("error", "No se pudieron cargar las órdenes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(1); }, [shippingFilter]); // eslint-disable-line

  const applyFilters = () => load(1);
  const toggleExpand = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  // === Update status ===
  const updateOrderStatus = async (id, value) => {
    try {
      await api.patch(`/api/order/order-status/${id}`, { order_status: value });
      alertBox?.("success", "Estado actualizado");
      setOrders((prev) => prev.map((o) => (o?._id === id ? { ...o, order_status: value } : o)));
      if (isSuper && grouped) {
        const updated = orders.map((o) => (o?._id === id ? { ...o, order_status: value } : o));
        setGrouped(groupOrdersByStore(updated));
      }
    } catch {
      alertBox?.("error", "No se pudo actualizar el estado");
    }
  };

  // === Eliminar ===
  const deleteOrder = async (id) => {
    if (!window.confirm("¿Eliminar esta orden?")) return;
    try {
      await api.delete(`/api/order/deleteOrder/${id}`);
      alertBox?.("success", "Orden eliminada");
      load(pageMeta.page);
    } catch {
      alertBox?.("error", "No se pudo eliminar");
    }
  };

  // === Limpiar órdenes sin tienda ===
  const cleanPlatformOrders = async () => {
    if (!grouped?.platform?.orders?.length) return;
    if (!window.confirm(`¿Eliminar ${grouped.platform.count} órdenes sin tienda asociada? Esta acción no se puede deshacer.`)) return;

    let deleted = 0;
    for (const order of grouped.platform.orders) {
      try {
        await api.delete(`/api/order/deleteOrder/${order._id}`);
        deleted++;
      } catch { /* continuar */ }
    }
    alertBox?.("success", `${deleted} órdenes eliminadas`);
    load(pageMeta.page);
  };

  // === CSV export ===
  const exportVisibleToCSV = () => {
    const rows = (orders || []).map((o) => ({
      order_id: o?._id || "",
      fecha: (o?.createdAt || "").split("T")[0],
      tienda: o?.storeId?.name || "Plataforma",
      cliente: o?.userId?.name || "",
      email: o?.userId?.email || "",
      items: o?.products?.length || 0,
      total_bob: getTotal(o),
      metodo_pago: getPaymentMethod(o),
      tipo_envio: SHIPPING_LABELS[o?.shippingMethod]?.label || o?.shippingMethod || "",
      estado_pago: getPaymentStatus(o),
      estado_pedido: o?.order_status || "",
    }));

    const headers = Object.keys(rows[0] || {});
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const suffix = shippingFilter ? `_${shippingFilter.toLowerCase()}` : "";
    a.download = `ordenes${suffix}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // === Tabla de órdenes (una fila por orden) ===
  const renderOrdersTable = (rawList) => {
    const orderList = Array.isArray(rawList) ? rawList : [];
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">N° Orden</th>
              <th className="text-left p-3">Fecha</th>
              <th className="text-left p-3">Cliente</th>
              <th className="text-center p-3">Items</th>
              <th className="text-right p-3">Total (Bs.)</th>
              <th className="text-left p-3">Método pago</th>
              <th className="text-center p-3">Envío</th>
              <th className="text-center p-3">Estado pago</th>
              <th className="text-center p-3">Estado pedido</th>
              <th className="text-center p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orderList.map((order) => {
              const payStatus = getPaymentStatus(order);
              const ps = PAY_STATUS[payStatus.toUpperCase()] || PAY_STATUS.NONE;

              return (
                <tr key={order?._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-blue-600 font-bold text-xs">
                    {order?._id?.slice(-10)?.toUpperCase()}
                  </td>
                  <td className="p-3 text-xs whitespace-nowrap">
                    {new Date(order?.createdAt).toLocaleDateString("es-BO")}{" "}
                    {new Date(order?.createdAt).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="p-3">
                    <p className="font-medium text-sm">{order?.userId?.name || "---"}</p>
                    {order?.userId?.email && (
                      <p className="text-xs text-gray-500">{order.userId.email}</p>
                    )}
                  </td>
                  <td className="p-3 text-center">{order?.products?.length || 0}</td>
                  <td className="p-3 text-right font-bold">
                    {formatPrice(getTotal(order), "BOB")}
                  </td>
                  <td className="p-3 text-xs">{getPaymentMethod(order)}</td>
                  <td className="p-3 text-center">
                    {(() => {
                      const sh = SHIPPING_LABELS[order?.shippingMethod] || { label: order?.shippingMethod || "---", cls: "bg-gray-100 text-gray-500" };
                      return <span className={`text-xs font-medium px-2 py-0.5 rounded ${sh.cls}`}>{sh.label}</span>;
                    })()}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${ps.cls}`}>
                      {ps.label}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <select
                      value={order?.order_status || "created"}
                      onChange={(e) => updateOrderStatus(order?._id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                      {Object.entries(ORDER_STATUS_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => deleteOrder(order?._id)}
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar orden"
                    >
                      <GoTrash size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {orderList.length === 0 && (
              <tr>
                <td className="p-3 py-6 text-center text-gray-500" colSpan={10}>
                  Sin órdenes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // === Render ===
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-3 gap-2">
        <h1 className="text-xl font-semibold">
          {shippingFilter ? SHIPPING_PAGE_TITLES[shippingFilter] || "Órdenes en línea" : "Órdenes en línea"}
        </h1>
        <Button variant="outlined" onClick={exportVisibleToCSV}>
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className="border rounded px-2 py-1"
          placeholder="Buscar cliente/email/ID"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border rounded px-2 py-1"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Todos los estados</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <input type="date" className="border rounded px-2 py-1" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" className="border rounded px-2 py-1" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        <Button className="!px-3 !py-1 !normal-case" variant="outlined" onClick={applyFilters}>
          Aplicar
        </Button>
      </div>

      {isLoading && <div className="text-center py-8 text-gray-500">Cargando...</div>}

      {/* Vista agrupada (super admin) */}
      {isSuper && grouped && !isLoading && (
        <div className="space-y-4">
          {/* Órdenes de plataforma */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div
              className="p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
              onClick={() => toggleExpand("platform")}
            >
              <div className="flex items-center gap-3 flex-1">
                {expanded["platform"] ? (
                  <FaAngleDown size={16} className="text-gray-600" />
                ) : (
                  <FaAngleRight size={16} className="text-gray-600" />
                )}
                <h2 className="font-semibold text-gray-900">{grouped.platform.label}</h2>
                <span className="ml-2 bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                  {grouped.platform.count}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">
                  {formatPrice(grouped.platform.total, "BOB")}
                </span>
                {grouped.platform.count > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); cleanPlatformOrders(); }}
                    className="text-xs text-red-500 hover:text-red-700 hover:underline"
                    title="Eliminar órdenes sin tienda"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {expanded["platform"] && (
              <div className="border-t">
                {grouped.platform.orders.length > 0
                  ? renderOrdersTable(grouped.platform.orders)
                  : <div className="p-4 text-center text-gray-500 text-sm">Sin órdenes de plataforma</div>
                }
              </div>
            )}
          </div>

          {/* Órdenes por tienda */}
          {Object.keys(grouped.stores).map((storeId) => {
            const storeGroup = grouped.stores[storeId];
            const isExp = expanded[storeId] ?? true;

            return (
              <div key={storeId} className="bg-white border rounded-lg overflow-hidden">
                <div
                  className="p-4 cursor-pointer bg-blue-50 hover:bg-blue-100 flex items-center justify-between"
                  onClick={() => toggleExpand(storeId)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {isExp ? (
                      <FaAngleDown size={16} className="text-blue-600" />
                    ) : (
                      <FaAngleRight size={16} className="text-blue-600" />
                    )}
                    <h2 className="font-semibold text-blue-900">{storeGroup.label}</h2>
                    <span className="ml-2 bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {storeGroup.count}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-blue-700">
                    {formatPrice(storeGroup.total, "BOB")}
                  </div>
                </div>

                {isExp && (
                  <div className="border-t">
                    {storeGroup.orders.length > 0
                      ? renderOrdersTable(storeGroup.orders)
                      : <div className="p-4 text-center text-gray-500 text-sm">Sin órdenes en esta tienda</div>
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Vista normal (store admin) */}
      {!isSuper && !isLoading && (
        <div className="bg-white border rounded-lg overflow-hidden">
          {renderOrdersTable(orders)}
        </div>
      )}

      {/* Paginación */}
      {pageMeta.totalPages > 1 && (
        <div className="flex items-center justify-center mt-6">
          <Pagination
            showFirstButton showLastButton
            count={pageMeta.totalPages}
            page={pageMeta.page}
            onChange={(e, value) => load(value)}
          />
        </div>
      )}
    </div>
  );
}
