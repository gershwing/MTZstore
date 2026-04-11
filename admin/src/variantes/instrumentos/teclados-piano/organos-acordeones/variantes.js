/**
 * VARIANTES - Instrumentos > Teclados y Piano > Organos y Acordeones
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo", "Usado", "Reacondicionado"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Organo electronico", "Teclado con ritmos", "Acordeon piano",
      "Acordeon de botones", "Acordeon para folklore",
      "Acordeon para cueca / chapaca", "Melodica", "Combo teclado + soporte"
    ]
  },

  teclas_botones: {
    tipo: "texto",
    opciones: ["32 teclas", "49 teclas", "61 teclas", "76 teclas", "Botones"]
  },

  alimentacion: {
    tipo: "texto",
    opciones: ["Corriente", "Pilas", "Mixto"]
  },

  nivel: {
    tipo: "texto",
    opciones: ["Escolar", "Principiante", "Intermedio", "Profesional"]
  },

  incluye: {
    tipo: "texto",
    opciones: ["Solo instrumento", "Con funda", "Con estuche", "Con soporte", "Kit completo"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
