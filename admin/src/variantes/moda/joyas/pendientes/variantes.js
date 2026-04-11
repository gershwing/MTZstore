/**
 * VARIANTES - Moda > Joyas > Pendientes
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
    opciones: ["Argolla/Hoop", "Stud/Dormilona", "Colgante/Drop", "Chandelier", "Ear Cuff", "Huggie", "Clip-on"]
  },

  material: {
    tipo: "texto",
    opciones: ["Oro 18K", "Oro 14K", "Plata 925", "Acero quirúrgico", "Baño de oro", "Fantasía/Bisutería"]
  },

  piedra: {
    tipo: "texto",
    opciones: ["Sin piedra", "Circón/CZ", "Perla", "Cristal Swarovski", "Diamante", "Esmeralda", "Rubí"]
  },

  color_metal: {
    tipo: "imagen",
    opciones: ["Dorado", "Plateado", "Oro Rosa", "Negro/Gunmetal", "Bicolor"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
