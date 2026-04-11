/**
 * VARIANTES - Gastronomia > Cocina del Mundo > Comida China
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Preparado al momento"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Arroz chaufa", "Tallarin saltado", "Pollo agridulce", "Pollo broaster estilo chino",
      "Pollo con verduras", "Carne salteada con arroz", "Wantan frito", "Wantan al vapor",
      "Sopa wantan", "Combo arroz + pollo"
    ]
  },

  porcion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Individual", "Medio", "Familiar"]
  },

  picante: {
    tipo: "texto",
    opciones: ["Sin picante", "Poco picante", "Picante"]
  },

  acompanamiento: {
    tipo: "texto",
    opciones: ["Arroz", "Tallarin", "Mixto", "Sin acompanamiento"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
