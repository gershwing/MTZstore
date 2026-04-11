import { useState } from "react";
import { Button } from "@mui/material";
import { postData } from "../../utils/api";
import { useDirectSale } from "./hooks/useDirectSale";
import useCurrentStore from "../../hooks/useCurrentStore";
import ProductSearcher from "./components/ProductSearcher";
import SaleLineTable from "./components/SaleLineTable";
import SaleSummary from "./components/SaleSummary";
import CustomerSearcher from "./components/CustomerSearcher";
import SaleResultModal from "./components/SaleResultModal";

export default function DirectSalesPage() {
  const sale = useDirectSale();
  const { store } = useCurrentStore();
  const wholesaleEnabled = !!store?.config?.wholesaleEnabled;
  const [saving, setSaving] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleConfirm = async () => {
    if (!selectedCustomer) { alert("Selecciona un cliente"); return; }
    if (!sale.items.length) { alert("Agrega al menos un producto"); return; }

    const creditMsg = sale.isCredit
      ? `\n(A crédito: pago inicial Bs. ${(sale.initialPayment || 0).toFixed(2)}, deuda Bs. ${Math.max(0, sale.totals.totalBob - (sale.initialPayment || 0)).toFixed(2)})`
      : "";
    if (!confirm(`Confirmar venta por Bs. ${sale.totals.totalBob.toFixed(2)}?${creditMsg}`)) return;

    setSaving(true);
    try {
      const payload = {
        items: sale.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId || null,
          qty: Number(i.qty) || 1,
          pricingMode: i.pricingMode,
          unitPrice: i.unitPriceBob,
        })),
        customer: {
          name: selectedCustomer.nombre,
          phone: selectedCustomer.phone || "",
          document: selectedCustomer.document || "",
          email: selectedCustomer.email || "",
        },
        contactId: selectedCustomer.contactId,
        userId: selectedCustomer.userId || null,
        currency: "BOB",
        ivaEnabled: sale.ivaEnabled,
        ivaPct: sale.ivaPct,
        itEnabled: sale.itEnabled,
        itPct: sale.itPct,
        paymentMethod: sale.paymentMethod,
        paymentBreakdown: sale.paymentMethod === "MIXED" ? sale.paymentBreakdown : [],
        paymentNotes: sale.paymentNotes,
        notes: sale.notes,
        isCredit: sale.isCredit,
        initialPayment: sale.isCredit ? sale.initialPayment : undefined,
        creditNote: sale.isCredit ? sale.creditNote : undefined,
      };

      const res = await postData("/api/direct-sales", payload);

      if (res?.error || res?.success === false) {
        throw new Error(res?.message || "Error al guardar");
      }

      const savedSale = res?.sale || res?.data?.sale;
      setCompletedSale(savedSale);
      sale.clearAll();
      setSelectedCustomer(null);
    } catch (err) {
      alert(err?.message || "Error al registrar la venta");
    } finally {
      setSaving(false);
    }
  };

  if (completedSale) {
    return (
      <SaleResultModal
        sale={completedSale}
        onNewSale={() => setCompletedSale(null)}
      />
    );
  }

  return (
    <div className="p-4 space-y-6 h-[calc(100vh-80px)] overflow-y-auto">
      <h1 className="text-2xl font-bold">Ventas Directas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cliente */}
          <div className="bg-white border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Cliente</h2>
            <CustomerSearcher
              selected={selectedCustomer}
              onSelect={setSelectedCustomer}
              onClear={() => setSelectedCustomer(null)}
            />
          </div>

          {/* Buscar producto */}
          <div className="bg-white border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Buscar producto</h2>
            <ProductSearcher onAddProduct={sale.addItem} bobPerUsd={sale.bobPerUsd} wholesaleEnabled={wholesaleEnabled} />
          </div>

          {/* Productos en la venta */}
          <div className="bg-white border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Productos en la venta</h2>
            <SaleLineTable
              items={sale.items}
              onUpdateQty={sale.updateItemQty}
              onUpdatePricing={sale.updateItemPricing}
              onRemove={sale.removeItem}
              wholesaleEnabled={wholesaleEnabled}
            />
          </div>

          {/* Pago y notas */}
          <div className="bg-white border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm">Pago</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Método de pago *</label>
                <select value={sale.paymentMethod} onChange={(e) => sale.setPaymentMethod(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="CASH">Efectivo</option>
                  <option value="TRANSFER">Transferencia</option>
                  <option value="QR">QR</option>
                  <option value="MIXED">Mixto</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>
              {sale.paymentMethod === "OTHER" && (
                <div>
                  <label className="block text-xs font-medium mb-1">Detalle de pago</label>
                  <input value={sale.paymentNotes} onChange={(e) => sale.setPaymentNotes(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Ej: cheque, otro medio..." />
                </div>
              )}
            </div>

            {/* Desglose para pago Mixto */}
            {sale.paymentMethod === "MIXED" && (
              <div className="border rounded p-3 bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Desglose de pago mixto</label>
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => sale.setPaymentBreakdown([...sale.paymentBreakdown, { method: "CASH", amount: 0, note: "" }])}
                  >
                    + Agregar método
                  </button>
                </div>
                {sale.paymentBreakdown.map((bd, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select
                      value={bd.method}
                      onChange={(e) => {
                        const updated = [...sale.paymentBreakdown];
                        updated[idx] = { ...updated[idx], method: e.target.value };
                        sale.setPaymentBreakdown(updated);
                      }}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="CASH">Efectivo</option>
                      <option value="TRANSFER">Transferencia</option>
                      <option value="QR">QR</option>
                      <option value="OTHER">Otro</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Monto Bs."
                      value={bd.amount || ""}
                      onChange={(e) => {
                        const updated = [...sale.paymentBreakdown];
                        updated[idx] = { ...updated[idx], amount: Number(e.target.value) || 0 };
                        sale.setPaymentBreakdown(updated);
                      }}
                      className="border rounded px-2 py-1 text-sm w-28"
                    />
                    <input
                      placeholder="Nota"
                      value={bd.note || ""}
                      onChange={(e) => {
                        const updated = [...sale.paymentBreakdown];
                        updated[idx] = { ...updated[idx], note: e.target.value };
                        sale.setPaymentBreakdown(updated);
                      }}
                      className="border rounded px-2 py-1 text-sm flex-1"
                    />
                    <button
                      type="button"
                      className="text-red-500 text-sm hover:text-red-700"
                      onClick={() => sale.setPaymentBreakdown(sale.paymentBreakdown.filter((_, i) => i !== idx))}
                    >
                      X
                    </button>
                  </div>
                ))}
                {sale.paymentBreakdown.length > 0 && (
                  <p className="text-xs text-gray-500">
                    Total desglose: Bs. {sale.paymentBreakdown.reduce((s, b) => s + (b.amount || 0), 0).toFixed(2)}
                    {sale.totals.totalBob > 0 && (
                      <span className={sale.paymentBreakdown.reduce((s, b) => s + (b.amount || 0), 0).toFixed(2) === sale.totals.totalBob.toFixed(2) ? " text-green-600" : " text-orange-500"}>
                        {" "}/ Total venta: Bs. {sale.totals.totalBob.toFixed(2)}
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* Opción de crédito */}
            <div className="border rounded p-3 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sale.isCredit}
                  onChange={(e) => sale.setIsCredit(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">Venta a crédito</span>
              </label>
              {sale.isCredit && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Pago inicial (Bs.)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      max={sale.totals.totalBob}
                      value={sale.initialPayment || ""}
                      onChange={(e) => sale.setInitialPayment(Number(e.target.value) || 0)}
                      className="w-full border rounded px-3 py-2"
                      placeholder="0.00"
                    />
                    {sale.totals.totalBob > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Deuda pendiente: <span className="font-semibold text-orange-600">Bs. {Math.max(0, sale.totals.totalBob - (sale.initialPayment || 0)).toFixed(2)}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Nota de crédito</label>
                    <input
                      value={sale.creditNote}
                      onChange={(e) => sale.setCreditNote(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      placeholder="Ej: paga el resto la próxima semana"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Notas (opcional)</label>
              <textarea value={sale.notes} onChange={(e) => sale.setNotes(e.target.value)} rows={2} className="w-full border rounded px-3 py-2" placeholder="Observaciones..." />
            </div>
          </div>
        </div>

        {/* Columna resumen */}
        <div className="space-y-4">
          <SaleSummary
            totals={sale.totals}
            ivaEnabled={sale.ivaEnabled}
            setIvaEnabled={sale.setIvaEnabled}
            ivaPct={sale.ivaPct}
            itEnabled={sale.itEnabled}
            setItEnabled={sale.setItEnabled}
            itPct={sale.itPct}
          />

          <Button
            variant="contained"
            fullWidth
            size="large"
            disabled={saving || !sale.items.length || !selectedCustomer}
            onClick={handleConfirm}
          >
            {saving ? "Guardando..." : "Confirmar venta"}
          </Button>

          {sale.items.length > 0 && (
            <Button variant="outlined" fullWidth onClick={() => { sale.clearAll(); setSelectedCustomer(null); }}>
              Limpiar todo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
