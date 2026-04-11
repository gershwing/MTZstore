/**
 * VARIANTES - Automotriz > Audio y Navegación > Radios y Pantallas
 * Ruta: admin/src/variantes/automotriz/audio-navegacion/radios-pantallas/variantes.js
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
      "Radio 9\" con cámara",
      "Radio 10\" con cámara",
      "Radio 1DIN",
      "Radio 2DIN Android",
      "Radio 2DIN CarPlay"
    ]
  },

  conectividad: {
    tipo: "texto",
    requerido: false,
    opciones: ["Bluetooth + USB", "CarPlay + Android Auto", "Wi-Fi + 4G + GPS"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
