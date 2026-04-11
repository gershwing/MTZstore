/**
 * VARIANTES - Hogar y Cocina > Decoración > Iluminación
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
    opciones: ["Lámpara de techo", "Lámpara de pie", "Lámpara de mesa", "Aplique de pared", "Plafón", "Tira LED", "Spotlight/Riel", "Colgante/Pendant"]
  },

  tipo_luz: {
    tipo: "texto",
    opciones: ["LED cálida", "LED neutra", "LED fría", "LED RGB", "LED regulable", "Halógena", "Incandescente vintage"]
  },

  control: {
    tipo: "texto",
    opciones: ["Interruptor", "Dimmer/Regulador", "Control remoto", "App/Smart", "Táctil", "Sensor de movimiento"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Philips Hue", "IKEA", "Xiaomi/Yeelight", "EGLO", "Osram", "TP-Link/Tapo", "Genérica"]
  },

  color_producto: {
    tipo: "imagen",
    opciones: ["Blanco", "Negro", "Dorado", "Plateado", "Cobre", "Madera natural", "Verde industrial", "Negro+madera"]
  },

  potencia_w: {
    tipo: "texto",
    opciones: ["5 W", "7 W", "9 W", "12 W", "15 W", "18 W", "24 W", "36 W", "50+ W"]
  },

  compatible_smart_home: {
    tipo: "texto",
    opciones: ["Sí", "No"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
