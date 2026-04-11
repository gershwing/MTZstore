/**
 * VARIANTES - Supermercado > Frescos > Frutas
 * Ruta: admin/src/variantes/supermercado/frescos/frutas/variantes.js
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
      "Banano / plátano",
      "Manzana",
      "Naranja",
      "Mandarina",
      "Limón",
      "Papaya",
      "Piña",
      "Mango",
      "Sandía",
      "Melón",
      "Frutilla",
      "Uva",
      "Durazno",
      "Chirimoya",
      "Maracuyá",
      "Coco",
      "Palta",
      "Tumbo"
    ]
  },

  presentacion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Unidad", "Por libra", "Por kilo", "Bandeja", "Canastilla"]
  },

  maduracion: {
    tipo: "texto",
    requerido: false,
    opciones: ["Verde", "Pintón", "Maduro", "Listo para consumir"]
  },

  origen: {
    tipo: "texto",
    requerido: false,
    opciones: ["Altiplano", "Valles", "Oriente", "Importado"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
