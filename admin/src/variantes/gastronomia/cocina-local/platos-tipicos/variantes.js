/**
 * VARIANTES - Gastronomia > Cocina Local > Platos Tipicos
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Disponible hoy", "Preparado al momento"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Pique macho", "Silpancho", "Charque kan", "Majadito", "Falso conejo",
      "Sajta de pollo", "Saice", "Mondongo chuquisaqueno", "Chicharron cochabambino",
      "Picante de pollo", "Sopa de mani", "Fricase", "Aji de fideo",
      "Pampaku", "Puchero", "Plato paceno"
    ]
  },

  porcion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Individual", "Medio", "Doble", "Familiar"]
  },

  picante: {
    tipo: "texto",
    opciones: ["Sin picante", "Poco picante", "Normal", "Extra picante"]
  },

  acompanamiento: {
    tipo: "texto",
    opciones: ["Arroz", "Papa", "Chuno", "Mote", "Ensalada", "Mixto"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
