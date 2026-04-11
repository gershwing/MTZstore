/**
 * VARIANTES - Moda > Calzado > Botas
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
    opciones: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"]
  },

  tipo: {
    tipo: "texto",
    opciones: ["Bota corta/Botín", "Bota media caña", "Bota larga", "Bota Chelsea", "Bota militar/Combat", "Bota vaquera/Western", "Bota de trabajo"]
  },

  genero: {
    tipo: "texto",
    opciones: ["Hombre", "Mujer", "Unisex"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Café", "Marrón", "Camel", "Gris", "Burdeos"]
  },

  material: {
    tipo: "texto",
    opciones: ["Cuero genuino", "Cuero sintético", "Tela/Canvas", "Gamuza", "Nylon/Mesh"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
