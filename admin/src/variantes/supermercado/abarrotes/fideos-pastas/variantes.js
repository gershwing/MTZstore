/**
 * VARIANTES - Supermercado > Abarrotes > Fideos y Pastas
 * Ruta: admin/src/variantes/supermercado/abarrotes/fideos-pastas/variantes.js
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Sellado de fábrica", "Artesanal"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Fideo cabello de ángel",
      "Fideo tallarín",
      "Fideo tornillo",
      "Fideo canuto",
      "Fideo espagueti",
      "Macarrón",
      "Lasaña",
      "Ravioles",
      "Ñoquis",
      "Pasta integral",
      "Sopa instantánea"
    ]
  },

  presentacion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Paquete", "Caja", "Bolsa"]
  },

  peso: {
    tipo: "texto",
    requerido: false,
    opciones: ["200 g", "400 g", "500 g", "1 kg"]
  },

  estilo: {
    tipo: "texto",
    requerido: false,
    opciones: ["Tradicional", "Integral", "Con huevo", "Artesanal"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
