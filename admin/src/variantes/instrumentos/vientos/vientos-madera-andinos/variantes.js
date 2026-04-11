/**
 * VARIANTES - Instrumentos > Vientos > Vientos de Madera Andinos
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo", "Usado", "Artesanal", "Hecho a mano"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Quena", "Quenacho", "Zampona / siku", "Zampona malta",
      "Zampona zanka", "Zampona toyo", "Tarka", "Pinquillo",
      "Moseno", "Anata", "Flauta andina", "Set de sikus"
    ]
  },

  material: {
    tipo: "texto",
    opciones: ["Madera", "Bambu / cana", "PVC", "Mixto", "Artesanal"]
  },

  afinacion: {
    tipo: "texto",
    opciones: ["Do (C)", "Re (D)", "Mi (E)", "Fa (F)", "Sol (G)", "La (A)", "Si bemol (Bb)", "Otra"]
  },

  tamano: {
    tipo: "texto",
    opciones: ["Pequeno", "Mediano", "Grande", "Toyo / grave"]
  },

  nivel: {
    tipo: "texto",
    opciones: ["Escolar", "Principiante", "Intermedio", "Profesional", "Folklorico"]
  },

  incluye: {
    tipo: "texto",
    opciones: ["Solo instrumento", "Con funda", "Con estuche", "Set completo"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
