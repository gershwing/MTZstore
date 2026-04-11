/**
 * VARIANTES - Electrónica > Cámaras > Cámaras de Acción
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


  marca_modelo: {
    tipo: "texto",
    opciones: ["GoPro Hero 13 Black", "GoPro Hero 12 Black", "GoPro Max 2 (360°)", "DJI Osmo Action 5 Pro", "DJI Osmo Action 4", "Insta360 X4 (360°)", "Insta360 Ace Pro 2", "Insta360 GO 3S (miniatura)", "Akaso Brave 8"]
  },

  bundle: {
    tipo: "texto",
    opciones: ["Solo cámara", "Kit básico (+ soporte + batería extra)", "Kit aventura (+ flotador + funda + soportes)", "Kit creator (+ estabilizador)"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
