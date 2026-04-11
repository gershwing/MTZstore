/**
 * VARIANTES - Electrónica > Televisores > Barras de Sonido
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


  canales: {
    tipo: "texto",
    opciones: ["2.0", "2.1", "3.1", "5.1", "7.1", "5.1.2 (Dolby Atmos básico)", "9.1.4 (Dolby Atmos premium)"]
  },

  potencia: {
    tipo: "texto",
    opciones: ["Hasta 80W", "80-200W", "200-400W", "400-600W", "600W+"]
  },

  marca_modelo: {
    tipo: "texto",
    opciones: ["Samsung HW-S50B", "Samsung HW-Q600C", "Samsung HW-Q930C", "Sony HT-A3000", "Sony HT-A7000", "LG S65Q", "LG SG10TY", "Bose Smart Soundbar 600", "Bose Smart Soundbar 900", "Sonos Arc Ultra", "JBL Bar 1300X", "Denon DHT-S517"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Plata"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
