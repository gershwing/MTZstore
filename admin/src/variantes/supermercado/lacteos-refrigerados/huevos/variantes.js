/**
 * VARIANTES - Supermercado > Lácteos y Refrigerados > Huevos
 * Ruta: admin/src/variantes/supermercado/lacteos-refrigerados/huevos/variantes.js
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Fresco", "Refrigerado"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Huevo blanco",
      "Huevo rosado",
      "Huevo criollo",
      "Huevo de codorniz"
    ]
  },

  presentacion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Maple", "Media docena", "Docena", "Caja"]
  },

  tamano: {
    tipo: "texto",
    requerido: false,
    opciones: ["Pequeño", "Mediano", "Grande"]
  },

  origen: {
    tipo: "texto",
    requerido: false,
    opciones: ["Granja", "Criollo", "Orgánico"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
