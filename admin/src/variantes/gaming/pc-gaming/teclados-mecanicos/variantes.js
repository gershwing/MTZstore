/**
 * VARIANTES - Gaming y Tecnología > PC Gaming > Teclados Mecánicos
 * Ruta: admin/src/variantes/gaming/pc-gaming/teclados-mecanicos/variantes.js
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


  layout: {
    tipo: "texto",
    requerido: true,
    opciones: ["Full Size (100%)", "TKL / Tenkeyless (80%)", "75%", "65%", "60%"]
  },

  switch: {
    tipo: "texto",
    opciones: ["Cherry MX Red (lineal)", "Cherry MX Blue (clicky)", "Cherry MX Brown (táctil)", "Gateron Red", "Gateron Yellow", "Gateron Brown", "Outemu Red", "Outemu Blue", "Outemu Brown", "Kailh Box White", "Razer Green", "Razer Yellow", "Hot-swappable (incluye switches intercambiables)"]
  },

  iluminacion: {
    tipo: "texto",
    opciones: ["Sin iluminación", "Blanco", "RGB por tecla", "RGB por zona"]
  },

  conectividad: {
    tipo: "texto",
    opciones: ["USB con cable", "Bluetooth", "2.4 GHz inalámbrico", "Triple modo (Cable + BT + 2.4G)"]
  },

  material_keycaps: {
    tipo: "texto",
    opciones: ["ABS", "PBT", "PBT Double-shot", "Pudding (translúcidas)"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Negro + RGB", "Blanco + RGB", "Rosa", "Azul pastel"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
