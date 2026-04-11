/**
 * VARIANTES - Electrónica > Cámaras > Accesorios de Cámara
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
    opciones: ["Objetivo / Lente", "Trípode", "Monopié", "Gimbal / Estabilizador", "Flash externo", "Batería repuesto", "Tarjeta SD / CFexpress", "Bolso / Mochila cámara", "Filtro ND / CPL / UV", "Micrófono para cámara", "Control remoto", "Grip de batería"]
  },

  compatibilidad: {
    tipo: "texto",
    opciones: ["Universal", "Sony (montura E)", "Canon (montura RF)", "Nikon (montura Z)", "Fujifilm (montura X)", "GoPro Hero 12/13", "DJI Osmo Action"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Plata", "Verde (camuflaje)"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
