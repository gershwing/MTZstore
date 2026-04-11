/**
 * VARIANTES - Electrónica > Televisores > Soportes y Bases
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
    opciones: ["Soporte pared fijo", "Soporte pared inclinable", "Soporte pared articulado giratorio", "Base / pedestal de mesa ajustable", "Soporte techo", "Carrito móvil con ruedas"]
  },

  vesa_compatible: {
    tipo: "texto",
    opciones: ["VESA 75×75", "VESA 100×100", "VESA 200×200", "VESA 400×400", "VESA 600×400", "Universal múltiple"]
  },

  tamano_tv_compatible: {
    tipo: "texto",
    opciones: ["14 a 32 pulgadas", "32 a 55 pulgadas", "40 a 65 pulgadas", "50 a 75 pulgadas", "55 a 85 pulgadas", "65 a 100 pulgadas"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Plateado", "Blanco"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
