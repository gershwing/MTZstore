/**
 * VARIANTES - Automotriz > Accesorios Exteriores > Tapasoles
 * Ruta: admin/src/variantes/automotriz/accesorios-exteriores/tapasoles/variantes.js
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
      "Tapasol frontal silver",
      "Tapasol frontal con diseño",
      "Tapasol trasero negro",
      "Tapasol lateral cortina",
      "Tapasol malla para puerta",
      "Visera día / noche",
      "Polarizado roll-on",
      "Tapasol doble"
    ]
  },

  medida: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "44x36 cm",
      "65x38 cm",
      "100x50 cm",
      "130x60 cm",
      "145x68 cm",
      "145x70 cm"
    ]
  },

  pack: {
    tipo: "texto",
    requerido: false,
    opciones: ["Unidad", "Set x2"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
