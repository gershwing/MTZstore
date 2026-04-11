import { useState } from "react";

export default function PaymentModal({ sale, onConfirm, onClose }) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const maxAmount = sale.amountDue || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) { alert("Ingresa un monto valido"); return; }
    if (numAmount > maxAmount + 0.01) { alert(`El monto no puede exceder Bs. ${maxAmount.toFixed(2)}`); return; }

    setSaving(true);
    try {
      await onConfirm({
        directSaleId: sale._id,
        amount: numAmount,
        paymentMethod,
        note,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Registrar abono</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
          <p><span className="text-gray-500">Cliente:</span> {sale.customer?.name}</p>
          <p><span className="text-gray-500">Venta:</span> {sale.saleNumber}</p>
          <p><span className="text-gray-500">Deuda pendiente:</span> <span className="text-red-600 font-bold">Bs. {maxAmount.toFixed(2)}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Monto del abono (Bs.) *</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder={`Max: ${maxAmount.toFixed(2)}`}
              autoFocus
            />
            {amount && Number(amount) > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Restante despues del abono: <span className="font-semibold">Bs. {Math.max(0, maxAmount - Number(amount)).toFixed(2)}</span>
                {Number(amount) >= maxAmount - 0.01 && <span className="text-green-600 ml-1">(Deuda completada)</span>}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Metodo de pago</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="CASH">Efectivo</option>
              <option value="TRANSFER">Transferencia</option>
              <option value="QR">QR</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Nota (opcional)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Ej: pago parcial en efectivo"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border rounded py-2 text-sm hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !amount || Number(amount) <= 0}
              className="flex-1 bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Registrar abono"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
