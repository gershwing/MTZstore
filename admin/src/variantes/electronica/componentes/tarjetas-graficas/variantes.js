/**
 * VARIANTES - Electrónica > Componentes > Tarjetas Gráficas
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


  marca_gpu: {
    tipo: "texto",
    opciones: ["NVIDIA GeForce", "AMD Radeon"]
  },

  modelo_nvidia: {
    tipo: "texto",
    opciones: ["RTX 3060 12GB", "RTX 3060 Ti", "RTX 3070", "RTX 3070 Ti", "RTX 3080", "RTX 3080 Ti", "RTX 3090", "RTX 3090 Ti", "RTX 4060", "RTX 4060 Ti", "RTX 4070", "RTX 4070 Super", "RTX 4070 Ti", "RTX 4070 Ti Super", "RTX 4080", "RTX 4080 Super", "RTX 4090", "RTX 5070", "RTX 5070 Ti", "RTX 5080", "RTX 5090"]
  },

  modelo_amd: {
    tipo: "texto",
    opciones: ["RX 6600", "RX 6600 XT", "RX 6700 XT", "RX 6800", "RX 6800 XT", "RX 6900 XT", "RX 7600", "RX 7700 XT", "RX 7800 XT", "RX 7900 GRE", "RX 7900 XT", "RX 7900 XTX", "RX 9070", "RX 9070 XT"]
  },

  fabricante_board: {
    tipo: "texto",
    opciones: ["ASUS ROG/TUF/Prime", "Gigabyte AORUS/Gaming/Eagle", "MSI Gaming/Suprim/Ventus", "Sapphire (AMD)", "PowerColor (AMD)", "Zotac (NVIDIA)", "Palit (NVIDIA)"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Negro+RGB", "Blanco+RGB"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
