/**
 * VARIANTES - Automotriz > Herramientas de Taller > Gatos Hidráulicos
 * Ruta: admin/src/variantes/automotriz/herramientas-taller/gatos-hidraulicos/variantes.js
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Gata tijera roja",
      "Gata tijera negra",
      "Gata botella",
      "Gata botella con maleta",
      "Gata caimán",
      "Gata caimán perfil bajo",
      "Soporte / caballete",
      "Farm Jack",
      "Prensa hidráulica",
      "Elevador de vehículo"
    ]
  },

  capacidad: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "800 kg",
      "1 T",
      "1.5 T",
      "2 T",
      "3 T",
      "4 T",
      "5 T",
      "6 T",
      "8 T",
      "10 T",
      "12 T",
      "20 T",
      "30 T",
      "50 T"
    ]
  },

  incluye: {
    tipo: "texto",
    requerido: false,
    opciones: ["Solo gata", "Con maleta", "Con soporte"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
