/**
 * VARIANTES - Automotriz > Accesorios Interiores > Fundas de Asiento
 * Ruta: admin/src/variantes/automotriz/accesorios-interiores/fundas-asiento/variantes.js
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  gama: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Económica",
      "Media",
      "Premium",
      "Lujo"
    ]
  },

  material: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Poliéster",
      "Nylon",
      "Cuero eco PU",
      "Cuero eco premium",
      "Velour",
      "Microfiber",
      "Bamboo + cuero",
      "Jacquard",
      "PVC lujo"
    ]
  },

  piezas: {
    tipo: "texto",
    requerido: true,
    opciones: ["8 set", "9 set", "10 set", "11 set"]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    guia_vendedor: [
      "Negro",
      "Negro / Rojo",
      "Negro / Azul",
      "Negro / Gris",
      "Beige",
      "Gris",
      "Rojo",
      "Marrón",
      "Azul oscuro",
      "Gris claro"
    ]
  },

  estilo: {
    tipo: "texto",
    requerido: false,
    opciones: ["Deportivo", "Elegante", "Clásico", "Racing", "Con botones"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
