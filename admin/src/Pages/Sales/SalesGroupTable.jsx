import { useState } from "react";
import { GoTrash } from "react-icons/go";
import { useAuth } from "../../hooks/useAuth";
import { deleteData } from "../../utils/api";
import SaleDetailModal from "./SaleDetailModal";
import { generateReceiptPDF } from "../DirectSales/components/SaleReceiptPDF";

const PAYMENT = { CASH: "Efectivo", TRANSFER: "Transferencia", QR: "QR", MIXED: "Mixto", OTHER: "Otro" };
const PAY_STATUS = { PAID: { label: "Pagado", cls: "bg-green-100 text-green-700" }, PARTIAL: { label: "Parcial", cls: "bg-orange-100 text-orange-700" }, CREDIT: { label: "Crédito", cls: "bg-red-100 text-red-700" } };

export default function SalesGroupTable({ sales, onRefresh }) {
  const [selected, setSelected] = useState(null);
  const { isSuper } = useAuth();

  const handlePDF = (sale) => {
    const pdf = generateReceiptPDF(sale, sale.storeInfo);
    pdf.save(`${sale.saleNumber}.pdf`);
  };

  const handleDelete = async (saleId) => {
    if (!confirm("¿Eliminar esta venta? Esta acción no se puede deshacer.")) return;
    try {
      await deleteData(`/api/direct-sales/${saleId}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err?.message || "Error al eliminar");
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">N° Venta</th>
              <th className="text-left p-3">Fecha</th>
              <th className="text-left p-3">Cliente</th>
              <th className="text-center p-3">Items</th>
              <th className="text-right p-3">Total (Bs.)</th>
              <th className="text-left p-3">Pago</th>
              <th className="text-center p-3">Estado</th>
              <th className="text-center p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s._id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-mono font-bold text-blue-600">{s.saleNumber}</td>
                <td className="p-3 text-xs whitespace-nowrap">
                  {new Date(s.createdAt).toLocaleDateString("es-BO")}{" "}
                  {new Date(s.createdAt).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="p-3">
                  <p className="font-medium text-sm">{s.customer?.name || "---"}</p>
                  {s.customer?.document && <p className="text-xs text-gray-500">CI: {s.customer.document}</p>}
                </td>
                <td className="p-3 text-center">{s.items?.length || 0}</td>
                <td className="p-3 text-right font-bold">Bs. {Number(s.total || s.totalBob || 0).toFixed(2)}</td>
                <td className="p-3 text-xs">{PAYMENT[s.paymentMethod] || s.paymentMethod}</td>
                <td className="p-3 text-center">
                  {(() => {
                    const ps = PAY_STATUS[s.paymentStatus] || PAY_STATUS.PAID;
                    return (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${ps.cls}`}>
                        {ps.label}
                      </span>
                    );
                  })()}
                </td>
                <td className="p-3 text-center">
                  <div className="flex gap-1 justify-center items-center">
                    <button onClick={() => setSelected(s)} className="text-xs text-blue-600 hover:underline">Ver</button>
                    <button onClick={() => handlePDF(s)} className="text-xs text-gray-500 hover:underline">PDF</button>
                    {isSuper && (
                      <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:text-red-700 ml-1" title="Eliminar venta">
                        <GoTrash size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <SaleDetailModal
          sale={selected}
          onClose={() => setSelected(null)}
          onDelete={isSuper ? (id) => { handleDelete(id); setSelected(null); } : undefined}
        />
      )}
    </>
  );
}
