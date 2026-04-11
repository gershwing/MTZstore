/**
 * VARIANTES - Gastronomia > Comida Rapida > Hot Dogs
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
      "Hot dog simple", "Hot dog doble salchicha", "Hot dog con queso",
      "Hot dog con tocino", "Hot dog con papas al hilo", "Hot dog especial",
      "Hot dog estilo calle boliviana", "Combo hot dog + papas + gaseosa"
    ]
  },

  tamano: {
    tipo: "texto",
    requerido: true,
    opciones: ["Normal", "Grande", "Extra grande"]
  },

  extras: {
    tipo: "texto",
    opciones: ["Queso extra", "Tocino", "Huevo", "Papas al hilo", "Pepinillo", "Sin extras"]
  },

  salsa: {
    tipo: "texto",
    opciones: ["Ketchup", "Mostaza", "Mayonesa", "Llajua", "Rosada", "Mixtas"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
