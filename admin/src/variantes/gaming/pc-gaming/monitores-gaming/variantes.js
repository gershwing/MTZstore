/**
 * VARIANTES - Gaming y Tecnología > PC Gaming > Monitores Gaming
 * Ruta: admin/src/variantes/gaming/pc-gaming/monitores-gaming/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/estilo es esencial para decidir.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
 *
 * Nota gaming: las ediciones especiales y bundles se manejan como variante,
 *              NO como producto separado.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo", "Usado", "Reacondicionado", "Caja Abierta"]
  },


  tamano_pantalla: {
    tipo: "texto",
    requerido: true,
    opciones: ["24"", "27"", "32"", "34" Ultrawide", "38" Ultrawide", "49" Super Ultrawide"]
  },

  resolucion: {
    tipo: "texto",
    opciones: ["1080p Full HD", "1440p QHD (2K)", "2160p UHD (4K)", "3440×1440 UWQHD", "5120×1440 DQHD"]
  },

  tasa_refresco: {
    tipo: "texto",
    opciones: ["60 Hz", "75 Hz", "144 Hz", "165 Hz", "180 Hz", "240 Hz", "360 Hz"]
  },

  tipo_panel: {
    tipo: "texto",
    opciones: ["IPS", "VA", "TN", "OLED", "Mini-LED", "QD-OLED"]
  },

  curvatura: {
    tipo: "texto",
    opciones: ["Plano (Flat)", "1000R", "1500R", "1800R"]
  },

  sync: {
    tipo: "texto",
    opciones: ["Sin sync adaptativo", "AMD FreeSync", "AMD FreeSync Premium", "NVIDIA G-Sync Compatible", "NVIDIA G-Sync", "NVIDIA G-Sync Ultimate"]
  },

  color_carcasa: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Negro + RGB", "Plateado / Gris"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
