/**
 * VARIANTES - Gastronomia > Bebidas Delivery > Jugos y Smoothies
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Listo para entregar"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Jugo de naranja natural", "Jugo de naranja + zanahoria", "Jugo de papaya",
      "Jugo de frutilla", "Jugo de mango", "Jugo de maracuya", "Jugo surtido",
      "Limonada natural", "Limonada de hierbabuena", "Mocochinchi frio",
      "Somo", "Tojori", "Api morado", "Api blanco",
      "Smoothie de frutilla + platano", "Smoothie tropical", "Smoothie verde",
      "Batido de platano con leche"
    ]
  },

  tamano: {
    tipo: "texto",
    requerido: true,
    opciones: ["Pequeno (250 ml)", "Mediano (350 ml)", "Grande (500 ml)", "Botella (1 L)"]
  },

  endulzante: {
    tipo: "texto",
    opciones: ["Azucar normal", "Sin azucar", "Con miel", "Con edulcorante"]
  },

  base: {
    tipo: "texto",
    opciones: ["Con agua", "Con leche", "Con yogur", "Con leche vegetal"]
  },

  hielo: {
    tipo: "texto",
    opciones: ["Con hielo", "Sin hielo", "Extra hielo"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
