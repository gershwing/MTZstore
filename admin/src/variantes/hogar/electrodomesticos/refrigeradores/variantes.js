/**
 * VARIANTES - Hogar y Cocina > Electrodomésticos > Refrigeradores
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
    opciones: ["No Frost", "Frost", "Side by Side", "French Door", "Top Mount", "Bottom Mount", "Minibar"]
  },

  capacidad: {
    tipo: "texto",
    opciones: ["150 L", "200 L", "250 L", "300 L", "350 L", "400 L", "450 L", "500 L", "550+ L"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Samsung", "LG", "Mabe", "Whirlpool", "Bosch", "Frigidaire", "Electrolux", "Midea", "Hisense"]
  },

  eficiencia_energetica: {
    tipo: "texto",
    opciones: ["A+++", "A++", "A+", "A", "B", "C"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Blanco", "Gris platino", "Inox", "Negro", "Plateado titanio", "Champán"]
  },

  ancho_cm: {
    tipo: "texto",
    opciones: ["55 cm", "60 cm", "65 cm", "70 cm", "80 cm", "90 cm"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
