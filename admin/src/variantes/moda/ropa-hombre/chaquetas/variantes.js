/**
 * VARIANTES - Moda > Ropa Hombre > Chaquetas
 *
 * tipo: "imagen" → selector con foto del producto (estilo AliExpress)
 * tipo: "texto"  → selector de chips / botones de texto
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo", "De retorno"]
  },


  talla: {
    tipo: "texto",
    requerido: true,
    opciones: ["XS", "S", "M", "L", "XL", "XXL", "3XL"]
  },

  tipo: {
    tipo: "texto",
    opciones: ["Bomber", "Denim", "Cuero", "Cortavientos", "Parka", "Puffer/Acolchada", "Blazer Casual"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Azul Marino", "Gris", "Café", "Verde Militar", "Beige", "Burdeos"]
  },

  material: {
    tipo: "texto",
    opciones: ["Cuero genuino", "Cuero sintético", "Denim", "Nylon", "Poliéster", "Algodón"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
