import { Button } from "@mui/material";
import { generateReceiptPDF } from "../DirectSales/components/SaleReceiptPDF";

export default function SaleDetailModal({ sale, onClose, onDelete }) {
  if (!sale) return null;

  const total = Number(sale.total || sale.totalBob || 0).toFixed(2);
  const sub = Number(sale.subtotal || sale.subtotalBob || 0).toFixed(2);
  const PAYMENT = { CASH: "Efectivo", TRANSFER: "Transferencia", QR: "QR", MIXED: "Mixto", OTHER: "Otro" };

  const handlePDF = () => {
    const pdf = generateReceiptPDF(sale, sale.storeInfo);
    pdf.save(`${sale.saleNumber || "venta"}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{sale.saleNumber}</h2>
          <span className={`text-xs font-medium px-2 py-1 rounded ${sale.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {sale.status === "CANCELLED" ? "Cancelada" : "Completada"}
          </span>
        </div>

        <p className="text-xs text-gray-500">
          {new Date(sale.createdAt).toLocaleString("es-BO")}
          {sale.createdByName ? ` | Vendedor: ${sale.createdByName}` : ""}
        </p>

        {/* Cliente */}
        <div className="bg-gray-50 rounded p-3 text-sm">
          <p className="font-medium">{sale.customer?.name || "---"}</p>
          <p className="text-xs text-gray-500">
            {sale.customer?.email}{sale.customer?.document ? ` | CI: ${sale.customer.document}` : ""}{sale.customer?.phone ? ` | Tel: ${sale.customer.phone}` : ""}
          </p>
        </div>

        {/* Items */}
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Producto</th>
              <th className="text-center p-2">Qty</th>
              <th className="text-right p-2">Precio</th>
              <th className="text-right p-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(sale.items || []).map((item, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    {item.imageSnapshot && <img src={item.imageSnapshot} alt="" className="w-8 h-8 rounded object-cover" />}
                    <span className="text-xs">{item.nameSnapshot}</span>
                  </div>
                </td>
                <td className="text-center p-2">{item.qty}</td>
                <td className="text-right p-2">Bs. {Number(item.unitPriceBob || item.unitPrice || 0).toFixed(2)}</td>
                <td className="text-right p-2">Bs. {Number(item.subtotalBob || item.subtotal || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="text-sm text-right space-y-1">
          <p>Subtotal: Bs. {sub}</p>
          {sale.ivaAmount > 0 && <p>IVA: Bs. {Number(sale.ivaAmount).toFixed(2)}</p>}
          {sale.itAmount > 0 && <p>IT: Bs. {Number(sale.itAmount).toFixed(2)}</p>}
          <p className="text-lg font-bold">Total: Bs. {total}</p>
        </div>

        <p className="text-sm">Pago: {PAYMENT[sale.paymentMethod] || sale.paymentMethod}</p>
        {sale.notes && <p className="text-sm text-gray-500">Notas: {sale.notes}</p>}

        <div className="flex gap-2">
          <Button variant="contained" onClick={handlePDF} fullWidth>Descargar PDF</Button>
          <Button variant="outlined" onClick={onClose} fullWidth>Cerrar</Button>
        </div>
        {onDelete && (
          <Button variant="outlined" color="error" fullWidth onClick={() => onDelete(sale._id)} size="small">
            Eliminar venta
          </Button>
        )}
      </div>
    </div>
  );
}
