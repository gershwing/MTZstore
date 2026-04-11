/**
 * VARIANTES - Hogar y Cocina > Electrodomésticos > Microondas
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
    opciones: ["Solo microondas", "Con grill", "Inverter", "Empotrable", "Sobre encimera"]
  },

  capacidad: {
    tipo: "texto",
    opciones: ["17 L", "20 L", "23 L", "25 L", "28 L", "30 L", "32 L", "40+ L"]
  },

  potencia: {
    tipo: "texto",
    opciones: ["700 W", "800 W", "900 W", "1000 W", "1100 W", "1200 W"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Samsung", "LG", "Panasonic", "Whirlpool", "Midea", "Electrolux", "Daewoo"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Blanco", "Negro", "Inox", "Plateado"]
  },

  panel: {
    tipo: "texto",
    opciones: ["Digital", "Mecánico", "Táctil"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
