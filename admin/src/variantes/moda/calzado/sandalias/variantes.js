/**
 * VARIANTES - Moda > Calzado > Sandalias
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
    opciones: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44"]
  },

  tipo: {
    tipo: "texto",
    opciones: ["Sandalia plana", "Sandalia con tacón", "Plataforma", "Chancla/Slide", "Huarache", "Deportiva/Outdoor", "Birkenstock style"]
  },

  genero: {
    tipo: "texto",
    opciones: ["Hombre", "Mujer", "Unisex"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Café", "Beige", "Blanco", "Rosa", "Dorado", "Multicolor"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
