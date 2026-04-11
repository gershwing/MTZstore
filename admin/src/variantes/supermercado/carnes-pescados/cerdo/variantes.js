/**
 * VARIANTES - Supermercado > Carnes y Pescados > Cerdo
 * Ruta: admin/src/variantes/supermercado/carnes-pescados/cerdo/variantes.js
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Fresco", "Refrigerado", "Congelado"]
  },

  corte: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Costilla de cerdo",
      "Chuleta de cerdo",
      "Pulpa de cerdo",
      "Lomo de cerdo",
      "Pierna de cerdo",
      "Cuero de cerdo",
      "Cabeza de cerdo",
      "Patas de cerdo",
      "Carne para chicharrón",
      "Carne para fricasé"
    ]
  },

  empaque: {
    tipo: "texto",
    requerido: true,
    opciones: ["A granel", "Bandeja", "Envasado al vacío"]
  },

  peso: {
    tipo: "texto",
    requerido: false,
    opciones: ["500 g", "1 kg", "2 kg", "Por libra", "Por kilo"]
  },

  preparado_para: {
    tipo: "texto",
    requerido: false,
    opciones: ["Chicharrón", "Parrilla", "Horno", "Fritura", "Guiso"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
