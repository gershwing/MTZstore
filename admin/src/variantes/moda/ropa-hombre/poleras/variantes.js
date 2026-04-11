/**
 * VARIANTES - Moda > Ropa Hombre > Poleras
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
    opciones: ["Polo", "T-shirt cuello redondo", "T-shirt cuello V", "Manga larga", "Henley", "Tank Top"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Gris", "Azul Marino", "Beige", "Café", "Rojo", "Verde"]
  },

  material: {
    tipo: "texto",
    opciones: ["Algodón 100%", "Algodón/Poliéster", "Dri-Fit/Dry", "Piqué", "Lino"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
