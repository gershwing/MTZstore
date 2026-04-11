/**
 * VARIANTES - Supermercado > Abarrotes > Arroz y Cereales
 * Ruta: admin/src/variantes/supermercado/abarrotes/arroz-cereales/variantes.js
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Sellado de fábrica", "A granel", "Regional"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Arroz popular",
      "Arroz premium",
      "Arroz integral",
      "Arroz precocido",
      "Avena en hojuelas",
      "Avena instantánea",
      "Quinua real",
      "Quinua blanca",
      "Quinua roja",
      "Cañahua",
      "Mote pelado",
      "Maíz pelado",
      "Sémola",
      "Harina de trigo",
      "Harina integral",
      "Harina de maíz",
      "Harina de quinua",
      "Chuño",
      "Tunta",
      "Maicena"
    ]
  },

  presentacion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Bolsa", "Paquete", "Saco", "A granel"]
  },

  peso: {
    tipo: "texto",
    requerido: false,
    opciones: ["250 g", "500 g", "1 kg", "2 kg", "5 kg", "10 kg", "25 kg", "50 kg"]
  },

  origen: {
    tipo: "texto",
    requerido: false,
    opciones: ["Nacional", "Importado", "Altiplano", "Valles", "Oriente"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
