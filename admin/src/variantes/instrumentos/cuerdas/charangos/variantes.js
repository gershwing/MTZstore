/**
 * VARIANTES - Instrumentos > Cuerdas > Charangos
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo", "Usado", "Hecho a mano / luthier", "Importado"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Charango tradicional", "Charango de estudio", "Charango profesional",
      "Ronroco", "Walaycho", "Chillador", "Charango electroacustico",
      "Charango con estuche"
    ]
  },

  material_caja: {
    tipo: "texto",
    opciones: ["Madera laminada", "Madera maciza", "Cedro", "Palo santo", "Jacaranda", "Otro"]
  },

  cuerdas: {
    tipo: "texto",
    opciones: ["5 ordenes dobles", "10 cuerdas", "Nylon", "Metal", "Mixto"]
  },

  acabado: {
    tipo: "texto",
    opciones: ["Natural", "Brillante", "Mate", "Tallado artesanal"]
  },

  nivel: {
    tipo: "texto",
    opciones: ["Escolar", "Principiante", "Intermedio", "Profesional"]
  },

  incluye: {
    tipo: "texto",
    opciones: ["Solo instrumento", "Con funda", "Con estuche", "Con unetas", "Kit completo"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
