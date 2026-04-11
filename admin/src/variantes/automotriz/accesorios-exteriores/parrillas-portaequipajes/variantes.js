/**
 * VARIANTES - Automotriz > Accesorios Exteriores > Parrillas y Portaequipajes
 * Ruta: admin/src/variantes/automotriz/accesorios-exteriores/parrillas-portaequipajes/variantes.js
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
      "Parrilla aluminio silver",
      "Parrilla aluminio negro",
      "Parrilla fierro negro",
      "Barra de techo con bota agua",
      "Barra de techo sin bota agua",
      "Barra sobre barra",
      "Barra con llave",
      "Parrilla universal",
      "Portabicicletas",
      "Porta neblinero aluminio"
    ]
  },

  medida: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "95x100 cm",
      "127x96 cm",
      "140x100 cm",
      "160x110 cm",
      "172x106 cm",
      "120 cm (barra)",
      "127 cm (barra)",
      "135 cm (barra)"
    ]
  },

  material: {
    tipo: "texto",
    requerido: false,
    opciones: ["Aluminio", "Fierro pintado", "Acero galvanizado"]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    guia_vendedor: [
      "Silver / Plateado",
      "Negro mate",
      "Silver/Negro bicolor"
    ]
  },

  gancho: {
    tipo: "texto",
    requerido: false,
    opciones: ["Gancho M01", "Gancho L01", "Universal abrazadera"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
