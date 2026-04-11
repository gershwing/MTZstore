/**
 * VARIANTES - Gastronomia > Cafeteria y Postres > Cafeteria
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Preparado al momento"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Cafe americano", "Cafe espresso", "Cafe doble", "Cafe con leche",
      "Capuchino", "Latte", "Mocaccino", "Chocolate caliente",
      "Chocolate con canela", "Api con pastel", "Te con canela",
      "Te de coca", "Te de manzanilla", "Mate de anis"
    ]
  },

  tamano: {
    tipo: "texto",
    requerido: true,
    opciones: ["Pequeno", "Mediano", "Grande"]
  },

  azucar: {
    tipo: "texto",
    opciones: ["Con azucar", "Poca azucar", "Sin azucar", "Con edulcorante"]
  },

  leche: {
    tipo: "texto",
    opciones: ["Leche entera", "Leche deslactosada", "Leche vegetal", "Sin leche"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
