/**
 * VARIANTES - Automotriz > Accesorios Interiores > Cubre Volantes
 * Ruta: admin/src/variantes/automotriz/accesorios-interiores/cubre-volantes/variantes.js
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  material: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Cuero cosido a mano",
      "PU estándar",
      "PU con costura color",
      "Silicona",
      "Con flores / diseño",
      "Kit tuning (volante + cinturón + portacel)",
      "Kit Speed (volante + cinturón + cambio)",
      "Chinchón / acolchado"
    ]
  },

  talla: {
    tipo: "texto",
    requerido: true,
    opciones: ["S (36 cm)", "M (38 cm)", "L (40 cm)", "XL (42 cm)"]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    guia_vendedor: [
      "Negro",
      "Negro / Rojo",
      "Negro / Azul",
      "Negro / Gris",
      "Negro / Beige",
      "Negro / Rosado",
      "Negro / Púrpura",
      "Gris",
      "Rosado"
    ]
  },

  tipo: {
    tipo: "texto",
    requerido: false,
    opciones: ["Individual", "Con forros cinturón", "Kit completo"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
