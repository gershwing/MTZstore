/**
 * VARIANTES - Gastronomia > Cocina del Mundo > Comida Italiana
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
      "Lasagna", "Spaghetti a la bolognesa", "Spaghetti al pesto", "Fettuccine Alfredo",
      "Pasta con pollo", "Pasta mixta", "Ravioles", "Noquis", "Pizza italiana", "Risotto"
    ]
  },

  porcion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Individual", "Medio", "Familiar"]
  },

  salsa: {
    tipo: "texto",
    opciones: ["Bolognesa", "Alfredo", "Pesto", "Pomodoro", "Cuatro quesos"]
  },

  queso: {
    tipo: "texto",
    opciones: ["Normal", "Extra queso", "Sin queso"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
