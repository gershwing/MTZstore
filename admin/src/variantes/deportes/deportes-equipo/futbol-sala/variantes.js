/**
 * VARIANTES - Deportes > Deportes de Equipo > Futbol Sala
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: ["Balon de futsal", "Zapatillas de futsal", "Canilleras futsal", "Porteria futsal plegable", "Ropa deportiva futsal", "Medias de futsal"]
  },

  numero_balon: {
    tipo: "texto",
    opciones: ["4 (oficial futsal)", "3 (junior)"]
  },

  talla_ropa: {
    tipo: "texto",
    variante: true,
    opciones: ["XS", "S", "M", "L", "XL", "XXL"]
  },

  talla_calzado: {
    tipo: "texto",
    variante: true,
    opciones: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"]
  },

  color: {
    tipo: "imagen",
    variante: true,
    opciones: []
  },

  marca: {
    tipo: "texto",
    opciones: ["Nike", "Adidas", "Puma", "Penalty", "Umbro", "Joma", "Kelme", "Molten", "Mikasa", "Generico"]
  },

  material_balon: {
    tipo: "texto",
    opciones: ["Cuero sintetico", "PU laminado", "PVC", "Fieltro bajo rebote"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
