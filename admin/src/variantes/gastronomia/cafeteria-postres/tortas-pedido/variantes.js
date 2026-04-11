/**
 * VARIANTES - Gastronomia > Cafeteria y Postres > Tortas Pedido
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Pedido con anticipacion", "Disponible hoy"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Torta de chocolate", "Torta de vainilla", "Torta de frutilla", "Torta de mango",
      "Torta tropical", "Torta tres leches", "Torta selva negra", "Torta red velvet",
      "Torta de durazno con crema", "Torta personalizada"
    ]
  },

  tamano: {
    tipo: "texto",
    requerido: true,
    opciones: ["Pequena (6 porciones)", "Mediana (10 porciones)", "Grande (20 porciones)", "Extra grande"]
  },

  relleno: {
    tipo: "texto",
    opciones: ["Chocolate", "Manjar / dulce de leche", "Frutilla", "Durazno", "Pina", "Crema pastelera", "Mixto"]
  },

  cobertura: {
    tipo: "texto",
    opciones: ["Crema", "Chantilly", "Ganache", "Fondant", "Merengue"]
  },

  dedicatoria: {
    tipo: "texto",
    opciones: ["Sin dedicatoria", "Con dedicatoria personalizada"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
