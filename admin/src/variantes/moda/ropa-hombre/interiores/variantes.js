/**
 * VARIANTES - Moda > Ropa Hombre > Interiores
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
    opciones: ["Boxer brief", "Boxer largo", "Trunk", "Brief/Slip", "Calcetines (pack)", "Camiseta interior"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Gris", "Azul Marino", "Surtido/Pack"]
  },

  pack: {
    tipo: "texto",
    opciones: ["Unidad", "Pack 3", "Pack 5", "Pack 7"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
