/**
 * VARIANTES - Electrónica > Televisores > Televisores OLED
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

  marca: {
    tipo: "texto",
    opciones: ["Samsung", "LG", "Sony", "Hisense", "TCL", "Xiaomi", "Philips", "Panasonic"]
  },

  smart_tv: {
    tipo: "texto",
    opciones: ["Sin Smart TV", "Tizen (Samsung)", "webOS (LG)", "Google TV", "Android TV", "Fire TV"]
  },

  frecuencia: {
    tipo: "texto",
    opciones: ["60 Hz", "100 Hz / 120 Hz", "144 Hz"]
  },

  hdr: {
    tipo: "texto",
    opciones: ["Sin HDR", "HDR10", "HDR10+", "Dolby Vision", "Dolby Vision IQ + HDR10+"]
  },

  tecnologia_oled: {
    tipo: "texto",
    opciones: ["OLED Evo", "OLED α", "OLED Meta", "OLED S90D/S95D", "OLED Bravia XR"]
  },

  color_marco: {
    tipo: "imagen",
    guia_vendedor: ["Negro", "Plateado", "Titanio"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
