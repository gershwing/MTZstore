/**
 * VARIANTES - Moda > Calzado > Zapatillas Damas
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
    opciones: ["Running", "Casual/Lifestyle", "Training/Gym", "Plataforma", "Slip-on", "Canvas"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Blanco", "Negro", "Rosa", "Lila", "Beige", "Azul", "Multicolor"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Nike", "Adidas", "Puma", "New Balance", "Reebok", "Converse", "Vans", "Fila", "Skechers"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
