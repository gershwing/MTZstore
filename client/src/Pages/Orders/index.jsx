import React, { useEffect, useState } from "react";
import AccountSidebar from "../../components/AccountSidebar";
import { fetchDataFromApi, patchData } from "../../utils/api";
import Pagination from "@mui/material/Pagination";
import Dialog from "@mui/material/Dialog";
import { formatPrice } from "../../utils/formatPrice";

const STATUS_LABELS = {
  created: { label: "Creado", cls: "bg-yellow-100 text-yellow-700" },
  confirm: { label: "Confirmado", cls: "bg-blue-100 text-blue-700" },
  processing: { label: "Procesando", cls: "bg-indigo-100 text-indigo-700" },
  shipped: { label: "Enviado", cls: "bg-purple-100 text-purple-700" },
  delivered: { label: "Entregado", cls: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelado", cls: "bg-red-100 text-red-700" },
};

const PAYMENT_LABELS = {
  PayPal: "PayPal",
  CashBOB: "Contra entrega",
  Cryptomus: "Cryptomus",
};

const CANCEL_WINDOW_MS = 30 * 60 * 1000; // 30 minutos

const canCancel = (order) => {
  const s = (order?.order_status || "").toLowerCase();
  if (["delivered", "cancelled", "shipped"].includes(s)) return false;

  const method = order?.shippingMethod || "MTZSTORE_STANDARD";
  if (method === "MTZSTORE_EXPRESS") {
    // Express: cancelable si no hay delivery tomada (verificamos en backend,
    // pero en frontend mostramos el boton si status es "created" o "confirm")
    return ["created", "confirm"].includes(s);
  }

  // Standard/Store: cancelable dentro de 30 minutos
  const elapsed = Date.now() - new Date(order?.createdAt).getTime();
  return elapsed < CANCEL_WINDOW_MS;
};

const Orders = () => {
  const [orders, setOrders] = useState({ data: [], totalPages: 1 });
  const [page, setPage] = useState(1);
  const [cancelling, setCancelling] = useState(null);
  const [cancelModal, setCancelModal] = useState({ open: false, id: null, title: "" });
  const [cancelError, setCancelError] = useState("");

  const loadOrders = () => {
    fetchDataFromApi(`/api/order/order-list/orders?page=${page}&limit=5`).then((res) => {
      if (res?.error === false) {
        const inner = res?.data;
        const list = Array.isArray(inner?.data) ? inner.data : Array.isArray(inner) ? inner : [];
        setOrders({
          data: list,
          totalPages: inner?.totalPages || res?.totalPages || 1,
        });
      }
    });
  };

  useEffect(() => { loadOrders(); }, [page]);

  const openCancelModal = (order) => {
    const title = order?.products?.[0]?.productTitle || "tu pedido";
    setCancelError("");
    setCancelModal({ open: true, id: order._id, title });
  };

  const closeCancelModal = () => {
    setCancelModal({ open: false, id: null, title: "" });
    setCancelError("");
  };

  const confirmCancel = async () => {
    const orderId = cancelModal.id;
    if (!orderId) return;
    setCancelling(orderId);
    setCancelError("");
    try {
      const res = await patchData(`/api/order/${orderId}/cancel`, {});
      if (res?.error) {
        // details tiene el mensaje real de validacion (ej. { status: "El tiempo..." })
        const details = res?.details;
        const msg = details
          ? (typeof details === "object" ? Object.values(details).join(". ") : details)
          : res?.message || "No se pudo cancelar el pedido";
        setCancelError(typeof msg === "object" ? JSON.stringify(msg) : msg);
        setCancelling(null);
        return;
      }
      closeCancelModal();
      loadOrders();
    } catch {
      setCancelError("Error al cancelar el pedido");
    } finally {
      setCancelling(null);
    }
  };

  const getTotal = (order) => {
    const bob = Number(order?.totalBob);
    if (Number.isFinite(bob) && bob > 0) return bob;
    const legacy = Number(order?.totalAmt);
    if (Number.isFinite(legacy) && legacy > 0) return legacy;
    return 0;
  };

  const getPaymentMethod = (order) => {
    const m = order?.paymentMethod || "";
    if (PAYMENT_LABELS[m]) return PAYMENT_LABELS[m];
    if (String(order?.payment_status || "").toUpperCase().includes("CASH")) return "Contra entrega";
    return m || "Contra entrega";
  };

  const getStatus = (order) => {
    const s = (order?.order_status || "created").toLowerCase();
    return STATUS_LABELS[s] || STATUS_LABELS.created;
  };

  const getProductSummary = (order) => {
    const products = order?.products || [];
    if (products.length === 0) return null;
    const first = products[0];
    const remaining = products.length - 1;
    return { first, remaining, total: products.length };
  };

  const list = Array.isArray(orders?.data) ? orders.data : [];

  return (
    <section className="py-5 lg:py-10 w-full">
      <div className="container flex flex-col lg:flex-row gap-5">
        <div className="col1 w-[20%] hidden lg:block">
          <AccountSidebar />
        </div>

        <div className="col2 w-full lg:flex-1">
          <div className="shadow-md rounded-md bg-white">
            <div className="py-5 px-5 border-b border-[rgba(0,0,0,0.1)]">
              <h2 className="text-[20px] font-semibold">Mis pedidos</h2>
              <p className="mt-0 mb-0 text-gray-500 text-sm">
                {list.length > 0
                  ? <>Tienes <span className="font-bold text-primary">{list.length}</span> pedido{list.length !== 1 ? "s" : ""}</>
                  : "No tienes pedidos aún"
                }
              </p>
            </div>

            {/* Lista de pedidos */}
            <div className="divide-y divide-gray-100">
              {list.map((order) => {
                const ps = getProductSummary(order);
                const status = getStatus(order);
                const total = getTotal(order);
                const showCancel = canCancel(order);

                return (
                  <div key={order?._id} className="p-5 hover:bg-gray-50 transition-colors">
                    {/* Header: N° seguimiento + fecha + estado */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">N° seguimiento</span>
                        <span className="font-mono text-sm font-bold text-primary">
                          {order?._id?.slice(-10)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">
                          {new Date(order?.createdAt).toLocaleDateString("es-BO", {
                            day: "2-digit", month: "short", year: "numeric"
                          })}
                        </span>
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${status.cls}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Producto principal */}
                    {ps && (
                      <div className="flex items-center gap-4">
                        {/* Imagen */}
                        <div className="w-[60px] h-[60px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {ps.first?.image ? (
                            <img
                              src={ps.first.image}
                              alt={ps.first.productTitle || ""}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                              Sin img
                            </div>
                          )}
                        </div>

                        {/* Info del producto */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {ps.first?.productTitle || "Producto"}
                          </p>
                          {(ps.first?.size || ps.first?.ram || ps.first?.weight) && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {[ps.first?.size, ps.first?.ram, ps.first?.weight].filter(Boolean).join(" / ")}
                            </p>
                          )}
                          {ps.remaining > 0 && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              y {ps.remaining} producto{ps.remaining > 1 ? "s" : ""} más
                            </p>
                          )}
                        </div>

                        {/* Cantidad */}
                        <div className="text-center flex-shrink-0 hidden sm:block">
                          <p className="text-xs text-gray-400">Cant.</p>
                          <p className="font-semibold text-sm">
                            {order?.products?.reduce((sum, p) => sum + (Number(p?.quantity) || 0), 0)}
                          </p>
                        </div>

                        {/* Método de pago */}
                        <div className="text-center flex-shrink-0 hidden md:block">
                          <p className="text-xs text-gray-400">Pago</p>
                          <p className="text-sm font-medium">{getPaymentMethod(order)}</p>
                        </div>

                        {/* Total */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-400">Total</p>
                          <p className="font-bold text-sm text-primary">
                            {formatPrice(total, "BOB")}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Boton Cancelar */}
                    {showCancel && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => openCancelModal(order)}
                          disabled={cancelling === order._id}
                          className="text-xs px-4 py-1.5 rounded-full border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {cancelling === order._id ? "Cancelando..." : "Cancelar pedido"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {list.length === 0 && (
                <div className="p-10 text-center text-gray-400">
                  <p className="text-lg">No tienes pedidos aún</p>
                  <p className="text-sm">Cuando realices una compra, aparecerá aquí.</p>
                </div>
              )}
            </div>

            {/* Paginación */}
            {orders?.totalPages > 1 && (
              <div className="flex items-center justify-center py-5 border-t border-gray-100">
                <Pagination
                  showFirstButton
                  showLastButton
                  count={orders.totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modal de confirmacion de cancelacion */}
      <Dialog open={cancelModal.open} onClose={closeCancelModal} maxWidth="xs" fullWidth>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Cancelar pedido</h3>
              <p className="text-sm text-gray-500 mt-0.5">Esta accion no se puede deshacer</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-1">
            Estas a punto de cancelar:
          </p>
          <p className="text-sm font-medium text-gray-900 mb-4">
            {cancelModal.title}
          </p>

          {cancelError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {cancelError}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={closeCancelModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Volver
            </button>
            <button
              onClick={confirmCancel}
              disabled={cancelling}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {cancelling ? "Cancelando..." : "Si, cancelar pedido"}
            </button>
          </div>
        </div>
      </Dialog>
    </section>
  );
};

export default Orders;
