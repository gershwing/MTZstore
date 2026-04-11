/**
 * VARIANTES - Automotriz > Accesorios Exteriores > Tapa-aros
 * Ruta: admin/src/variantes/automotriz/accesorios-exteriores/tapa-aros/variantes.js
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  diametro: {
    tipo: "texto",
    requerido: true,
    opciones: ["12\"", "13\"", "14\"", "15\"", "16\""]
  },

  estilo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Gris liso",
      "Gris / Charcoal",
      "Cromado",
      "Cromado / Charcoal",
      "Negro / Azul",
      "Negro / Rojo",
      "Negro / Amarillo",
      "Blanco / Amarillo",
      "Blanco / Rojo",
      "Carbon",
      "Crin cromada",
      "Gris metalizado"
    ]
  },

  pack: {
    tipo: "texto",
    requerido: false,
    opciones: ["Set x4"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
