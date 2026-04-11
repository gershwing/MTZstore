/**
 * VARIANTES - Electrónica > Componentes > Tarjetas Madre
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


  plataforma: {
    tipo: "texto",
    opciones: ["Intel LGA1700 (DDR4)", "Intel LGA1700 (DDR5)", "Intel LGA1851 (DDR5)", "AMD AM4 (DDR4)", "AMD AM5 (DDR5)"]
  },

  chipset_intel: {
    tipo: "texto",
    opciones: ["H610", "B660", "Z690", "H770", "B760", "Z790", "B860", "Z890"]
  },

  chipset_amd: {
    tipo: "texto",
    opciones: ["A520", "B550", "X570", "A620", "B650", "B650E", "X670", "X670E", "B850", "X870", "X870E"]
  },

  formato: {
    tipo: "texto",
    opciones: ["ATX", "mATX", "ITX", "E-ATX"]
  },

  marca: {
    tipo: "texto",
    opciones: ["ASUS ROG/TUF/Prime", "Gigabyte AORUS/Gaming/UD", "MSI MAG/MPG/MEG", "ASRock", "Biostar"]
  },

  color_pcb: {
    tipo: "imagen",
    guia_vendedor: ["Negro", "Verde", "Negro / Rojo"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
