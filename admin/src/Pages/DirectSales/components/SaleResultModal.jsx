import { Button } from "@mui/material";
import { generateReceiptPDF } from "./SaleReceiptPDF";

export default function SaleResultModal({ sale, onNewSale }) {
  if (!sale) return null;

  const handleDownload = () => {
    const pdf = generateReceiptPDF(sale, sale.storeInfo);
    pdf.save(`${sale.saleNumber || "venta"}.pdf`);
  };

  const handlePrint = () => {
    const pdf = generateReceiptPDF(sale, sale.storeInfo);
    const blob = pdf.output("bloburl");
    window.open(blob, "_blank");
  };

  const total = Number(sale.total || sale.totalBob || 0).toFixed(2);

  return (
    <div className="p-8 max-w-md mx-auto text-center space-y-5">
      <div className="text-6xl text-green-500">&#10003;</div>
      <h2 className="text-2xl font-bold">Venta registrada</h2>
      <p className="text-lg text-gray-600 font-mono font-bold text-blue-600">{sale.saleNumber}</p>

      <div className="bg-gray-50 rounded-lg p-4 text-sm text-left space-y-1">
        <div className="flex justify-between"><span>Cliente:</span><span className="font-medium">{sale.customer?.name || "---"}</span></div>
        <div className="flex justify-between"><span>Items:</span><span className="font-medium">{sale.items?.length || 0}</span></div>
        <div className="flex justify-between text-lg font-bold"><span>Total:</span><span className="text-blue-600">Bs. {total}</span></div>
      </div>

      <div className="space-y-2">
        <Button variant="contained" fullWidth onClick={handleDownload} sx={{ bgcolor: "#2563eb" }}>
          Descargar PDF
        </Button>
        <Button variant="outlined" fullWidth onClick={handlePrint}>
          Imprimir comprobante
        </Button>
      </div>

      <Button variant="contained" fullWidth onClick={onNewSale} color="success" size="large">
        Nueva venta
      </Button>
    </div>
  );
}
