/**
 * VARIANTES - Supermercado > Carnes y Pescados > Carne de Llama
 * Ruta: admin/src/variantes/supermercado/carnes-pescados/carne-llama/variantes.js
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Fresco", "Refrigerado", "Congelado", "Deshidratado / charqueado"]
  },

  corte: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Pulpa de llama",
      "Lomo de llama",
      "Bistec de llama",
      "Chuleta de llama",
      "Costilla de llama",
      "Carne molida de llama",
      "Carne para estofado",
      "Carne para asado",
      "Carne para sajra / guiso",
      "Charque de llama",
      "Medallón de llama",
      "Hamburguesa de llama",
      "Chorizo de llama",
      "Menudencia de llama",
      "Hígado de llama"
    ]
  },

  empaque: {
    tipo: "texto",
    requerido: true,
    opciones: ["A granel", "Bandeja", "Envasado al vacío", "Paquete"]
  },

  peso: {
    tipo: "texto",
    requerido: false,
    opciones: ["250 g", "500 g", "1 kg", "2 kg", "Por libra", "Por kilo"]
  },

  preparado_para: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Bistec",
      "Parrilla",
      "Asado",
      "Estofado",
      "Guiso",
      "Charke / charquekan",
      "Hamburguesa",
      "Milanesa"
    ]
  },

  grasa: {
    tipo: "texto",
    requerido: false,
    opciones: ["Magra", "Semimagra", "Con grasa"]
  },

  sazonado: {
    tipo: "texto",
    requerido: false,
    opciones: ["Natural", "Adobado", "Aliñado", "Sin sal", "Marinado"]
  },

  origen: {
    tipo: "texto",
    requerido: false,
    opciones: ["Altiplano", "Oruro", "La Paz", "Potosí", "Nacional"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
