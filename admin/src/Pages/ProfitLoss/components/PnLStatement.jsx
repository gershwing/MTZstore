export default function PnLStatement({ pnlData, storeName }) {
  const fmt = (v) => {
    const n = Number(v || 0);
    return `Bs. ${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  const pct = (num, den) => {
    if (!den || den === 0) return "0.0";
    return ((num / den) * 100).toFixed(1);
  };

  const Row = ({ label, value, level = "normal", indent = false, negative = false }) => {
    const cls = {
      header: "font-semibold bg-gray-50 border-t-2 border-gray-300",
      subtotal: "font-bold bg-blue-50 border-t border-blue-200",
      total: "font-bold text-lg bg-green-50 border-t-2 border-green-400",
      normal: "",
    }[level] || "";

    return (
      <tr className={cls}>
        <td className={`py-2 ${indent ? "pl-6 text-gray-600 text-xs" : "pl-2"}`}>{label}</td>
        <td className={`py-2 pr-2 text-right ${negative ? "text-red-600" : ""}`}>
          {negative ? `(${fmt(Math.abs(value))})` : fmt(value)}
        </td>
      </tr>
    );
  };

  const Spacer = () => <tr><td className="py-1" colSpan={2}></td></tr>;

  return (
    <div id="pnl-printable" className="bg-white border rounded-lg p-6 space-y-6">
      <style>{`
        @media print {
          html, body { margin: 0; padding: 0; background: white; }
          body * { visibility: hidden; }
          #pnl-printable, #pnl-printable * { visibility: visible; }
          #pnl-printable {
            position: fixed; left: 0; top: 0;
            width: 100%; max-width: 100%;
            padding: 15mm 20mm;
            margin: 0;
            border: none; box-shadow: none; border-radius: 0;
            font-size: 11pt;
          }
          #pnl-printable table { width: 100%; border-collapse: collapse; }
          #pnl-printable td { padding: 4pt 6pt; }
          .print\\:hidden { display: none !important; }
          @page { margin: 10mm; size: letter; }
        }
      `}</style>
      {/* Encabezado */}
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold">MTZstore</h2>
        <p className="text-gray-600">Estado de Resultados</p>
        <p className="text-sm text-gray-500">{storeName}</p>
        <p className="text-sm text-gray-500">
          Periodo: {pnlData.periodLabel || "---"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {pnlData.salesCount} ventas | {pnlData.totalItems || 0} items
        </p>
      </div>

      {/* Tabla P&L */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            <Row label="Ingresos por ventas" value={pnlData.grossSales} level="header" />
            {pnlData.returnsDiscounts > 0 && (
              <Row label="Menos: Devoluciones/Descuentos" value={pnlData.returnsDiscounts} indent negative />
            )}
            <Row label="Ingresos netos" value={pnlData.netSales} level="subtotal" />

            <Spacer />
            <Row label="Costo de bienes vendidos (COGS)" value={pnlData.cogs} level="header" negative />
            <Row label="Utilidad bruta" value={pnlData.grossProfit} level="subtotal" />

            <Spacer />
            {pnlData.operatingExpenses > 0 && (
              <>
                <Row label="Gastos operacionales" value={pnlData.operatingExpenses} level="header" negative />
                {pnlData.expenseDetails?.map((exp) => (
                  <Row key={exp.category} label={exp.category} value={exp.amount} indent negative />
                ))}
                <Row label="Utilidad operacional" value={pnlData.operatingIncome} level="subtotal" />
                <Spacer />
              </>
            )}

            <Row label="Utilidad antes de impuestos" value={pnlData.incomeBeforeTax} level="subtotal" />

            <Spacer />
            <Row label={`IVA cobrado`} value={pnlData.ivaAmount} indent />
            <Row label={`IT (Imp. transacciones)`} value={pnlData.itAmount} indent />
            <tr className="bg-yellow-50 border-t border-yellow-200">
              <td className="py-2 pl-2 font-medium text-gray-700">Total impuestos</td>
              <td className="py-2 pr-2 text-right text-red-600 font-medium">({fmt(pnlData.totalTaxes)})</td>
            </tr>

            <Spacer />
            <Row
              label="UTILIDAD NETA"
              value={pnlData.netIncome}
              level="total"
            />
          </tbody>
        </table>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
        <Indicator label="Margen bruto" value={`${pct(pnlData.grossProfit, pnlData.netSales)}%`} color="blue" />
        <Indicator label="Margen neto" value={`${pct(pnlData.netIncome, pnlData.netSales)}%`} color="green" />
        <Indicator label="Ventas" value={pnlData.salesCount} color="purple" />
        <Indicator label="Ticket promedio" value={fmt(pnlData.salesCount > 0 ? pnlData.grossSales / pnlData.salesCount : 0)} color="amber" />
      </div>
    </div>
  );
}

function Indicator({ label, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className={`${colors[color] || "bg-gray-50"} p-3 rounded-lg`}>
      <p className="text-xs text-gray-600">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
