/**
 * VARIANTES - Moda > Ropa Mujer > Vestidos
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
    opciones: ["Casual", "Cocktail", "Largo/Maxi", "Midi", "Mini", "Bodycon", "Camisero", "Wrap"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Rosa", "Rojo", "Azul", "Beige", "Lila", "Verde", "Dorado"]
  },

  material: {
    tipo: "texto",
    opciones: ["Algodón", "Poliéster", "Seda", "Satén", "Encaje", "Chiffon", "Lino"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
