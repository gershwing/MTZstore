/**
 * VARIANTES - Instrumentos > Percusion > Percusion Andina
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
      "Bombo leguero", "Bombo folklorico", "Huancara", "Caja",
      "Redoblante de banda", "Chajchas", "Matraca",
      "Pandero folklorico", "Set de percusion andina"
    ]
  },

  material: {
    tipo: "texto",
    opciones: ["Madera", "Cuero natural", "Sintetico", "Mixto"]
  },

  tamano: {
    tipo: "texto",
    opciones: ["Pequeno", "Mediano", "Grande", "Escolar", "Profesional"]
  },

  uso: {
    tipo: "texto",
    opciones: ["Folklore", "Banda", "Escolar", "Escenario", "Ensayo"]
  },

  incluye: {
    tipo: "texto",
    opciones: ["Solo instrumento", "Con baquetas", "Con correa", "Kit completo"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
