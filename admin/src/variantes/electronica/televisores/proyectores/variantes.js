/**
 * VARIANTES - Electrónica > Televisores > Proyectores
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
    opciones: ["DLP portátil mini", "DLP Full HD 1080p hogar", "Laser 4K ultra-corta distancia (UST)", "Laser 4K largo alcance", "LED portátil Android TV"]
  },

  lumenes_ansi: {
    tipo: "texto",
    opciones: ["300-500 ANSI lm (portátil)", "500-1500 ANSI lm (hogar básico)", "1500-3000 ANSI lm (hogar premium)", "3000+ ANSI lm (profesional)"]
  },

  resolucion: {
    tipo: "texto",
    opciones: ["1280×720 HD", "1920×1080 Full HD", "3840×2160 4K"]
  },

  marca_modelo: {
    tipo: "texto",
    opciones: ["Xiaomi Mi Smart Projector 2", "Xiaomi Redmi Projector Pro", "BenQ TH685P", "BenQ W2700", "Epson EH-TW7000", "Sony VPL-XW5000", "LG HU810P", "Samsung The Freestyle 2", "XGIMI Horizon Ultra", "Hisense PX3-PRO"]
  },

  color: {
    tipo: "imagen",
    guia_vendedor: ["Blanco", "Negro", "Gris"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
