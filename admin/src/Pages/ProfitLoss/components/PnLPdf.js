import { jsPDF } from "jspdf";

const fmt = (v) => {
  const n = Number(v || 0);
  return `Bs. ${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

const pct = (num, den) => {
  if (!den || den === 0) return "0.0";
  return ((num / den) * 100).toFixed(1);
};

export function generatePnLPDF(pnlData, storeName) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
  const W = pdf.internal.pageSize.getWidth(); // 215.9
  const M = 20; // margen
  const CW = W - M * 2; // ancho de contenido
  let y = 25;

  // --- Encabezado ---
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("MTZstore", W / 2, y, { align: "center" });
  y += 7;

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text("Estado de Resultados", W / 2, y, { align: "center" });
  y += 6;

  pdf.setFontSize(9);
  pdf.text(storeName || "Consolidado", W / 2, y, { align: "center" });
  y += 5;
  pdf.text(`Periodo: ${pnlData.periodLabel || "---"}`, W / 2, y, { align: "center" });
  y += 5;
  pdf.setFontSize(8);
  pdf.text(`${pnlData.salesCount} ventas | ${pnlData.totalItems || 0} items`, W / 2, y, { align: "center" });
  y += 8;

  // Línea separadora
  pdf.setLineWidth(0.5);
  pdf.line(M, y, W - M, y);
  y += 6;

  // --- Helpers para filas ---
  const row = (label, value, opts = {}) => {
    const { bold = false, size = 10, indent = false, negative = false, bg = null, lineAbove = false } = opts;

    if (lineAbove) {
      pdf.setLineWidth(0.2);
      pdf.line(M, y - 1, W - M, y - 1);
    }

    if (bg) {
      pdf.setFillColor(...bg);
      pdf.rect(M, y - 4, CW, 7, "F");
    }

    pdf.setFontSize(size);
    pdf.setFont("helvetica", bold ? "bold" : "normal");

    const x = indent ? M + 8 : M;
    pdf.setTextColor(indent ? 100 : 0);
    pdf.text(label, x, y);

    const valStr = negative ? `(${fmt(Math.abs(value))})` : fmt(value);
    pdf.setTextColor(negative ? 200 : 0, negative ? 50 : 0, 0);
    pdf.text(valStr, W - M, y, { align: "right" });

    pdf.setTextColor(0);
    y += 7;
  };

  const spacer = () => { y += 3; };

  // --- INGRESOS ---
  row("Ingresos por ventas", pnlData.grossSales, { bold: true, bg: [240, 240, 240], lineAbove: true });

  if (pnlData.returnsDiscounts > 0) {
    row("Menos: Devoluciones/Descuentos", pnlData.returnsDiscounts, { indent: true, negative: true });
  }

  row("Ingresos netos", pnlData.netSales, { bold: true, bg: [220, 235, 255], lineAbove: true });

  spacer();

  // --- COGS ---
  row("Costo de bienes vendidos (COGS)", pnlData.cogs, { bold: true, bg: [240, 240, 240], negative: true, lineAbove: true });
  row("Utilidad bruta", pnlData.grossProfit, { bold: true, bg: [220, 235, 255], lineAbove: true });

  spacer();

  // --- GASTOS OPERACIONALES ---
  if (pnlData.operatingExpenses > 0) {
    row("Gastos operacionales", pnlData.operatingExpenses, { bold: true, bg: [240, 240, 240], negative: true, lineAbove: true });
    if (pnlData.expenseDetails) {
      pnlData.expenseDetails.forEach((exp) => {
        row(exp.category, exp.amount, { indent: true, negative: true, size: 9 });
      });
    }
    row("Utilidad operacional", pnlData.operatingIncome, { bold: true, bg: [220, 235, 255], lineAbove: true });
    spacer();
  }

  // --- UTILIDAD ANTES DE IMPUESTOS ---
  row("Utilidad antes de impuestos", pnlData.incomeBeforeTax, { bold: true, bg: [220, 235, 255], lineAbove: true });

  spacer();

  // --- IMPUESTOS ---
  row("IVA cobrado", pnlData.ivaAmount, { indent: true, size: 9 });
  row("IT (Imp. transacciones)", pnlData.itAmount, { indent: true, size: 9 });
  row("Total impuestos", pnlData.totalTaxes, { bold: true, bg: [255, 250, 220], negative: true, lineAbove: true });

  spacer();

  // --- UTILIDAD NETA ---
  pdf.setLineWidth(0.8);
  pdf.line(M, y - 1, W - M, y - 1);
  row("UTILIDAD NETA", pnlData.netIncome, { bold: true, size: 13, bg: [220, 245, 220] });

  y += 5;
  pdf.setLineWidth(0.8);
  pdf.line(M, y, W - M, y);
  y += 10;

  // --- INDICADORES ---
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("Indicadores clave", M, y);
  y += 7;

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");

  const indicators = [
    ["Margen bruto", `${pct(pnlData.grossProfit, pnlData.netSales)}%`],
    ["Margen neto", `${pct(pnlData.netIncome, pnlData.netSales)}%`],
    ["Total ventas", String(pnlData.salesCount)],
    ["Ticket promedio", fmt(pnlData.salesCount > 0 ? pnlData.grossSales / pnlData.salesCount : 0)],
  ];

  indicators.forEach(([label, val]) => {
    pdf.text(label + ":", M, y);
    pdf.setFont("helvetica", "bold");
    pdf.text(val, M + 45, y);
    pdf.setFont("helvetica", "normal");
    y += 5;
  });

  // --- Pie ---
  y += 10;
  pdf.setFontSize(7);
  pdf.setTextColor(150);
  pdf.text("Generado por MTZstore | www.mtzstore.com", W / 2, y, { align: "center" });
  pdf.text(new Date().toLocaleString("es-BO"), W / 2, y + 4, { align: "center" });

  return pdf;
}
