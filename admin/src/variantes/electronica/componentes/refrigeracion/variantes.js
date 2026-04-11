/**
 * VARIANTES - Electrónica > Componentes > Refrigeración
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


  tipo: {
    tipo: "texto",
    opciones: ["Disipador aire Torre simple", "Disipador aire Torre dual", "AIO 120mm", "AIO 240mm", "AIO 280mm", "AIO 360mm", "AIO 420mm", "Pasta térmica", "Ventilador case 120mm", "Ventilador case 140mm", "Ventilador case 200mm"]
  },

  socket_compatible: {
    tipo: "texto",
    opciones: ["LGA1700 + AM5 (universal moderno)", "Solo Intel LGA1200/1700", "Solo AMD AM4/AM5", "Universal con kits incluidos"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Noctua", "be quiet!", "Corsair iCUE", "NZXT Kraken", "Cooler Master", "DeepCool", "Arctic", "Thermalright", "EK"]
  },

  rgb: {
    tipo: "texto",
    opciones: ["Sin iluminación", "Con ARGB sincronizable", "Con RGB fijo"]
  },

  color: {
    tipo: "imagen",
    guia_vendedor: ["Negro", "Blanco", "Negro / RGB", "Plateado"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
