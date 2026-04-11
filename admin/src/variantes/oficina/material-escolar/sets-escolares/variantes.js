/**
 * VARIANTES - Oficina > Material Escolar > Sets Escolares
 * Ruta: admin/src/variantes/oficina/material-escolar/sets-escolares/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/diseño es esencial.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Kit escolar completo preescolar / kinder",
      "Kit escolar completo 1°–4° básico",
      "Kit escolar completo 5°–8° básico",
      "Kit escolar completo enseñanza media",
      "Kit universitario (carpetas + lapiceros + cuadernos)",
      "Kit de arte / bellas artes",
      "Kit de dibujo técnico / arquitectura",
      "Kit de manualidades y recorte",
      "Kit de oficina completo",
      "Mochila + útiles (combo todo incluido)"
    ]
  },

  piezas: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "10–15 piezas",
      "15–20 piezas",
      "20–30 piezas",
      "30–40 piezas",
      "40–50 piezas",
      "50+ piezas"
    ]
  },

  nivel: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Preescolar (3–5 años)",
      "Primaria / Básico (6–11 años)",
      "Secundaria / Media (12–17 años)",
      "Universidad / Adulto",
      "Profesional / Artista"
    ]
  },

  color_kit: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del kit completo. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Kit azul marino", "Kit rojo", "Kit verde", "Kit rosa", "Kit negro",
      "Kit colores primarios", "Kit pasteles", "Kit surtido multicolor"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Artesco",
      "Faber-Castell",
      "Staedtler",
      "Maped",
      "BIC",
      "Norma / Ledesma",
      "Crayola",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
