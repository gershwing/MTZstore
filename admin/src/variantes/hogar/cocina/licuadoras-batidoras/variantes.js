/**
 * VARIANTES - Hogar y Cocina > Cocina > Licuadoras y Batidoras
 *
 * tipo: "imagen" → selector con foto del producto (estilo AliExpress)
 * tipo: "texto"  → selector de chips / botones de texto
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },


  tipo: {
    tipo: "texto",
    opciones: ["Licuadora de vaso", "Batidora de mano", "Batidora de pedestal", "Procesador de alimentos", "Nutribullet/Personal", "Batidora de inmersión"]
  },

  potencia: {
    tipo: "texto",
    opciones: ["300 W", "400 W", "500 W", "600 W", "700 W", "800 W", "1000 W", "1200+ W"]
  },

  capacidad_jarra: {
    tipo: "texto",
    opciones: ["0.5 L", "0.6 L", "1 L", "1.25 L", "1.5 L", "1.75 L", "2 L", "3+ L"]
  },

  marca_modelo: {
    tipo: "texto",
    opciones: ["KitchenAid", "Oster", "Ninja", "Nutribullet", "Philips", "Braun", "Hamilton Beach", "Black+Decker"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Rojo", "Plateado", "Gris", "Azul marino", "Verde pino", "Crema"]
  },

  velocidades: {
    tipo: "texto",
    opciones: ["2 velocidades", "3 velocidades", "5 velocidades", "10 velocidades", "Variable"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
