/**
 * VARIANTES - Hogar y Cocina > Electrodomésticos > Aires Acondicionados
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
    opciones: ["Split", "Inverter", "Split Inverter", "Portátil", "Ventana", "Cassette", "Piso-techo"]
  },

  capacidad_btu: {
    tipo: "texto",
    opciones: ["9000 BTU", "12000 BTU", "18000 BTU", "24000 BTU", "36000 BTU", "48000 BTU"]
  },

  eficiencia: {
    tipo: "texto",
    opciones: ["A+++", "A++", "A+", "A", "B", "SEER 19+", "SEER 16-18"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Samsung", "LG", "Daikin", "Midea", "Carrier", "Gree", "Panasonic", "Hisense"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Blanco", "Gris platino", "Negro", "Inox"]
  },

  funcion_calor: {
    tipo: "texto",
    opciones: ["Solo frío", "Frío/Calor"]
  },

  wifi: {
    tipo: "texto",
    opciones: ["Sí", "No"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
