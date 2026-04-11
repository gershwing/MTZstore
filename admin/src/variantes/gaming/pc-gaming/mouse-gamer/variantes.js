/**
 * VARIANTES - Gaming y Tecnología > PC Gaming > Mouse Gamer
 * Ruta: admin/src/variantes/gaming/pc-gaming/mouse-gamer/variantes.js
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


  tipo: {
    tipo: "texto",
    opciones: ["Ergonómico diestro", "Ergonómico zurdo", "Ambidiestro / Simétrico", "Ultraligero (< 60g)", "MMO (muchos botones)", "FPS (sensor premium)"]
  },

  sensor: {
    tipo: "texto",
    opciones: ["Hasta 8,000 DPI", "8,000–16,000 DPI", "16,000–25,000 DPI", "25,000–30,000 DPI", "30,000 DPI+"]
  },

  conectividad: {
    tipo: "texto",
    opciones: ["USB con cable", "2.4 GHz inalámbrico + cable", "Bluetooth + cable", "Triple modo (Cable + BT + 2.4G)"]
  },

  peso: {
    tipo: "texto",
    opciones: ["< 60 g (ultraligero)", "60–80 g", "80–100 g", "100–120 g", "120 g+"]
  },

  iluminacion: {
    tipo: "texto",
    opciones: ["Sin iluminación", "RGB", "RGB por zona"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Rosa", "Rojo", "Azul", "Transparente / Skeleton"]
  },

  botones_extra: {
    tipo: "texto",
    opciones: ["2 botones laterales", "4+ botones laterales", "6+ botones laterales (MMO)", "Botón de perfil DPI"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
