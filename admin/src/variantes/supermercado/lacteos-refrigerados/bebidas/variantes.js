/**
 * VARIANTES - Supermercado > Lácteos y Refrigerados > Bebidas
 * Ruta: admin/src/variantes/supermercado/lacteos-refrigerados/bebidas/variantes.js
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Sellado de fábrica", "Refrigerado", "Artesanal"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Agua sin gas",
      "Agua con gas",
      "Gaseosa",
      "Jugo en caja",
      "Jugo en botella",
      "Yogur bebible",
      "Leche saborizada",
      "Energizante",
      "Té frío",
      "Api morado embotellado",
      "Api blanco embotellado",
      "Mocochinchi",
      "Somó",
      "Tojorí",
      "Chicha"
    ]
  },

  presentacion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Botella", "Lata", "Caja", "Bolsa", "Vaso"]
  },

  volumen: {
    tipo: "texto",
    requerido: false,
    opciones: ["250 ml", "330 ml", "500 ml", "1 L", "1.5 L", "2 L"]
  },

  temperatura: {
    tipo: "texto",
    requerido: false,
    opciones: ["Natural", "Frío", "Helado"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
