/**
 * VARIANTES - Supermercado > Abarrotes > Aceites y Condimentos
 * Ruta: admin/src/variantes/supermercado/abarrotes/aceites-condimentos/variantes.js
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Sellado de fábrica", "Fraccionado", "Artesanal"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Aceite vegetal",
      "Aceite de girasol",
      "Aceite de oliva",
      "Manteca vegetal",
      "Sal yodada",
      "Sal parrillera",
      "Azúcar blanca",
      "Azúcar morena",
      "Pimienta molida",
      "Orégano seco",
      "Comino molido",
      "Ajo molido",
      "Colorante / palillo",
      "Ají rojo molido",
      "Ají amarillo molido",
      "Locoto molido",
      "Llajua envasada",
      "Vinagre",
      "Sillao / salsa de soya",
      "Mostaza",
      "Mayonesa",
      "Kétchup"
    ]
  },

  presentacion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Sobre", "Frasco", "Botella", "Bolsa", "Paquete"]
  },

  peso_volumen: {
    tipo: "texto",
    requerido: false,
    opciones: ["100 g", "250 g", "500 g", "1 kg", "250 ml", "500 ml", "1 L", "2 L", "5 L"]
  },

  origen: {
    tipo: "texto",
    requerido: false,
    opciones: ["Nacional", "Importado", "Artesanal / regional"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
