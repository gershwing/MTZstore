/**
 * VARIANTES - Gastronomia > Cocina Local > Parrilla y Asados
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["A la parrilla", "Recien hecho"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Parrillada de carnes", "Asadito de res", "Asadito mixto", "Churrasco",
      "Costilla a la parrilla", "Anticucho", "Brochetas de carne",
      "Pollo a la parrilla", "Pollo al espiedo", "Chorizo parrillero"
    ]
  },

  porcion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Individual", "Doble", "Familiar", "Parrillada completa"]
  },

  termino: {
    tipo: "texto",
    opciones: ["Termino medio", "Bien cocido", "Jugoso"]
  },

  acompanamiento: {
    tipo: "texto",
    opciones: ["Papa", "Arroz", "Ensalada", "Yuca", "Mixto"]
  },

  salsa: {
    tipo: "texto",
    opciones: ["Llajua", "Mayonesa", "Mostaza", "Ketchup", "Chimichurri", "Sin salsa"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
