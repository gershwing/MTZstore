/**
 * VARIANTES - Gaming y Tecnología > Realidad Virtual > Accesorios VR
 * Ruta: admin/src/variantes/gaming/realidad-virtual/accesorios-vr/variantes.js
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
    opciones: ["Correa Elite / Head strap", "Correa con batería integrada", "Funda protectora (visor)", "Funda de silicona facial", "Protector de lentes", "Grips para controles", "Base de carga (visor + controles)", "Cable Link (USB-C a USB-C)", "Cable Link (USB-C a USB-A)", "Batería externa para visor", "Insertos de lentes graduadas", "Alfombrilla / Tapete de área de juego"]
  },

  compatible_con: {
    tipo: "texto",
    requerido: true,
    opciones: ["Meta Quest 3", "Meta Quest 3S", "Meta Quest 2", "Meta Quest Pro", "PlayStation VR2", "Apple Vision Pro", "HTC Vive", "Valve Index", "Pico 4", "Universal"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Gris", "Transparente"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
