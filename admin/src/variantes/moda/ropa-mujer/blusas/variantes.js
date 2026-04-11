/**
 * VARIANTES - Moda > Ropa Mujer > Blusas
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
    opciones: ["Blusa manga corta", "Blusa manga larga", "Crop top", "Camiseta", "Body", "Off-shoulder", "Peplum"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Rosa", "Rojo", "Azul", "Beige", "Lila", "Verde", "Dorado"]
  },

  material: {
    tipo: "texto",
    opciones: ["Algodón", "Poliéster", "Seda", "Chiffon", "Encaje", "Satén"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
