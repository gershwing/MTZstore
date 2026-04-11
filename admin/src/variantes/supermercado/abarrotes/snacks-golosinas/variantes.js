/**
 * VARIANTES - Supermercado > Abarrotes > Snacks y Golosinas
 * Ruta: admin/src/variantes/supermercado/abarrotes/snacks-golosinas/variantes.js
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Sellado de fábrica", "Artesanal", "A granel"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Papas fritas",
      "Palitos salados",
      "Chizitos",
      "Maní salado",
      "Maní confitado",
      "Mix de frutos secos",
      "Galletas dulces",
      "Galletas saladas",
      "Chocolate en barra",
      "Caramelos",
      "Chicles",
      "Wafer",
      "Gelatina en vaso",
      "Turrón",
      "Coco rallado dulce",
      "Pipocas",
      "Pasankalla",
      "Tabletas de dulce de maní"
    ]
  },

  presentacion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Unidad", "Paquete", "Bolsa", "Caja", "Frasco"]
  },

  sabor: {
    tipo: "texto",
    requerido: false,
    opciones: ["Salado", "Dulce", "Picante", "Queso", "Chocolate", "Frutilla", "Mixto"]
  },

  tamano: {
    tipo: "texto",
    requerido: false,
    opciones: ["Pequeño", "Mediano", "Grande", "Familiar"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
