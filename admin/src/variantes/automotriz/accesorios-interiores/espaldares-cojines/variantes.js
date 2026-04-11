/**
 * VARIANTES - Automotriz > Accesorios Interiores > Espaldares y Cojines
 * Ruta: admin/src/variantes/automotriz/accesorios-interiores/espaldares-cojines/variantes.js
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
      "Respaldar bolitas PVC",
      "Respaldar bamboo tejido",
      "Respaldar bamboo con cabecera",
      "Respaldar bamboo + soporte lumbar",
      "Respaldar malla plástica ventilada",
      "Respaldar tablita bamboo",
      "Soporte lumbar",
      "Cojín cervical",
      "Cojín asiento"
    ]
  },

  material: {
    tipo: "texto",
    requerido: false,
    opciones: ["Bamboo tejido", "Poliéster + bolas PVC", "Malla plástica", "Bamboo laminado"]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    guia_vendedor: [
      "Beige / Café",
      "Negro / Blanco",
      "Café / Beige",
      "Azul / Blanco",
      "Negro"
    ]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
