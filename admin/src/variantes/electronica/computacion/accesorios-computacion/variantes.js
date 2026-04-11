/**
 * VARIANTES - Electrónica > Computación > Accesorios de Computación
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


  tipo_accesorio: {
    tipo: "texto",
    opciones: ["Teclado", "Mouse", "Hub USB-C / Docking", "Alfombrilla", "Mochila para laptop", "Funda para laptop", "Monitor portátil", "Webcam", "Soporte para laptop", "Cable HDMI / USB-C", "Batería externa USB-C"]
  },

  compatibilidad: {
    tipo: "texto",
    opciones: ["Universal", "MacBook 13"", "MacBook 14/16"", "Windows 15.6"", "Windows 14"", "iPad Pro 11"", "iPad Pro 13""]
  },

  color: {
    tipo: "imagen",
    opciones: []
  },

  conectividad: {
    tipo: "texto",
    opciones: ["USB-C", "USB-A", "Bluetooth", "Inalámbrico 2.4GHz", "USB-C + Bluetooth", "Thunderbolt 4"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
