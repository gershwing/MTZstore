/**
 * VARIANTES - Gaming y Tecnología > Consolas > PlayStation
 * Ruta: admin/src/variantes/gaming/consolas/playstation/variantes.js
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

  modelos: {

    "PS5 Slim Digital": {
      color: { tipo: "imagen", opciones: ["Blanco", "Negro Midnight", "Rojo Volcanic", "Azul Starlight", "Gris Sterling Silver"] },
      bundle: { tipo: "texto", opciones: ["Solo consola", "Con 1 control extra", "Con juego incluido (ver descripción)", "Pack Edición Especial"] },
    },

    "PS5 Slim Disco": {
      color: { tipo: "imagen", opciones: ["Blanco", "Negro Midnight", "Rojo Volcanic", "Azul Starlight", "Gris Sterling Silver"] },
      bundle: { tipo: "texto", opciones: ["Solo consola", "Con 1 control extra", "Con juego incluido (ver descripción)", "Pack Edición Especial"] },
    },

    "PS5 Pro": {
      color: { tipo: "imagen", opciones: ["Blanco", "Negro"] },
      bundle: { tipo: "texto", opciones: ["Solo consola", "Con 1 control extra", "Con juego incluido (ver descripción)", "Pack Edición Especial"] },
    },

    "PS4 Slim": {
      color: { tipo: "imagen", opciones: ["Negro", "Blanco Glaciar", "Dorado"] },
      almacenamiento: { tipo: "texto", opciones: ["500 GB", "1 TB"] },
      bundle: { tipo: "texto", opciones: ["Solo consola", "Con 1 control extra", "Con juego incluido (ver descripción)"] },
    },

    "PS4 Pro": {
      color: { tipo: "imagen", opciones: ["Negro", "Blanco Glaciar"] },
      almacenamiento: { tipo: "texto", opciones: ["1 TB", "2 TB"] },
      bundle: { tipo: "texto", opciones: ["Solo consola", "Con 1 control extra", "Con juego incluido (ver descripción)"] },
    },

  }

}; // fin variantes

export function getAtributos() { return variantes; }
export function getVariantesModelo(nombre) { return variantes.modelos[nombre] ?? null; }
export function getListaModelos() { return Object.keys(variantes.modelos); }
