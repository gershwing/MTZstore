/**
 * VARIANTES - Arte y Manualidades > Pintura > Pinturas Acrílicas
 * Ruta: admin/src/variantes/arte-manualidades/pintura/pinturas-acrilicas/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  AMPLIO uso en esta categoría: colores de pintura, tonos
 *                  de tela, texturas de papel, colores de hilo — la foto
 *                  del color real es decisiva para el artista.
 * tipo: "texto"  → selector de chips para especificaciones técnicas:
 *                  gramaje, tamaño, volumen, número de pinceles, dureza.
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
    opciones: ["Acrílico estudio / básico", "Acrílico artista (alta pigmentación)", "Acrílico fluido (pour painting)",
               "Acrílico heavy body (textura espesa)", "Acrílico soft body (fluido suave)", "Acrílico modelado / pasta",
               "Acrílico spray / aerosol artístico", "Acrílico para tela (textile medium incluido)",
               "Acrílico metálico / nacarado", "Acrílico neón / fluorescente", "Acrílico efecto espejo",
               "Acrílico 3D relieve", "Set acrílicos (varios tubos / potes)"]
  },

  color: {
    tipo: "imagen",
    nota: "El vendedor sube foto de la muestra de color real sobre papel. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Blanco titanio", "Blanco zinc", "Negro marfil", "Negro carbón",
      "Amarillo cadmio claro", "Amarillo cadmio medio", "Amarillo ocre", "Amarillo limón",
      "Naranja cadmio", "Naranja quemado / siena tostada",
      "Rojo cadmio claro", "Rojo cadmio oscuro", "Carmín / Alizarin crimson",
      "Rojo bermellón", "Magenta",
      "Azul ultramar", "Azul cobalto", "Azul cerúleo", "Azul ftalo (phthalo)",
      "Azul prusia / Azul Parisino",
      "Verde ftalo (phthalo)", "Verde veronés", "Verde esmeralda",
      "Verde oliva", "Verde permanente claro", "Verde cadmio",
      "Violeta / Dioxazine purple", "Violeta manganeso",
      "Siena natural (raw sienna)", "Siena tostada (burnt sienna)",
      "Tierra sombra natural", "Tierra sombra tostada",
      "Dorado (oro metálico)", "Plateado (plata metálica)", "Cobre metálico",
      "Blanco nácar / perla", "Neón rosa", "Neón verde", "Neón naranja"
    ]
  },

  volumen: {
    tipo: "texto",
    opciones: ["20 ml (tubo)", "60 ml (tubo)", "100 ml (tubo)", "120 ml (pote)", "250 ml (pote)", "500 ml (pote)", "1 L (pote)"]
  },

  serie: {
    tipo: "texto",
    opciones: ["Serie 1 (básica)", "Serie 2 (intermedia)", "Serie 3 (artista)", "Serie 4 (premium)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Liquitex Basics / Professional Heavy Body / Soft Body", "Golden Heavy Body / Fluid / Open",
               "Winsor & Newton Galeria / Artists'", "Amsterdam (Royal Talens) Estudio / Expert",
               "Vallejo Studio / Model Color", "Daler-Rowney System3 / Georgian",
               "Montana Cans (acrílico spray)", "Mont Marte (estudio LATAM)", "Artesco (escolar LATAM)", "Acrilex (Brasil/LATAM)", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
