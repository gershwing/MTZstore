export default function SaleSummary({
  totals,
  ivaEnabled, setIvaEnabled, ivaPct,
  itEnabled, setItEnabled, itPct,
}) {
  if (!totals || totals.count === 0) {
    return (
      <div className="bg-gray-50 border rounded-lg p-4 text-center text-gray-400">
        Agrega productos para ver el resumen
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4 space-y-3 sticky top-4">
      <h3 className="font-semibold text-sm uppercase text-gray-600">Resumen de venta</h3>
      <div className="text-sm space-y-1">
        <div className="flex justify-between"><span>Items:</span><span>{totals.count}</span></div>
        <div className="flex justify-between"><span>Unidades:</span><span>{totals.totalQty}</span></div>
      </div>
      <hr />
      <div className="text-sm space-y-1">
        <div className="flex justify-between"><span>Subtotal:</span><span>Bs. {totals.subtotalBob.toFixed(2)}</span></div>

        <div className="flex justify-between items-center">
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="checkbox" checked={ivaEnabled} onChange={(e) => setIvaEnabled(e.target.checked)} className="w-3 h-3" />
            <span className={ivaEnabled ? "" : "line-through text-gray-400"}>IVA ({ivaPct}%):</span>
          </label>
          <span className={ivaEnabled ? "" : "text-gray-400"}>Bs. {totals.ivaAmount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center">
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="checkbox" checked={itEnabled} onChange={(e) => setItEnabled(e.target.checked)} className="w-3 h-3" />
            <span className={itEnabled ? "" : "line-through text-gray-400"}>IT ({itPct}%):</span>
          </label>
          <span className={itEnabled ? "" : "text-gray-400"}>Bs. {totals.itAmount.toFixed(2)}</span>
        </div>
      </div>
      <hr />
      <div className="flex justify-between font-bold text-lg">
        <span>TOTAL:</span>
        <span className="text-blue-600">Bs. {totals.totalBob.toFixed(2)}</span>
      </div>
      <hr />
      <div className="bg-green-50 p-2 rounded text-sm space-y-1">
        <div className="flex justify-between"><span>Costo:</span><span>Bs. {totals.totalCostBob.toFixed(2)}</span></div>
        <div className="flex justify-between text-green-700 font-medium"><span>Utilidad:</span><span>Bs. {totals.profit.toFixed(2)}</span></div>
        <div className="flex justify-between text-green-700"><span>Margen:</span><span>{totals.marginPct.toFixed(1)}%</span></div>
      </div>
    </div>
  );
}
