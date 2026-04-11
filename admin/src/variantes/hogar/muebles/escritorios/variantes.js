/**
 * VARIANTES - Hogar y Cocina > Muebles > Escritorios
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
    opciones: ["Escritorio simple", "Escritorio en L", "Standing desk", "Gamer", "Flotante/Mural", "Con estantería", "Plegable"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Blanco", "Negro", "Roble", "Nogal", "Gris", "Blanco+negro", "Madera+metal negro"]
  },

  material: {
    tipo: "texto",
    opciones: ["MDF/Melamina", "Madera maciza", "Vidrio+metal", "Metal+MDF", "Bambú"]
  },

  ancho_cm: {
    tipo: "texto",
    opciones: ["80 cm", "100 cm", "120 cm", "140 cm", "160 cm", "180 cm"]
  },

  con_cajones: {
    tipo: "texto",
    opciones: ["Sin cajones", "1 cajón", "2 cajones", "3 cajones", "Con gavetero"]
  },

  con_led: {
    tipo: "texto",
    opciones: ["Sí", "No"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
