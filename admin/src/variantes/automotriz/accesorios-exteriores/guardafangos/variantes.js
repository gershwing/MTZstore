/**
 * VARIANTES - Automotriz > Accesorios Exteriores > Guardafangos
 * Ruta: admin/src/variantes/automotriz/accesorios-exteriores/guardafangos/variantes.js
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
      "Guardafango universal 2x set",
      "Guardafango universal 4x set",
      "Guardafango camioneta",
      "Guardafango por modelo (Hilux Revo)",
      "Correa antiestática"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    guia_vendedor: [
      "Negro",
      "Azul",
      "Rojo"
    ]
  },

  tamano: {
    tipo: "texto",
    requerido: false,
    opciones: ["32x22 cm (auto)", "37.5x24 cm (camioneta)", "43x23 cm (largo)"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
