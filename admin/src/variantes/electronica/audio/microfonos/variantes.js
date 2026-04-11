/**
 * VARIANTES - Electrónica > Audio > Micrófonos
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
    opciones: ["USB condensador (streaming/podcast)", "XLR condensador (estudio)", "XLR dinámico", "Inalámbrico de solapa (lavalier)", "Inalámbrico portátil (cámara/entrevista)", "Shotgun de cámara", "Gaming USB"]
  },

  patron_polar: {
    tipo: "texto",
    opciones: ["Cardioide", "Omnidireccional", "Bidireccional", "Multi-patrón"]
  },

  marca_modelo: {
    tipo: "texto",
    opciones: ["Blue Yeti X", "Blue Snowball iCE", "HyperX Quadcast S", "Elgato Wave 3", "Elgato Wave DX", "Rode NT-USB Mini", "Rode Wireless GO II", "DJI Mic 2", "Shure SM7B", "Shure MV7", "Audio-Technica AT2020", "Rode VideoMic NTG", "Sennheiser MKE 400"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Plateado", "Rojo"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
