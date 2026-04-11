/**
 * VARIANTES - Gaming y Tecnología > Realidad Virtual > Visores VR
 * Ruta: admin/src/variantes/gaming/realidad-virtual/visores-vr/variantes.js
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


  modelo: {
    tipo: "texto",
    requerido: true,
    opciones: ["Meta Quest 3", "Meta Quest 3S", "Meta Quest 2", "Meta Quest Pro", "PlayStation VR2", "Apple Vision Pro", "HTC Vive XR Elite", "HTC Vive Pro 2", "Valve Index", "Pico 4"]
  },

  almacenamiento: {
    tipo: "texto",
    opciones: ["64 GB", "128 GB", "256 GB", "512 GB"]
  },

  bundle: {
    tipo: "texto",
    opciones: ["Solo visor", "Con juego incluido (ver descripción)", "Con correa Elite / premium", "Con base de carga", "Pack completo (correa + funda + batería extra)"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Blanco", "Negro", "Gris"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
