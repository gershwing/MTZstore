/**
 * VARIANTES - Automotriz > Accesorios Exteriores > Ganchos de Remolque
 * Ruta: admin/src/variantes/automotriz/accesorios-exteriores/ganchos-remolque/variantes.js
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
      "Gancho con bola cromado",
      "Gancho con bola negro",
      "Gancho 3 bolas",
      "Gancho ajustable",
      "Gancho muela 8000LB",
      "Bola de remolque",
      "Adaptador gancho",
      "Gancho de amarre pickup",
      "Soporte carro arrastre",
      "Winch manual",
      "Seguro remolque con llave",
      "Cadena de seguridad",
      "Cable de seguridad"
    ]
  },

  capacidad: {
    tipo: "texto",
    requerido: false,
    opciones: ["2000 LB", "3500 LB", "5000 LB", "6000 LB", "8000 LB", "10000 LB"]
  },

  medida_bola: {
    tipo: "texto",
    requerido: false,
    opciones: ["1-7/8\"", "2\"", "2-5/16\""]
  },

  incluye: {
    tipo: "texto",
    requerido: false,
    opciones: ["Solo gancho", "Con seguro", "Con llave", "Con cadena"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
