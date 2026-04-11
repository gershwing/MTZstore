/**
 * VARIANTES - Hogar y Cocina > Electrodomésticos > Lavadoras
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
    opciones: ["Carga frontal", "Carga superior", "Lavadora-secadora", "Semi automática", "Industrial"]
  },

  capacidad: {
    tipo: "texto",
    opciones: ["7 kg", "8 kg", "9 kg", "10 kg", "11 kg", "12 kg", "13 kg", "14 kg", "15+ kg"]
  },

  velocidad_centrifugado: {
    tipo: "texto",
    opciones: ["800 RPM", "1000 RPM", "1200 RPM", "1400 RPM", "1600 RPM"]
  },

  eficiencia_energetica: {
    tipo: "texto",
    opciones: ["A+++", "A++", "A+", "A", "B"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Samsung", "LG", "Whirlpool", "Bosch", "Electrolux", "Mabe", "Midea"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Blanco", "Gris", "Negro", "Inox"]
  },

  con_vapor: {
    tipo: "texto",
    opciones: ["Sí", "No"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
