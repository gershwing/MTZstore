/**
 * VARIANTES - Hogar y Cocina > Muebles > Mesas
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
    opciones: ["Comedor", "Centro/Coffee table", "Auxiliar/Lateral", "Consola", "Bar/Alta", "Extensible", "Plegable"]
  },

  capacidad_comedor: {
    tipo: "texto",
    opciones: ["2 personas", "4 personas", "6 personas", "8 personas", "10 personas", "12+ personas", "N/A"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Blanco", "Roble claro", "Nogal", "Negro", "Gris", "Mármol blanco", "Mármol negro", "Verde", "Inox", "Natural madera"]
  },

  material_tablero: {
    tipo: "texto",
    opciones: ["Madera maciza", "MDF/Melamina", "Vidrio templado", "Mármol", "Cerámica", "Madera+resina"]
  },

  material_patas: {
    tipo: "texto",
    opciones: ["Madera", "Metal negro", "Metal dorado", "Cromado", "Hierro forjado", "Mismas del tablero"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
