/**
 * VARIANTES - Automotriz > Audio y Navegación > Cámaras y Sensores
 * Ruta: admin/src/variantes/automotriz/audio-navegacion/camaras-sensores/variantes.js
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Cámara reversa",
      "Dashcam frontal",
      "Dashcam dual",
      "Cámara 360°",
      "Sensor estacionamiento",
      "Cámara visión nocturna"
    ]
  },

  resolucion: {
    tipo: "texto",
    requerido: false,
    opciones: ["720p", "1080p", "2K", "4K"]
  },

  instalacion: {
    tipo: "texto",
    requerido: false,
    opciones: ["Plug & Play", "Cableado universal", "Inalámbrica Wi-Fi", "Con monitor incluido"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
