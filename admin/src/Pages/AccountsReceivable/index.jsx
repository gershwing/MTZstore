import { useState, useEffect, useCallback } from "react";
import { fetchDataFromApi } from "../../utils/api";
import { getPendingSales, getPaymentsBySale, createSalePayment, deleteSalePayment, removeItemFromSale } from "../../services/salePayments";
import PaymentModal from "./PaymentModal";

const STATUS_LABELS = { CREDIT: "Sin pago", PARTIAL: "Pago parcial", PAID: "Pagado" };
const STATUS_COLORS = { CREDIT: "bg-red-100 text-red-700", PARTIAL: "bg-orange-100 text-orange-700", PAID: "bg-green-100 text-green-700" };
const METHOD_LABELS = { CASH: "Efectivo", TRANSFER: "Transferencia", QR: "QR", MIXED: "Mixto", OTHER: "Otro" };

export default function AccountsReceivablePage() {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({ totalDue: 0, count: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const loadPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPendingSales({ search, pageSize: 100 });
      setSales(res?.items || []);
      setSummary(res?.summary || { totalDue: 0, count: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { loadPending(); }, [loadPending]);

  const loadPayments = async (sale) => {
    try {
      // Cargar detalle completo de la venta (incluye items)
      const fullSaleRes = await fetchDataFromApi(`/api/direct-sales/${sale._id}`);
      const fullSale = fullSaleRes?.sale || sale;
      setSelectedSale(fullSale);
      const res = await getPaymentsBySale(sale._id);
      setPayments(res?.payments || []);
    } catch {
      setSelectedSale(sale);
      setPayments([]);
    }
  };

  const handlePayment = async (data) => {
    const res = await createSalePayment(data);
    if (res?.error || res?.success === false) {
      alert(res?.message || "Error al registrar abono");
      return;
    }
    setShowPaymentModal(false);
    await loadPending();
    if (selectedSale) await loadPayments({ ...selectedSale, ...res.saleUpdate });
  };

  const handleDeletePayment = async (paymentId) => {
    if (!confirm("Eliminar este abono? Se revertira el monto a la deuda.")) return;
    const res = await deleteSalePayment(paymentId);
    if (res?.success) {
      await loadPending();
      if (selectedSale) {
        const updated = await getPaymentsBySale(selectedSale._id);
        setPayments(updated?.payments || []);
      }
    }
  };

  const handleRemoveItem = async (productId, variantId) => {
    if (!selectedSale) return;
    if (!confirm("Eliminar este producto de la venta? Se restaurara el stock.")) return;
    try {
      const res = await removeItemFromSale(selectedSale._id, productId, variantId);
      if (res?.success) {
        await loadPending();
        if (res.sale) {
          setSelectedSale(res.sale);
        } else {
          await loadPayments(selectedSale);
        }
      } else {
        alert(res?.message || "Error al eliminar producto");
      }
    } catch (err) {
      alert(err?.message || "Error al eliminar producto");
    }
  };

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-80px)] overflow-y-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Cuentas por Cobrar</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="bg-red-50 border border-red-200 rounded px-3 py-1">
            Deuda total: <span className="font-bold text-red-700">Bs. {(summary.totalDue || 0).toFixed(2)}</span>
          </span>
          <span className="text-gray-500">{summary.count || 0} ventas pendientes</span>
        </div>
      </div>

      {/* Buscar */}
      <div className="bg-white border rounded-lg p-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cliente, telefono o numero de venta..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lista de deudas */}
        <div className="lg:col-span-2 space-y-2">
          {loading ? (
            <p className="text-gray-500 text-center py-8">Cargando...</p>
          ) : sales.length === 0 ? (
            <div className="bg-white border rounded-lg p-8 text-center">
              <p className="text-gray-500">No hay deudas pendientes</p>
            </div>
          ) : (
            sales.map((sale) => (
              <div
                key={sale._id}
                onClick={() => loadPayments(sale)}
                className={`bg-white border rounded-lg p-4 cursor-pointer hover:border-blue-300 transition-colors ${selectedSale?._id === sale._id ? "border-blue-500 ring-1 ring-blue-200" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{sale.customer?.name || "Sin nombre"}</p>
                    <p className="text-xs text-gray-500">{sale.saleNumber} | {new Date(sale.createdAt).toLocaleDateString("es-BO")}</p>
                    {sale.customer?.phone && <p className="text-xs text-gray-400">Tel: {sale.customer.phone}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_COLORS[sale.paymentStatus] || ""}`}>
                    {STATUS_LABELS[sale.paymentStatus] || sale.paymentStatus}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span>Total: <span className="font-medium">Bs. {(sale.total || 0).toFixed(2)}</span></span>
                  <span>Pagado: <span className="text-green-600 font-medium">Bs. {(sale.amountPaid || 0).toFixed(2)}</span></span>
                  <span>Debe: <span className="text-red-600 font-bold">Bs. {(sale.amountDue || 0).toFixed(2)}</span></span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detalle y abonos */}
        <div className="space-y-4">
          {selectedSale ? (
            <>
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-2">Detalle de deuda</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Cliente:</span> {selectedSale.customer?.name}</p>
                  <p><span className="text-gray-500">Venta:</span> {selectedSale.saleNumber}</p>
                  <p><span className="text-gray-500">Fecha:</span> {new Date(selectedSale.createdAt).toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" })}</p>
                  <p><span className="text-gray-500">Total:</span> Bs. {(selectedSale.total || 0).toFixed(2)}</p>
                  <p><span className="text-gray-500">Pagado:</span> <span className="text-green-600">Bs. {(selectedSale.amountPaid || 0).toFixed(2)}</span></p>
                  <p><span className="text-gray-500">Pendiente:</span> <span className="text-red-600 font-bold">Bs. {(selectedSale.amountDue || 0).toFixed(2)}</span></p>
                  {selectedSale.creditNote && <p><span className="text-gray-500">Nota:</span> {selectedSale.creditNote}</p>}
                </div>
                {selectedSale.paymentStatus !== "PAID" && (
                  <button
                    className="mt-3 w-full bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    Registrar abono
                  </button>
                )}
              </div>

              {/* Productos de la venta */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-2">Productos de la venta</h3>
                {(selectedSale.items || []).length === 0 ? (
                  <p className="text-gray-400 text-sm">Sin productos cargados</p>
                ) : (
                  <div className="space-y-2">
                    {selectedSale.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.nameSnapshot}</p>
                          <p className="text-xs text-gray-500">
                            {item.qty} x Bs. {Number(item.unitPrice || 0).toFixed(2)} = Bs. {Number(item.subtotal || 0).toFixed(2)}
                          </p>
                        </div>
                        {selectedSale.paymentStatus !== "PAID" && (selectedSale.items || []).length > 1 && (
                          <button
                            className="text-xs text-red-500 hover:text-red-700 ml-2 whitespace-nowrap"
                            onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.productId, item.variantId); }}
                          >
                            Quitar
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Historial de abonos */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-2">Historial de abonos</h3>
                {payments.length === 0 ? (
                  <p className="text-gray-400 text-sm">Sin abonos registrados</p>
                ) : (
                  <div className="space-y-2">
                    {payments.map((p) => (
                      <div key={p._id} className="flex items-center justify-between border-b pb-2 last:border-0">
                        <div>
                          <p className="text-sm font-medium">Bs. {(p.amount || 0).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">
                            {METHOD_LABELS[p.paymentMethod] || p.paymentMethod} | {new Date(p.createdAt).toLocaleDateString("es-BO", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          {p.note && <p className="text-xs text-gray-400">{p.note}</p>}
                        </div>
                        <button
                          className="text-xs text-red-500 hover:text-red-700"
                          onClick={() => handleDeletePayment(p._id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white border rounded-lg p-8 text-center">
              <p className="text-gray-400 text-sm">Selecciona una venta para ver el detalle</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de abono */}
      {showPaymentModal && selectedSale && (
        <PaymentModal
          sale={selectedSale}
          onConfirm={handlePayment}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}
