/**
 * VARIANTES - Supermercado > Carnes y Pescados > Carne de Res
 * Ruta: admin/src/variantes/supermercado/carnes-pescados/carne-res/variantes.js
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
      "Pulpa",
      "Molida especial",
      "Molida corriente",
      "Lomo",
      "Bistec",
      "Costilla",
      "Pecho",
      "Osobuco",
      "Chuleta de res",
      "Carne para asado",
      "Carne para churrasco",
      "Menudencia de res",
      "Hígado de res",
      "Corazón de res"
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
    opciones: ["Parrilla", "Guiso", "Sopa", "Milanesa", "Molida", "Estofado"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
