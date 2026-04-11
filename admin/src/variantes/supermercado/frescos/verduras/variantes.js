/**
 * VARIANTES - Supermercado > Frescos > Verduras
 * Ruta: admin/src/variantes/supermercado/frescos/verduras/variantes.js
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Fresco del día", "Refrigerado", "Orgánico / natural"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Papa",
      "Papa imilla",
      "Papa holandesa",
      "Tomate",
      "Cebolla",
      "Zanahoria",
      "Locoto",
      "Ají verde",
      "Ajo",
      "Lechuga",
      "Repollo",
      "Pepino",
      "Brócoli",
      "Coliflor",
      "Remolacha",
      "Arveja",
      "Haba",
      "Yuca",
      "Camote",
      "Zapallo"
    ]
  },

  presentacion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Unidad", "Por libra", "Por kilo", "Atado", "Malla"]
  },

  estado: {
    tipo: "texto",
    requerido: false,
    opciones: ["Entero", "Pelado", "Picado", "Lavado"]
  },

  origen: {
    tipo: "texto",
    requerido: false,
    opciones: ["Altiplano", "Valles", "Oriente", "Local"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
