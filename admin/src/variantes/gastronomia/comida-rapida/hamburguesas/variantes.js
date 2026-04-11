/**
 * VARIANTES - Gastronomia > Comida Rapida > Hamburguesas
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
      "Hamburguesa simple", "Hamburguesa doble", "Hamburguesa triple",
      "Hamburguesa con huevo", "Hamburguesa con tocino", "Hamburguesa royal",
      "Hamburguesa de pollo broaster", "Hamburguesa pacena con llajua",
      "Combo hamburguesa + papas + gaseosa"
    ]
  },

  coccion: {
    tipo: "texto",
    opciones: ["Bien cocido", "Termino medio"]
  },

  pan: {
    tipo: "texto",
    opciones: ["Pan clasico", "Pan ajonjoli", "Pan brioche"]
  },

  acompanamiento: {
    tipo: "texto",
    opciones: ["Sin papas", "Con papas", "Con papas y gaseosa"]
  },

  salsa: {
    tipo: "texto",
    opciones: ["Ketchup", "Mostaza", "Mayonesa", "Llajua", "Salsa golf", "Mixtas"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
