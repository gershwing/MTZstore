/**
 * VARIANTES - Automotriz > Herramientas de Taller > Compresores
 * Ruta: admin/src/variantes/automotriz/herramientas-taller/compresores/variantes.js
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
      "Inflador portátil 12V",
      "Compresor pistón",
      "Compresor libre aceite",
      "Compresor con tanque"
    ]
  },

  potencia: {
    tipo: "texto",
    requerido: false,
    opciones: ["12V portátil", "0.5–1 HP", "1–2 HP", "2–3 HP", "3 HP+"]
  },

  incluye: {
    tipo: "texto",
    requerido: false,
    opciones: ["Solo compresor", "Con manguera", "Kit accesorios", "Kit completo"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
