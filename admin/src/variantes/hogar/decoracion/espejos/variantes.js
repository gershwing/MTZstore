/**
 * VARIANTES - Hogar y Cocina > Decoración > Espejos
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


  forma: {
    tipo: "texto",
    opciones: ["Rectangular", "Redondo", "Ovalado", "Arco/Arch", "Irregular/Asimétrico", "Cuerpo completo", "Tríptico"]
  },

  tamano: {
    tipo: "texto",
    opciones: ["30×40 cm", "40×60 cm", "50×70 cm", "60×80 cm", "70×90 cm", "50×150 cm (cuerpo)", "60×180 cm (cuerpo)", "Diámetro 40 cm", "Diámetro 60 cm", "Diámetro 80 cm"]
  },

  color_marco: {
    tipo: "imagen",
    opciones: ["Sin marco", "Negro mate", "Negro brillante", "Blanco", "Dorado", "Plateado", "Madera natural", "Rattan", "Cobre", "Industrial"]
  },

  iluminacion: {
    tipo: "texto",
    opciones: ["Sin luz", "LED perimetral", "LED frontal", "LED trasero (backlit)", "Luz cálida", "Luz regulable"]
  },

  instalacion: {
    tipo: "texto",
    opciones: ["Pared (horizontal)", "Pared (vertical)", "Piso/Reclinado", "Puerta", "Sobremesa"]
  },

  uso: {
    tipo: "texto",
    opciones: ["Baño", "Dormitorio", "Sala/Recibidor", "Vestidor", "Decorativo"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
