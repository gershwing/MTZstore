/**
 * VARIANTES - Hogar y Cocina > Cocina > Ollas
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


  tipo_producto: {
    tipo: "texto",
    opciones: ["Olla normal", "Olla a presión", "Set de ollas", "Cacerola", "Sartén", "Wok", "Olla de cocción lenta"]
  },

  material: {
    tipo: "texto",
    opciones: ["Acero inoxidable", "Aluminio fundido", "Hierro fundido", "Cerámica", "Antiadherente", "Cobre", "Granito"]
  },

  tamano: {
    tipo: "texto",
    opciones: ["16 cm", "18 cm", "20 cm", "22 cm", "24 cm", "26 cm", "28 cm", "30 cm", "32 cm"]
  },

  compatible_induccion: {
    tipo: "texto",
    opciones: ["Sí", "No"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Gris granito", "Rojo", "Azul marino", "Verde", "Beige", "Blanco", "Inox", "Cobre"]
  },

  piezas_set: {
    tipo: "texto",
    opciones: ["1 pieza", "3 piezas", "5 piezas", "7 piezas", "10 piezas", "12+ piezas"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
