/**
 * VARIANTES - Gaming y Tecnología > Consolas > Nintendo
 * Ruta: admin/src/variantes/gaming/consolas/nintendo/variantes.js
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

    "Nintendo Switch OLED": {
      color: { tipo: "imagen", opciones: ["Blanco", "Neón Rojo/Azul", "Edición Splatoon 3", "Edición Zelda", "Edición Pokémon"] },
      bundle: { tipo: "texto", opciones: ["Solo consola", "Con juego incluido (ver descripción)", "Con funda + protector de pantalla", "Pack Edición Especial"] },
    },

    "Nintendo Switch V2": {
      color: { tipo: "imagen", opciones: ["Neón Rojo/Azul", "Gris", "Edición Animal Crossing"] },
      bundle: { tipo: "texto", opciones: ["Solo consola", "Con juego incluido (ver descripción)", "Con funda + protector de pantalla"] },
    },

    "Nintendo Switch Lite": {
      color: { tipo: "imagen", opciones: ["Gris", "Turquesa", "Amarillo", "Coral", "Azul", "Edición Dialga/Palkia", "Edición Hyrule"] },
      bundle: { tipo: "texto", opciones: ["Solo consola", "Con juego incluido (ver descripción)", "Con funda + protector de pantalla"] },
    },

    "Nintendo Switch 2": {
      color: { tipo: "imagen", opciones: ["Negro / Azul-Rojo Joy-Con", "Negro / Gris Joy-Con"] },
      bundle: { tipo: "texto", opciones: ["Solo consola", "Con juego incluido (ver descripción)", "Con funda + protector de pantalla", "Pack Edición Especial"] },
    },

  }

}; // fin variantes

export function getAtributos() { return variantes; }
export function getVariantesModelo(nombre) { return variantes.modelos[nombre] ?? null; }
export function getListaModelos() { return Object.keys(variantes.modelos); }
