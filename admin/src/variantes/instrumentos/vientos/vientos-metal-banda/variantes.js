/**
 * VARIANTES - Instrumentos > Vientos > Vientos de Metal para Banda
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
      "Trompeta", "Trombon", "Trombon de vara", "Bajo / bombardino",
      "Eufonio", "Tuba", "Helicon", "Corneta", "Saxhorn",
      "Instrumento de banda escolar"
    ]
  },

  acabado: {
    tipo: "texto",
    opciones: ["Lacado dorado", "Plateado", "Niquel", "Brillante", "Mate"]
  },

  afinacion: {
    tipo: "texto",
    opciones: ["Bb", "C", "Eb", "F", "Otra"]
  },

  nivel: {
    tipo: "texto",
    opciones: ["Escolar", "Principiante", "Intermedio", "Profesional", "Banda"]
  },

  incluye: {
    tipo: "texto",
    opciones: ["Solo instrumento", "Con boquilla", "Con estuche", "Con boquilla y estuche", "Kit completo"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
