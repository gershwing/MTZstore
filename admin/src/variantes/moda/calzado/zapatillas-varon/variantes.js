/**
 * VARIANTES - Moda > Calzado > Zapatillas Varón
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
    opciones: ["38", "39", "40", "41", "42", "43", "44", "45"]
  },

  tipo: {
    tipo: "texto",
    opciones: ["Running", "Casual/Lifestyle", "Basketball", "Skate", "Training/Gym", "Trail"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Gris", "Azul", "Rojo", "Negro/Blanco", "Multicolor"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Nike", "Adidas", "Puma", "New Balance", "Reebok", "Converse", "Vans", "Fila"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
