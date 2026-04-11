/**
 * VARIANTES - Gastronomia > Cocina del Mundo > Comida Mexicana
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Preparado al momento"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Tacos", "Burrito", "Quesadilla", "Nachos", "Fajitas",
      "Enchiladas", "Combo mexicano", "Taco birria estilo local"
    ]
  },

  porcion: {
    tipo: "texto",
    requerido: true,
    opciones: ["1 unidad", "2 unidades", "3 unidades", "Combo"]
  },

  proteina: {
    tipo: "texto",
    opciones: ["Pollo", "Carne", "Mixto", "Vegetariano"]
  },

  picante: {
    tipo: "texto",
    opciones: ["Sin picante", "Suave", "Medio", "Picante"]
  },

  salsa: {
    tipo: "texto",
    opciones: ["Guacamole", "Salsa roja", "Salsa verde", "Crema acida", "Sin salsa"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
