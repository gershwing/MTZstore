/**
 * VARIANTES - Gastronomia > Cocina del Mundo > Sushi
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
      "California roll", "Philadelphia roll", "Furai roll", "Roll de salmon",
      "Roll de langostino", "Roll de pollo", "Tabla mixta", "Combo sushi"
    ]
  },

  cantidad: {
    tipo: "texto",
    requerido: true,
    opciones: ["5 piezas", "10 piezas", "20 piezas", "30 piezas"]
  },

  salsa: {
    tipo: "texto",
    opciones: ["Soya", "Teriyaki", "Acevichada", "Spicy", "Sin salsa"]
  },

  extras: {
    tipo: "texto",
    opciones: ["Jengibre", "Wasabi", "Queso crema extra", "Palitos extra", "Sin extras"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
