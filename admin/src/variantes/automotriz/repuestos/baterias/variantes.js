/**
 * VARIANTES - Automotriz > Repuestos > Baterías
 * Ruta: admin/src/variantes/automotriz/repuestos/baterias/variantes.js
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo", "Usado", "Reacondicionado"]
  },

  capacidad_ah: {
    tipo: "texto",
    requerido: true,
    opciones: ["45 Ah", "55 Ah", "60 Ah", "70 Ah", "75 Ah", "80 Ah", "90 Ah", "100 Ah", "120 Ah"]
  },

  tecnologia: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Plomo-ácido convencional",
      "AGM (Absorbed Glass Mat)",
      "EFB (Enhanced Flooded)",
      "Gel",
      "Calcio sellada"
    ]
  },

  voltaje: {
    tipo: "texto",
    requerido: false,
    opciones: ["12V", "24V"]
  },

  garantia: {
    tipo: "texto",
    requerido: false,
    opciones: ["6 meses", "1 año", "2 años", "3 años"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
