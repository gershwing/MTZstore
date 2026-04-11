/**
 * VARIANTES - Oficina > Impresoras > Consumibles
 * Ruta: admin/src/variantes/oficina/impresoras/consumibles/variantes.js
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

  tipo_consumible: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Cartucho de tinta original",
      "Cartucho de tinta compatible / genérico",
      "Botella de tinta para CISS (EcoTank / InkTank)",
      "Tóner original",
      "Tóner compatible / genérico",
      "Drum / Tambor fotoconductor",
      "Kit mantenimiento (almohadilla de absorción)",
      "Papel fotográfico brillante",
      "Papel fotográfico mate",
      "Papel transfer sublimación",
      "Papel couché / glossy",
      "Papel bond (resma)",
      "Etiquetas adhesivas",
      "Papel térmico (rollos)"
    ]
  },

  marca_impresora: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Epson", "HP", "Canon", "Brother", "Samsung",
      "Xerox", "Lexmark", "OKI", "Kyocera", "Ricoh", "Genérico"
    ]
  },

  modelo_cartucho: {
    tipo: "texto",
    requerido: false,
    opciones: ["Ver descripción del producto (compatible con modelo específico)"]
  },

  color_tinta: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del cartucho / botella de tinta. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro / Black", "Cian / Cyan", "Magenta", "Amarillo / Yellow",
      "Set 4 colores (CMYK)", "Set 6 colores (foto)", "Set 8 colores (profesional)"
    ]
  },

  rendimiento_paginas: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Hasta 200 páginas",
      "200–500 páginas",
      "500–1000 páginas",
      "1000–3000 páginas",
      "3000–6000 páginas",
      "6000 páginas+"
    ]
  },

  pack: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "1 unidad",
      "Pack 2",
      "Pack 4 (1 set CMYK)",
      "Pack 6",
      "Pack 12",
      "Resma 500 hojas",
      "Paquete 5 resmas"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
