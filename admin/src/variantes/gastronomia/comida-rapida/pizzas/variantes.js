/**
 * VARIANTES - Gastronomia > Comida Rapida > Pizzas
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Horneado al momento"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Pizza mozzarella", "Pizza de jamon y queso", "Pizza hawaiana",
      "Pizza pepperoni", "Pizza de carnes", "Pizza de pollo",
      "Pizza vegetariana", "Pizza especial de la casa", "Pizza cuatro quesos", "Calzone"
    ]
  },

  tamano: {
    tipo: "texto",
    requerido: true,
    opciones: ["Personal", "Mediana", "Grande", "Familiar"]
  },

  masa: {
    tipo: "texto",
    opciones: ["Masa normal", "Masa delgada", "Masa gruesa"]
  },

  queso: {
    tipo: "texto",
    opciones: ["Normal", "Extra queso", "Borde relleno"]
  },

  cortes: {
    tipo: "texto",
    opciones: ["4 porciones", "6 porciones", "8 porciones", "12 porciones"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
