/**
 * VARIANTES - Supermercado > Carnes y Pescados > Pollo
 * Ruta: admin/src/variantes/supermercado/carnes-pescados/pollo/variantes.js
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
      "Pollo entero",
      "Pechuga",
      "Muslo",
      "Pierna",
      "Ala",
      "Encuentro",
      "Filete de pechuga",
      "Menudencia de pollo",
      "Hígado de pollo",
      "Pollo trozado"
    ]
  },

  empaque: {
    tipo: "texto",
    requerido: true,
    opciones: ["A granel", "Bandeja", "Bolsa", "Envasado"]
  },

  peso: {
    tipo: "texto",
    requerido: false,
    opciones: ["500 g", "1 kg", "2 kg", "Por kilo", "Unidad"]
  },

  preparado_para: {
    tipo: "texto",
    requerido: false,
    opciones: ["Broaster", "Plancha", "Horno", "Parrilla", "Sopa", "Guiso"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
