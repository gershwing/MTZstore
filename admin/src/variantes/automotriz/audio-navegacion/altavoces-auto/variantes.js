/**
 * VARIANTES - Automotriz > Audio y Navegación > Altavoces Auto
 * Ruta: admin/src/variantes/automotriz/audio-navegacion/altavoces-auto/variantes.js
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Parlante 4\"",
      "Parlante 5\"",
      "Parlante 6\"",
      "Parlante 6x9\"",
      "Subwoofer",
      "Par coaxial"
    ]
  },

  potencia: {
    tipo: "texto",
    requerido: false,
    opciones: ["Hasta 100W", "100–200W", "200–400W", "400W+"]
  },

  pack: {
    tipo: "texto",
    requerido: false,
    opciones: ["1 unidad", "Par (x2)", "Set 4 unidades"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
