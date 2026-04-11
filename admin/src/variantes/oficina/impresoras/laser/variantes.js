/**
 * VARIANTES - Oficina > Impresoras > Láser
 * Ruta: admin/src/variantes/oficina/impresoras/laser/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/diseño es esencial.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Láser monocromático (solo negro)",
      "Láser color",
      "Láser monocromático dúplex",
      "Láser color dúplex",
      "Láser de gran volumen / workgroup"
    ]
  },

  funciones: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Solo impresión",
      "Impresión + Escáner (MFP)",
      "Impresión + Escáner + Copiadora",
      "Impresión + Escáner + Copiadora + Fax"
    ]
  },

  velocidad_ppm: {
    tipo: "texto",
    requerido: false,
    opciones: ["10–15 ppm", "15–25 ppm", "25–35 ppm", "35–50 ppm", "50 ppm+"]
  },

  conectividad: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "USB",
      "USB + Wi-Fi",
      "USB + Ethernet",
      "USB + Wi-Fi + Ethernet + NFC",
      "Wi-Fi Direct"
    ]
  },

  capacidad_bandeja: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Hasta 150 hojas",
      "150–250 hojas",
      "250–500 hojas",
      "500–1000 hojas",
      "1000+ hojas"
    ]
  },

  duplex: {
    tipo: "texto",
    requerido: false,
    opciones: ["Sin dúplex (manual)", "Dúplex automático"]
  },

  marca_modelo: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "HP LaserJet Pro M15w / M28w",
      "HP LaserJet Pro MFP M130nw / M227fdw",
      "HP Color LaserJet Pro MFP M182nw / M283fdw",
      "Brother HL-L2350DW / HL-L2395DW",
      "Brother MFC-L2710DW / L2750DW",
      "Brother HL-L3270CDW / MFC-L3770CDW (color)",
      "Canon imageCLASS MF267dw / MF445dw",
      "Canon imageCLASS LBP6030w",
      "Epson AL-M200DN",
      "Xerox B215 / C235",
      "Samsung Xpress M2020W / M2070FW"
    ]
  },

  color_producto: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del color de la impresora. El cliente elige la imagen en el client.",
    guia_vendedor: ["Gris claro", "Gris oscuro", "Negro", "Blanco + gris", "Negro + plateado"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
