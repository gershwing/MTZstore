/**
 * VARIANTES - Electrónica > Televisores > Smart TV
 *
 * tipo: "imagen" → selector con foto del producto (estilo AliExpress)
 * tipo: "texto"  → selector de chips / botones de texto
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo", "Usado", "Reacondicionado", "Caja Abierta"]
  },


  tamano: {
    tipo: "texto",
    opciones: ["43"", "50"", "55"", "58"", "65"", "70"", "75"", "82"", "85"", "98""]
  },

  resolucion: {
    tipo: "texto",
    opciones: ["Full HD 1080p", "4K UHD", "8K UHD"]
  },

  sistema_operativo: {
    tipo: "texto",
    opciones: ["Tizen (Samsung)", "webOS (LG)", "Google TV", "Android TV", "Fire TV", "Roku TV", "Vidaa (Hisense)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Samsung", "LG", "Sony", "Hisense", "TCL", "Xiaomi", "Philips", "Panasonic"]
  },

  frecuencia: {
    tipo: "texto",
    opciones: ["60 Hz", "100 Hz / 120 Hz", "144 Hz"]
  },

  hdr: {
    tipo: "texto",
    opciones: ["Sin HDR", "HDR10", "HDR10+", "Dolby Vision", "Dolby Vision IQ + HDR10+"]
  },

  color_marco: {
    tipo: "imagen",
    guia_vendedor: ["Negro", "Plateado", "Blanco"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
