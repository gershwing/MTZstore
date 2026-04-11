/**
 * VARIANTES - Gastronomia > Cafeteria y Postres > Postres
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Listo para servir"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Flan casero", "Arroz con leche", "Gelatina de mosaico", "Gelatina simple",
      "Ensalada de frutas con crema", "Helado artesanal", "Queque casero", "Budin",
      "Cunape dulce", "Mazamorra morada", "Pastel tres leches", "Selva negra",
      "Cheesecake de frutilla", "Cheesecake de maracuya", "Brazo gitano"
    ]
  },

  sabor: {
    tipo: "texto",
    opciones: ["Chocolate", "Vainilla", "Frutilla", "Mango", "Maracuya", "Coco", "Mixto"]
  },

  porcion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Individual", "Porcion mediana", "Porcion grande", "Familiar"]
  },

  topping: {
    tipo: "texto",
    opciones: ["Sin topping", "Crema", "Chocolate", "Frutas", "Dulce de leche"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
