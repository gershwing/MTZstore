/**
 * VARIANTES - Moda > Ropa Mujer > Interiores
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
    opciones: ["XS", "S", "M", "L", "XL", "XXL", "30", "32", "34", "36", "38"]
  },

  tipo: {
    tipo: "texto",
    opciones: ["Brasier/Sujetador", "Panty/Bikini", "Tanga", "Boxer mujer", "Conjunto", "Body lencería", "Calcetines (pack)"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Nude/Piel", "Rosa", "Rojo", "Lila", "Encaje Negro"]
  },

  pack: {
    tipo: "texto",
    opciones: ["Unidad", "Pack 3", "Pack 5"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
