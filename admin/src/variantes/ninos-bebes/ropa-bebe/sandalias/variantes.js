/**
 * VARIANTES - Niños y Bebés > Ropa Bebé > Sandalias
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  talla: {
    tipo: "texto",
    variante: true,
    opciones: ["17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"]
  },

  tipo: {
    tipo: "texto",
    opciones: ["Sandalia abierta", "Sandalia cerrada", "Chancleta / Ojota", "Sandalia deportiva", "Sandalia de vestir"]
  },

  genero: {
    tipo: "texto",
    opciones: ["Niño", "Niña", "Unisex"]
  },

  color: {
    tipo: "imagen",
    variante: true,
    opciones: []
  },

  material: {
    tipo: "texto",
    opciones: ["Cuero", "Cuero sintético", "Goma / EVA", "Tela", "Plástico"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Pablosky", "Chicco", "Stride Rite", "Bobux", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
