export default function SaleLineTable({ items, onUpdateQty, onUpdatePricing, onRemove, wholesaleEnabled = false }) {
  if (!items.length) {
    return <p className="text-center text-gray-400 py-6">No hay productos. Usa el buscador para agregar.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-2">Producto</th>
            <th className="text-center p-2 w-20">Cant.</th>
            <th className="text-center p-2 w-28">Tipo</th>
            <th className="text-right p-2 w-28">Precio Bs.</th>
            <th className="text-right p-2 w-28">Subtotal Bs.</th>
            <th className="text-center p-2 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._tempId} className="border-b hover:bg-gray-50">
              <td className="p-2">
                <div className="flex items-center gap-2">
                  {item.imageSnapshot && <img src={item.imageSnapshot} alt="" className="w-10 h-10 rounded object-cover" />}
                  <div>
                    <p className="font-medium">{item.nameSnapshot}</p>
                    <p className="text-xs text-gray-500">{item.brand}</p>
                  </div>
                </div>
              </td>
              <td className="p-2 text-center">
                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item._tempId, Math.max(1, (Number(item.qty) || 1) - 1))}
                    className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-bold"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={item.qty}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      onUpdateQty(item._tempId, raw === "" ? "" : parseInt(raw));
                    }}
                    onBlur={() => {
                      if (!item.qty || item.qty < 1) onUpdateQty(item._tempId, 1);
                    }}
                    className="w-12 border rounded px-1 py-1 text-center"
                  />
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item._tempId, (Number(item.qty) || 0) + 1)}
                    className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </td>
              <td className="p-2 text-center">
                <select
                  value={item.pricingMode}
                  onChange={(e) => onUpdatePricing(item._tempId, e.target.value)}
                  className="border rounded px-2 py-1 text-xs"
                >
                  <option value="RETAIL">Minorista</option>
                  {wholesaleEnabled && item.wholesalePriceBase > 0 && <option value="WHOLESALE">Mayorista</option>}
                  <option value="MANUAL">Manual</option>
                </select>
              </td>
              <td className="p-2 text-right">
                {item.pricingMode === "MANUAL" ? (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPriceBob}
                    onChange={(e) => onUpdatePricing(item._tempId, "MANUAL", parseFloat(e.target.value) || 0)}
                    className="w-24 border rounded px-2 py-1 text-right"
                  />
                ) : (
                  <span>Bs. {item.unitPriceBob.toFixed(2)}</span>
                )}
              </td>
              <td className="p-2 text-right font-medium">Bs. {item.subtotalBob.toFixed(2)}</td>
              <td className="p-2 text-center">
                <button onClick={() => onRemove(item._tempId)} className="text-red-500 hover:text-red-700 text-lg">x</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
