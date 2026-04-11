/**
 * VARIANTES - Moda > Ropa Hombre > Formal
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
    opciones: ["Camisa vestir", "Traje completo", "Saco/Blazer", "Pantalón vestir", "Chaleco", "Corbata"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Azul Marino", "Gris Oscuro", "Gris Claro", "Blanco", "Celeste", "Burdeos", "Beige"]
  },

  corte: {
    tipo: "texto",
    opciones: ["Slim Fit", "Regular Fit", "Modern Fit", "Tailored Fit"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
