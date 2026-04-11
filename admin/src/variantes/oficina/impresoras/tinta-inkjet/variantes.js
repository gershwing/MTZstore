/**
 * VARIANTES - Oficina > Impresoras > Tinta Inkjet
 * Ruta: admin/src/variantes/oficina/impresoras/tinta-inkjet/variantes.js
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
      "Inkjet de inyección básica",
      "Inkjet con sistema de tinta continua (CISS)",
      "Inkjet fotográfica",
      "Inkjet de gran formato (A3+)",
      "Plóter / Plotter de corte"
    ]
  },

  funciones: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Solo impresión",
      "Impresión + Escáner",
      "Impresión + Escáner + Copiadora",
      "Impresión + Escáner + Copiadora + Fax"
    ]
  },

  conectividad: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "USB",
      "USB + Wi-Fi",
      "USB + Wi-Fi + Bluetooth",
      "USB + Wi-Fi + Ethernet",
      "AirPrint + Google Cloud Print",
      "Wi-Fi Direct"
    ]
  },

  velocidad_ppm: {
    tipo: "texto",
    requerido: false,
    opciones: ["Hasta 5 ppm", "5–10 ppm", "10–15 ppm", "15–20 ppm", "20 ppm+"]
  },

  resolucion_dpi: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "720×360 dpi",
      "1200×600 dpi",
      "4800×1200 dpi",
      "5760×1440 dpi (foto)"
    ]
  },

  marca_modelo: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Epson EcoTank L3250 / L3560 / L5590 (CISS)",
      "Epson EcoTank L8050 (foto)",
      "Epson XP-4200",
      "HP DeskJet 2720e / 4120e",
      "HP Envy 6020e / 6420e",
      "HP Smart Tank 5101 / 7301 (CISS)",
      "Canon PIXMA G2160 / G3160 (CISS)",
      "Canon PIXMA TS5350a / TS8350a",
      "Brother DCP-T420W / T520W (CISS)",
      "Brother MFC-J1010DW"
    ]
  },

  color_producto: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del color / modelo de la impresora. El cliente elige la imagen en el client.",
    guia_vendedor: ["Blanco", "Negro", "Gris claro", "Gris oscuro", "Blanco + gris", "Negro + plateado"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
