/**
 * VARIANTES - Deportes > Deportes de Equipo > Voley
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
    opciones: ["Balon de voley indoor", "Balon de voley playa", "Red de voley", "Rodilleras voley", "Canilleras", "Zapatillas de voley", "Ropa deportiva voley"]
  },

  numero_balon: {
    tipo: "texto",
    opciones: ["5 (oficial)", "4 (junior)"]
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
    opciones: ["Mikasa", "Molten", "Wilson", "Spalding", "Nike", "Adidas", "Mizuno", "Asics", "Generico"]
  },

  material_balon: {
    tipo: "texto",
    opciones: ["Cuero sintetico", "PU laminado", "PVC", "Microfibra"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
