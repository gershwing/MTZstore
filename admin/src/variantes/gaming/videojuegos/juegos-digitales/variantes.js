/**
 * VARIANTES - Gaming y Tecnología > Videojuegos > Juegos Digitales
 * Ruta: admin/src/variantes/gaming/videojuegos/juegos-digitales/variantes.js
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
    opciones: ["Código nuevo sin usar"]
  },


  plataforma: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: ["Steam", "PlayStation", "Xbox", "Nintendo", "Epic Games"]
  },

  region: {
    tipo: "texto",
    opciones: ["Global (sin restricción)", "América Latina", "USA / Norteamérica", "Europa", "Argentina", "Turquía"]
  },

  tipo_codigo: {
    tipo: "texto",
    opciones: ["Código de juego completo", "DLC / Expansión", "Season Pass", "Código moneda virtual (V-Bucks, Robux, etc.)", "Gift Card / Tarjeta de regalo"]
  },

  edicion: {
    tipo: "texto",
    opciones: ["Edición estándar", "Edición Deluxe", "Edición Ultimate / Gold"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
