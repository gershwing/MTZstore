/**
 * VARIANTES - Moda > Ropa Mujer > Formal
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
    opciones: ["Traje sastre", "Blazer formal", "Pantalón vestir", "Falda lápiz", "Vestido ejecutivo", "Blusa formal"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Azul Marino", "Gris", "Blanco", "Beige", "Burdeos", "Rosa Pálido"]
  },

  corte: {
    tipo: "texto",
    opciones: ["Slim Fit", "Regular Fit", "Oversize", "Entallado"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
