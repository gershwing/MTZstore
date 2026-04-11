/**
 * VARIANTES - Supermercado > Frescos > Panadería
 * Ruta: admin/src/variantes/supermercado/frescos/panaderia/variantes.js
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Recién horneado", "Del día", "Empacado"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Pan corriente",
      "Marraqueta",
      "Hallulla",
      "Pan francés",
      "Pan de batalla",
      "Pan integral",
      "Pan de molde",
      "Pan de arroz",
      "Cuñapé",
      "Bizcocho",
      "Rosca",
      "Galleta de horno",
      "Empanada de queso",
      "Empanada de pollo",
      "Pastel"
    ]
  },

  presentacion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Unidad", "Docena", "Bolsa", "Paquete"]
  },

  textura: {
    tipo: "texto",
    requerido: false,
    opciones: ["Blando", "Crocante", "Integral", "Relleno"]
  },

  tamano: {
    tipo: "texto",
    requerido: false,
    opciones: ["Pequeño", "Mediano", "Grande"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
