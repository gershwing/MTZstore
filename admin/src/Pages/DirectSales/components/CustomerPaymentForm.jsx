export default function CustomerPaymentForm({
  customer, setCustomer,
  paymentMethod, setPaymentMethod,
  paymentNotes, setPaymentNotes,
  notes, setNotes,
}) {
  const update = (field, value) => setCustomer({ ...customer, [field]: value });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-2">Datos del cliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Nombre *</label>
            <input value={customer.name} onChange={(e) => update("name", e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Nombre del cliente" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Teléfono</label>
            <input value={customer.phone} onChange={(e) => update("phone", e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Opcional" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">CI / NIT</label>
            <input value={customer.document} onChange={(e) => update("document", e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Opcional" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Email</label>
            <input type="email" value={customer.email} onChange={(e) => update("email", e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Opcional" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2">Pago</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Método de pago *</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="CASH">Efectivo</option>
              <option value="TRANSFER">Transferencia</option>
              <option value="QR">QR</option>
              <option value="MIXED">Mixto</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>
          {(paymentMethod === "MIXED" || paymentMethod === "OTHER") && (
            <div>
              <label className="block text-xs font-medium mb-1">Detalle de pago</label>
              <input value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Ej: mitad efectivo, mitad QR" />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">Notas (opcional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full border rounded px-3 py-2" placeholder="Observaciones..." />
      </div>
    </div>
  );
}
