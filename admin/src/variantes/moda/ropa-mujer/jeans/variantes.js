/**
 * VARIANTES - Moda > Ropa Mujer > Jeans
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
    opciones: ["24", "26", "28", "30", "32", "34", "36"]
  },

  corte: {
    tipo: "texto",
    opciones: ["Skinny", "Slim", "Straight", "Wide Leg", "Mom Jeans", "Flare", "Boyfriend"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Azul Oscuro", "Azul Claro", "Negro", "Gris", "Blanco", "Celeste"]
  },

  tiro: {
    tipo: "texto",
    opciones: ["Tiro alto", "Tiro medio", "Tiro bajo"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
