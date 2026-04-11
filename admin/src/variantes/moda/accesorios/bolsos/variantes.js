/**
 * VARIANTES - Moda > Accesorios > Bolsos
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
    opciones: ["Tote", "Crossbody/Bandolera", "Shoulder bag", "Clutch/Sobre", "Mochila fashion", "Bucket bag", "Satchel"]
  },

  tamanio: {
    tipo: "texto",
    opciones: ["Mini", "Pequeño", "Mediano", "Grande", "Extra grande"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Café", "Beige", "Blanco", "Rojo", "Rosa", "Azul Marino", "Dorado", "Nude"]
  },

  material: {
    tipo: "texto",
    opciones: ["Cuero genuino", "Cuero sintético/PU", "Tela/Canvas", "Nylon", "Rafia"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
