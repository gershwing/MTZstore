// src/utils/exportPdf.js

/** Exporta a PDF el DOM dentro de un elemento por id.
 *  - Maneja alto multipágina A4
 *  - Usa escala alta para mejor nitidez
 *  - Respeta fondo blanco y scroll
 */
export async function exportElementToPdf(rootId, fileName = "reporte.pdf") {
  const el = document.getElementById(rootId);
  if (!el) {
    console.error(`[exportElementToPdf] No existe el elemento #${rootId}`);
    return;
  }

  // Importaciones dinámicas para evitar problemas en Vite (análisis/SSR)
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  // Canvas a buena resolución
  const scale = 2; // puedes subir a 3 si quieres más nitidez
  const canvas = await html2canvas(el, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    windowWidth: document.documentElement.scrollWidth,
    windowHeight: document.documentElement.scrollHeight,
    scrollX: 0,
    scrollY: -window.scrollY, // corrige desplazamiento
  });

  const imgData = canvas.toDataURL("image/png");

  // Medidas A4 en puntos (pt) a 72 DPI
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Calcula tamaño de la imagen en el ancho de página (con márgenes)
  const margin = 24; // margen lateral/superior/inferior
  const usableWidth = pageWidth - margin * 2;

  const imgWidth = usableWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Si la altura excede, parti-la en múltiples páginas
  let remainingHeight = imgHeight;
  let position = margin;

  // Para recortar en “bandas” del canvas al tamaño de página
  const pageImgHeight = pageHeight - margin * 2;

  // Helper para dibujar un fragmento del canvas por página
  const addPageSlice = (sourceY, sliceHeight) => {
    // Crear canvas temporal con el fragmento visible
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = Math.min(sliceHeight * (canvas.width / imgWidth), canvas.height - sourceY);

    const ctx = pageCanvas.getContext("2d");
    ctx.drawImage(
      canvas,
      0, sourceY,                // src x,y
      canvas.width, pageCanvas.height, // src w,h
      0, 0,                      // dst x,y
      pageCanvas.width, pageCanvas.height // dst w,h
    );
    const pageImgData = pageCanvas.toDataURL("image/png");
    pdf.addImage(pageImgData, "PNG", margin, margin, imgWidth, sliceHeight, undefined, "FAST");
  };

  // Primera página
  const slice1Height = Math.min(imgHeight, pageImgHeight);
  addPageSlice(0, slice1Height);
  remainingHeight -= slice1Height;

  // Páginas siguientes
  let srcY = (slice1Height * canvas.height) / imgHeight; // avanza en el canvas original
  while (remainingHeight > 1) {
    pdf.addPage();
    const sliceH = Math.min(pageImgHeight, remainingHeight);
    addPageSlice(srcY, sliceH);
    srcY += (sliceH * canvas.width) / imgWidth * (canvas.height / canvas.width);
    remainingHeight -= sliceH;
  }

  pdf.save(fileName);
}
