/**
 * VARIANTES - Gastronomia > Bebidas Delivery > Bebidas Calientes
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
      "Api morado caliente", "Api blanco caliente", "Tojori caliente",
      "Chocolate caliente", "Te de coca", "Te de manzanilla", "Te de canela",
      "Mate de anis", "Cafe con leche", "Cafe americano", "Infusion de hierbas"
    ]
  },

  tamano: {
    tipo: "texto",
    requerido: true,
    opciones: ["Pequeno", "Mediano", "Grande"]
  },

  azucar: {
    tipo: "texto",
    opciones: ["Con azucar", "Poca azucar", "Sin azucar", "Con miel"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
