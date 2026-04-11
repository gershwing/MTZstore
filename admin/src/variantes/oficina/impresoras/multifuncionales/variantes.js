/**
 * VARIANTES - Oficina > Impresoras > Multifuncionales
 * Ruta: admin/src/variantes/oficina/impresoras/multifuncionales/variantes.js
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

  tecnologia: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Inkjet CISS (tinta continua)",
      "Inkjet cartuchos",
      "Láser mono",
      "Láser color",
      "Térmica (recibos / etiquetas)",
      "Sublimación (fotos / textiles)"
    ]
  },

  funciones: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "4 en 1 (imprimir + copiar + escanear + fax)",
      "3 en 1 (sin fax)",
      "Impresora + escáner plano",
      "Impresora + etiquetado"
    ]
  },

  formato_max: {
    tipo: "texto",
    requerido: false,
    opciones: ["A4", "A3", "A3+", "Rollo continuo (térmica / sublimación)"]
  },

  conectividad: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "USB",
      "USB + Wi-Fi",
      "USB + Wi-Fi + Ethernet + Bluetooth",
      "AirPrint + Android Print"
    ]
  },

  adf: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Sin ADF (alimentador automático)",
      "Con ADF 20 hojas",
      "Con ADF 35 hojas",
      "Con ADF 50 hojas dúplex"
    ]
  },

  color_producto: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del modelo. El cliente elige la imagen en el client.",
    guia_vendedor: ["Blanco", "Gris", "Negro", "Blanco + gris", "Negro + gris"]
  },

  marca_modelo: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Epson EcoTank L5590 / L6490 / L14150 (A3)",
      "Epson WorkForce WF-2960DWF",
      "HP OfficeJet Pro 9010e / 9020e / 9125e",
      "HP Color LaserJet MFP M283fdw",
      "Canon PIXMA G3160 / G6020 / MegaTank",
      "Canon imageCLASS MF445dw",
      "Brother MFC-J4340DW / MFC-L3770CDW",
      "Xerox C235 / B215",
      "Dymo LabelWriter 450 / 5XL (etiquetas)",
      "Brother QL-820NWB (etiquetas)",
      "Sawgrass SG500 / SG1000 (sublimación)",
      "Epson SureColor F170 / F570 (sublimación)"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
