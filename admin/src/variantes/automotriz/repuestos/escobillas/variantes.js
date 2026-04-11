/**
 * VARIANTES - Automotriz > Repuestos > Escobillas / Plumillas
 * Ruta: admin/src/variantes/automotriz/repuestos/escobillas/variantes.js
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo", "Usado", "Reacondicionado"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Plumilla sin marco (Safari)",
      "Plumilla metal (Safari)",
      "Plumilla simple",
      "Plumilla 9 encajes",
      "Plumilla en caja (par)"
    ]
  },

  tamano: {
    tipo: "texto",
    requerido: true,
    opciones: ["10\"", "12\"", "14\"", "16\"", "18\"", "20\"", "22\"", "24\"", "26\""]
  },

  pack: {
    tipo: "texto",
    requerido: false,
    opciones: ["Unidad", "Par", "Par en caja"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
