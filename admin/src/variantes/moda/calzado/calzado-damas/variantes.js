/**
 * VARIANTES - Moda > Calzado > Calzado Damas
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
    opciones: ["35", "36", "37", "38", "39", "40", "41"]
  },

  tipo: {
    tipo: "texto",
    opciones: ["Tacón alto", "Tacón medio", "Tacón bajo/Kitten", "Ballerina/Flat", "Mocasín", "Plataforma", "Mule", "Stiletto"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Nude/Beige", "Rojo", "Blanco", "Dorado", "Plateado", "Rosa", "Café"]
  },

  material: {
    tipo: "texto",
    opciones: ["Cuero genuino", "Cuero sintético", "Tela/Canvas", "Gamuza", "Nylon/Mesh"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
