/**
 * VARIANTES - Supermercado > Lácteos y Refrigerados > Lácteos
 * Ruta: admin/src/variantes/supermercado/lacteos-refrigerados/lacteos/variantes.js
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
      "Leche entera",
      "Leche deslactosada",
      "Leche evaporada",
      "Yogur natural",
      "Yogur saborizado",
      "Queso criollo",
      "Queso fresco",
      "Queso mozzarella",
      "Quesillo",
      "Mantequilla",
      "Crema de leche",
      "Manjar / dulce de leche"
    ]
  },

  presentacion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Bolsa", "Botella", "Caja", "Tarrina", "Paquete", "Por kilo"]
  },

  contenido: {
    tipo: "texto",
    requerido: false,
    opciones: ["200 ml", "500 ml", "1 L", "250 g", "500 g", "1 kg"]
  },

  estilo: {
    tipo: "texto",
    requerido: false,
    opciones: ["Natural", "Light", "Artesanal", "Saborizado"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
