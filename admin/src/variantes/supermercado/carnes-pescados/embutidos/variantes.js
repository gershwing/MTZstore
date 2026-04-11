/**
 * VARIANTES - Supermercado > Carnes y Pescados > Embutidos
 * Ruta: admin/src/variantes/supermercado/carnes-pescados/embutidos/variantes.js
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Refrigerado", "Sellado de fábrica", "Artesanal"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Salchicha",
      "Chorizo parrillero",
      "Chorizo criollo",
      "Mortadela",
      "Jamón",
      "Tocino",
      "Pepperoni",
      "Salame",
      "Longaniza",
      "Vienesa"
    ]
  },

  presentacion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Unidad", "Paquete", "Por kilo", "Bandeja"]
  },

  peso: {
    tipo: "texto",
    requerido: false,
    opciones: ["250 g", "500 g", "1 kg"]
  },

  uso: {
    tipo: "texto",
    requerido: false,
    opciones: ["Desayuno", "Pizza", "Parrilla", "Sándwich", "Cocina"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
