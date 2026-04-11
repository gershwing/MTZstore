/**
 * VARIANTES - Moda > Joyas > Brazaletes
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


  tipo: {
    tipo: "texto",
    opciones: ["Pulsera cadena", "Brazalete rígido", "Pulsera ajustable", "Tennis bracelet", "Charm bracelet", "Cuff/Puño", "Hilo/Macramé"]
  },

  material: {
    tipo: "texto",
    opciones: ["Oro 18K", "Oro 14K", "Plata 925", "Acero quirúrgico", "Baño de oro", "Cuero", "Fantasía/Bisutería"]
  },

  tamanio: {
    tipo: "texto",
    opciones: ["15 cm", "16 cm", "17 cm", "18 cm", "19 cm", "20 cm", "Ajustable"]
  },

  color_metal: {
    tipo: "imagen",
    opciones: ["Dorado", "Plateado", "Oro Rosa", "Negro/Gunmetal", "Bicolor"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
