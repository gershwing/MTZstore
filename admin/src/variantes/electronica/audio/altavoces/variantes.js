/**
 * VARIANTES - Electrónica > Audio > Altavoces
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
    opciones: ["Portátil Bluetooth", "Escritorio 2.0", "Escritorio 2.1", "Soundbar TV", "Smartspeaker (voz)", "Monitor de estudio", "Columna de piso", "Exterior resistente al agua"]
  },

  potencia: {
    tipo: "texto",
    opciones: ["Hasta 10W", "10-30W", "30-60W", "60-100W", "100-300W", "300W+"]
  },

  marca_modelo: {
    tipo: "texto",
    opciones: ["JBL Charge 5", "JBL Xtreme 4", "Bose SoundLink Flex", "Bose SoundLink Max", "Sony SRS-XB33", "Sony SRS-XG500", "Marshall Emberton III", "Edifier R1280DB", "Edifier R2000DB", "Edifier MR4", "Edifier MR6", "Sonos Era 100", "Sonos Era 300", "Amazon Echo 4a gen", "Amazon Echo Studio", "Bose TV Speaker", "Bose Soundbar 600", "Samsung HW-S", "JBL Bar 1000"]
  },

  color: {
    tipo: "imagen",
    opciones: []
  },

}; // fin variantes

export function getAtributos() { return variantes; }
