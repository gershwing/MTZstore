/**
 * VARIANTES - Oficina > Material Escolar > Cuadernos
 * Ruta: admin/src/variantes/oficina/material-escolar/cuadernos/variantes.js
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

  formato: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "A4 (21×29.7 cm)",
      "A5 (14.8×21 cm)",
      "A6 (pequeño / bolsillo)",
      "Oficio (21.6×33 cm)",
      "Cuarto (21.6×27.9 cm)",
      "Cuaderno universitario (28×21.5 cm)",
      "Mini / Pocket (10×15 cm)",
      "Cuaderno de viaje Leuchtturm / Moleskine"
    ]
  },

  tipo_hoja: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Cuadriculado 5×5 mm",
      "Cuadriculado 7×7 mm",
      "Rayado 7 mm",
      "Rayado 8 mm",
      "Punteado / Dot grid 5 mm",
      "Blanco / Liso",
      "Música (pentagramas)",
      "Doble raya (Seyés / escolar)"
    ]
  },

  hojas: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "40 hojas", "48 hojas", "60 hojas", "80 hojas",
      "96 hojas", "100 hojas", "120 hojas", "200 hojas"
    ]
  },

  tipo_encuadernacion: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Espiral metálico",
      "Espiral plástico",
      "Cosido / Tapa dura",
      "Pegado / Encolado",
      "Perforado + argollas",
      "Tapa flexible (rústica)"
    ]
  },

  color_tapa: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto de la tapa real del cuaderno. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro liso", "Azul marino", "Rojo", "Verde", "Morado",
      "Estampado geométrico", "Estampado floral", "Estampado galaxia / espacio",
      "Estampado camuflaje", "Kraft / Marrón natural", "Blanco + color",
      "Pasteles (varios)", "Con foto personalizable", "Transparente + color"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Norma (LATAM)",
      "Scribe (México)",
      "Ledesma / Rivadavia (Argentina)",
      "Artesco (Perú)",
      "Torre / Punto Azul (Bolivia / Chile)",
      "Mead / Five Star",
      "Rhodia",
      "Leuchtturm1917",
      "Moleskine",
      "Oxford",
      "Clairefontaine",
      "Genérico"
    ]
  },

  pack: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Unidad individual",
      "Pack 3 cuadernos",
      "Pack 5 cuadernos",
      "Pack 10 cuadernos",
      "Caja de 20+"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
