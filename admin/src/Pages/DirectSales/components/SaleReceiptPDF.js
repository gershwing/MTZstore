import { jsPDF } from "jspdf";

const PAYMENT_LABELS = { CASH: "Efectivo", TRANSFER: "Transferencia", QR: "QR", MIXED: "Mixto", OTHER: "Otro" };

export function generateReceiptPDF(sale, storeInfo) {
  const W = 80, M = 3, CW = W - M * 2;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [W, 220] });
  let y = 5;

  const line = () => { pdf.setLineWidth(0.3); pdf.line(M, y, W - M, y); y += 3; };
  const center = (txt, size = 8, bold = false) => {
    pdf.setFontSize(size); pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.text(txt, W / 2, y, { align: "center" }); y += size * 0.5;
  };
  const left = (txt, size = 7) => {
    pdf.setFontSize(size); pdf.setFont("helvetica", "normal");
    pdf.text(txt, M, y); y += size * 0.45;
  };
  const leftBold = (txt, size = 7) => {
    pdf.setFontSize(size); pdf.setFont("helvetica", "bold");
    pdf.text(txt, M, y); y += size * 0.45;
  };
  const right = (txt, size = 7, bold = false) => {
    pdf.setFontSize(size); pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.text(txt, W - M, y, { align: "right" }); y += size * 0.45;
  };
  const leftRight = (l, r, size = 7) => {
    pdf.setFontSize(size); pdf.setFont("helvetica", "normal");
    pdf.text(l, M, y); pdf.text(r, W - M, y, { align: "right" }); y += size * 0.45;
  };

  // Header
  center("MTZstore", 14, true);
  y += 1;

  // Tienda o plataforma
  const si = storeInfo || sale.storeInfo;
  if (si?.name) {
    center(`Tienda: ${si.name}`, 8);
  } else if (!sale.storeId) {
    center("Ventas de plataforma", 8);
  }

  center("Comprobante de Venta", 8);
  y += 1;
  leftBold(`N°: ${sale.saleNumber || "---"}`);
  y += 1;
  const fecha = sale.createdAt ? new Date(sale.createdAt) : new Date();
  left(`Fecha: ${fecha.toLocaleDateString("es-BO")} ${fecha.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })}`);
  y += 1;

  // Vendedor
  const vendedor = si?.name || (sale.createdByName ? sale.createdByName : "MTZstore");
  left(`Vendedor: ${vendedor}`);
  line();

  // Cliente
  leftBold("CLIENTE:");
  y += 0.5;
  const cust = sale.customer || {};
  left(cust.name || "---");
  y += 0.5;
  if (cust.document) { left(`CI/NIT: ${cust.document}`); y += 0.5; }
  if (cust.phone) { left(`Tel: ${cust.phone}`); y += 0.5; }
  if (cust.email) { left(`Email: ${cust.email}`); y += 0.5; }
  line();

  // Productos header
  pdf.setFontSize(6.5); pdf.setFont("helvetica", "bold");
  pdf.text("Producto", M, y);
  pdf.text("Qty", M + 38, y);
  pdf.text("P.Unit", M + 47, y);
  pdf.text("Subtotal", W - M, y, { align: "right" });
  y += 2.5; pdf.setLineWidth(0.1); pdf.line(M, y, W - M, y); y += 2;

  // Items
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(6);
  (sale.items || []).forEach((item) => {
    const name = item.nameSnapshot || "Producto";
    const lines = pdf.splitTextToSize(name, 36);
    lines.forEach((ln, i) => {
      pdf.text(ln, M, y);
      if (i === 0) {
        pdf.text(String(item.qty || 1), M + 38, y);
        const up = Number(item.unitPriceBob || item.unitPrice || 0).toFixed(2);
        pdf.text(up, M + 47, y);
        const st = Number(item.subtotalBob || item.subtotal || 0).toFixed(2);
        pdf.text(st, W - M, y, { align: "right" });
      }
      y += 2.5;
    });
    // Marca debajo del nombre
    if (item.brand) {
      pdf.setFontSize(5); pdf.setFont("helvetica", "italic");
      pdf.text(item.brand, M, y);
      pdf.setFontSize(6); pdf.setFont("helvetica", "normal");
      y += 2;
    }
    y += 1;
  });

  line();

  // Totales
  const sub = Number(sale.subtotal || sale.subtotalBob || 0).toFixed(2);
  leftRight("Subtotal:", `Bs. ${sub}`);
  y += 0.5;

  // IVA - siempre mostrar, 0 si deshabilitado
  const ivaAmt = sale.ivaEnabled ? Number(sale.ivaAmount || 0) : 0;
  leftRight(`IVA (${sale.ivaPct || 13}%):`, `Bs. ${ivaAmt.toFixed(2)}`);
  y += 0.5;

  // IT - siempre mostrar, 0 si deshabilitado
  const itAmt = sale.itEnabled ? Number(sale.itAmount || 0) : 0;
  leftRight(`IT (${sale.itPct || 3}%):`, `Bs. ${itAmt.toFixed(2)}`);
  y += 0.5;

  line();
  const total = Number(sale.total || sale.totalBob || 0).toFixed(2);
  pdf.setFontSize(9); pdf.setFont("helvetica", "bold");
  pdf.text("TOTAL:", M, y);
  pdf.text(`Bs. ${total}`, W - M, y, { align: "right" });
  y += 5;

  // Pago
  left(`Pago: ${PAYMENT_LABELS[sale.paymentMethod] || sale.paymentMethod || "---"}`);
  y += 0.5;
  if (sale.paymentNotes) { left(`Detalle: ${sale.paymentNotes}`); y += 0.5; }
  if (sale.notes) { left(`Notas: ${sale.notes}`); y += 0.5; }

  y += 3; line();
  center("Gracias por su compra", 7);
  y += 1;
  center("www.mtzstore.com", 6);

  return pdf;
}
