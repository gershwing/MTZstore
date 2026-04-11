/**
 * VARIANTES - Hogar y Cocina > Muebles > Roperos
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
    opciones: ["2 puertas", "3 puertas", "4 puertas", "Puerta corredera", "Vestidor abierto", "Closet empotrado", "Armario esquinero"]
  },

  tamano_ancho: {
    tipo: "texto",
    opciones: ["80 cm", "100 cm", "120 cm", "150 cm", "180 cm", "200 cm", "220 cm", "250+ cm"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Blanco", "Blanco brillante", "Gris claro", "Nogal", "Roble claro", "Negro mate", "Wengué", "Beige"]
  },

  material: {
    tipo: "texto",
    opciones: ["MDF/Melamina", "Madera maciza", "Aglomerado", "MDF lacado", "Mixto"]
  },

  interior: {
    tipo: "texto",
    opciones: ["Básico (barra + estantes)", "Completo (barra + cajones + estantes)", "Con espejo interior", "Personalizable", "Con zapatero"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
