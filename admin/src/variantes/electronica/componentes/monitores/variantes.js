/**
 * VARIANTES - Electrónica > Componentes > Monitores
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


  tamano: {
    tipo: "texto",
    opciones: ["24 pulgadas", "27 pulgadas", "32 pulgadas", "34 pulgadas Ultrawide", "38 pulgadas Ultrawide", "42 pulgadas OLED", "45 pulgadas Ultrawide", "49 pulgadas Super Ultrawide"]
  },

  resolucion: {
    tipo: "texto",
    opciones: ["Full HD 1080p", "Quad HD 1440p (2K)", "Ultra HD 4K", "8K", "UWQHD 3440×1440", "DQHD 5120×1440"]
  },

  panel: {
    tipo: "texto",
    opciones: ["IPS", "VA", "TN", "OLED", "QD-OLED", "Mini-LED IPS"]
  },

  frecuencia: {
    tipo: "texto",
    opciones: ["60 Hz", "75 Hz", "100 Hz", "120 Hz", "144 Hz", "165 Hz", "180 Hz", "240 Hz", "280 Hz", "360 Hz", "500 Hz"]
  },

  sincronizacion: {
    tipo: "texto",
    opciones: ["Sin VRR", "AMD FreeSync", "NVIDIA G-Sync", "HDMI VRR / G-Sync Compatible"]
  },

  marca: {
    tipo: "texto",
    opciones: ["ASUS ROG/TUF/ProArt", "LG UltraGear/UltraFine", "Samsung Odyssey/ViewFinity", "MSI Optix/MPG", "BenQ ZOWIE/Mobiuz", "Acer Predator/Nitro", "Dell UltraSharp/Alienware", "AOC/Philips"]
  },

  color: {
    tipo: "imagen",
    guia_vendedor: ["Negro", "Plateado", "Blanco", "Negro / Rojo"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
