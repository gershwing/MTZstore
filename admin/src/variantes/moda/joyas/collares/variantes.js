/**
 * VARIANTES - Moda > Joyas > Collares
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
    opciones: ["Cadena sola", "Colgante/Pendant", "Choker/Gargantilla", "Collar largo", "Collar de perlas", "Collar multicapas", "Collar nombre personalizado"]
  },

  material: {
    tipo: "texto",
    opciones: ["Oro 18K", "Oro 14K", "Plata 925", "Acero quirúrgico", "Baño de oro", "Fantasía/Bisutería"]
  },

  largo: {
    tipo: "texto",
    opciones: ["35 cm (Choker)", "40 cm", "45 cm (Princess)", "50 cm", "60 cm (Matinee)", "80+ cm (Opera)"]
  },

  color_metal: {
    tipo: "imagen",
    opciones: ["Dorado", "Plateado", "Oro Rosa", "Negro/Gunmetal", "Bicolor"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
