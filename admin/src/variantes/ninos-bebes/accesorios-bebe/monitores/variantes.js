/**
 * VARIANTES - Niños y Bebés > Accesorios Bebé > Monitores
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  tipo: {
    tipo: "texto",
    opciones: ["Monitor solo audio", "Monitor con video", "Cámara Wi-Fi / Baby Cam", "Monitor con sensor de movimiento", "Monitor portátil con pantalla"]
  },

  conectividad: {
    tipo: "texto",
    opciones: ["Wi-Fi", "DECT (sin Wi-Fi)", "Bluetooth"]
  },

  vision_nocturna: {
    tipo: "texto",
    opciones: ["Con visión nocturna", "Sin visión nocturna"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Blanco", "Blanco + Gris", "Negro"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Philips Avent", "VTech", "Motorola", "Xiaomi", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
