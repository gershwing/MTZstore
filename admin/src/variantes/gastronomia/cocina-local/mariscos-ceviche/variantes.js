/**
 * VARIANTES - Gastronomia > Cocina Local > Mariscos y Ceviche
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Fresco del dia", "Preparado al momento"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Ceviche de pescado", "Ceviche mixto", "Ceviche de camaron",
      "Arroz con mariscos", "Chicharron de pescado", "Pescado frito",
      "Trucha frita", "Trucha a la plancha", "Surubi al horno", "Leche de tigre"
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
    opciones: ["Arroz", "Papa", "Yuca", "Mote", "Sin acompanamiento"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
