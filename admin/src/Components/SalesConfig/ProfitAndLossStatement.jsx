const fmt = (n) =>
  Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Row({ label, value, bold, negative, highlight }) {
  return (
    <div className={`flex justify-between py-1 ${bold ? "font-bold" : ""} ${highlight ? "bg-gray-100 px-2 rounded" : ""}`}>
      <span className="text-gray-700">{label}</span>
      <span className={`${negative ? "text-red-600" : ""} ${highlight ? "text-lg" : ""}`}>
        {negative ? "-" : ""}${fmt(Math.abs(value))}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-gray-300 my-1" />;
}

export default function ProfitAndLossStatement({ computed, profitTaxPct = 25 }) {
  if (!computed?.stats || computed.stats.units <= 0) {
    return (
      <div className="bg-gray-50 border rounded-lg p-6 text-center text-gray-400">
        Ingresa las unidades esperadas para ver el estado de resultados
      </div>
    );
  }

  const s = computed.stats;

  return (
    <div className="bg-white border rounded-lg p-5 space-y-1">
      <h4 className="font-bold text-sm uppercase tracking-wide text-gray-600 mb-3">
        Estado de Resultados Proyectado
      </h4>

      <div className="text-sm space-y-0.5">
        <div className="flex justify-between py-1 text-xs text-gray-400">
          <span>Unidades: {s.units}</span>
          <span>Costo unit.: ${fmt(computed.costUsd)} | Precio unit.: ${fmt(computed.finalPrice)}</span>
        </div>

        <Divider />

        <Row label="A. Ventas netas (antes de impuestos)" value={s.revenue} bold />

        <Divider />

        <Row label="B. Costo de ventas (COGS)" value={s.cogs} negative />

        <Divider />

        <div className="flex justify-between py-1 font-semibold">
          <span className="text-gray-700">C. UTILIDAD BRUTA</span>
          <span className={s.grossProfit < 0 ? "text-red-600" : "text-green-700"}>
            ${fmt(s.grossProfit)} ({s.grossMarginPct}%)
          </span>
        </div>

        <Divider />

        <Row label={`D. IVA cobrado`} value={s.ivaTotalCollected} />
        {s.otherTaxTotal > 0 && (
          <Row label="E. Otros impuestos" value={s.otherTaxTotal} />
        )}
        <Row label={`F. Impuesto a ganancias (${s.incomeTaxPct}%)`} value={s.incomeTax} negative />

        <Divider />

        <div className={`flex justify-between py-2 font-bold text-base ${s.netProfit < 0 ? "text-red-700" : "text-green-700"} bg-gray-50 px-2 rounded`}>
          <span>UTILIDAD NETA</span>
          <span>${fmt(s.netProfit)} ({s.netMarginPct}%)</span>
        </div>

        {s.netProfit < 0 && (
          <p className="text-sm text-red-600 font-medium mt-2">
            El producto genera pérdida con esta configuración. Considera ajustar el precio o reducir costos.
          </p>
        )}
      </div>
    </div>
  );
}
