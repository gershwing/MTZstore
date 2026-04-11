/**
 * VARIANTES - Supermercado > Carnes y Pescados > Pescados y Mariscos
 * Ruta: admin/src/variantes/supermercado/carnes-pescados/pescados-mariscos/variantes.js
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Fresco", "Congelado", "Refrigerado"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Trucha",
      "Pejerrey",
      "Surubí",
      "Pacú",
      "Sábalo",
      "Filete de pescado",
      "Camarón",
      "Langostino",
      "Mejillones",
      "Calamar",
      "Pulpo",
      "Mixto mariscos"
    ]
  },

  corte: {
    tipo: "texto",
    requerido: false,
    opciones: ["Entero", "Filete", "Rodaja", "Limpio", "Pelado"]
  },

  peso: {
    tipo: "texto",
    requerido: false,
    opciones: ["500 g", "1 kg", "2 kg", "Por kilo"]
  },

  uso: {
    tipo: "texto",
    requerido: false,
    opciones: ["Frito", "Plancha", "Ceviche", "Sopa", "Parrilla"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
