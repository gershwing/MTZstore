/**
 * VARIANTES - Gastronomia > Comida Rapida > Empanadas
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Horneado", "Frito", "Listo para entregar"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Saltena de carne", "Saltena de pollo", "Saltena mixta",
      "Tucumana de carne", "Tucumana de pollo", "Empanada de queso",
      "Empanada de queso y jamon", "Empanada de charque",
      "Empanada de pollo", "Empanada de carne"
    ]
  },

  cantidad: {
    tipo: "texto",
    requerido: true,
    opciones: ["1 unidad", "2 unidades", "6 unidades", "12 unidades"]
  },

  picante: {
    tipo: "texto",
    opciones: ["Sin picante", "Picante suave", "Picante normal"]
  },

  salsa: {
    tipo: "texto",
    opciones: ["Llajua", "Aji", "Mayonesa", "Sin salsa"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
