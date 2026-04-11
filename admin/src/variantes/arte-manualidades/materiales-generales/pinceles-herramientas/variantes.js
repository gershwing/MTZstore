/**
 * VARIANTES - Arte y Manualidades > Materiales Generales > Pinceles y Herramientas
 * Ruta: admin/src/variantes/arte-manualidades/materiales-generales/pinceles-herramientas/variantes.js
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
    opciones: ["Pincel plano (pelo suave / sintético)", "Pincel redondo", "Pincel filbert (avellana)",
               "Pincel abanico (fan)", "Pincel angular", "Pincel de detalles (rigger / liner)",
               "Pincel para acuarela (pelo natural / kolinsky)", "Pincel para óleo / acrílico (pelo duro / cerda)",
               "Set pinceles (acuarela)", "Set pinceles (óleo / acrílico)", "Set pinceles (mixto todos los tipos)",
               "Esponja de pintar (sea sponge / sintética)", "Rodillo de pintar (artístico)",
               "Espátula / Cuchilla de pintar (palette knife)", "Paleta de mezclas (oval / rectangular)",
               "Paleta de mezclas (papel / desechable)", "Paleta húmeda (stay wet palette)",
               "Caballete de mesa", "Caballete de pie (tripié)", "Caja de pintura (maletín artista)",
               "Bote porta-pinceles", "Limpiador de pinceles / Masters Brush Cleaner"]
  },

  numero_pincel: {
    tipo: "texto",
    opciones: ["000 (ultra fino)", "00", "0", "1", "2", "3", "4", "5", "6", "7", "8", "10", "12", "14", "16", "18", "20",
               "Set (varios números)"]
  },

  pelo_material: {
    tipo: "texto",
    opciones: ["Sintético suave (acuarela / gouache)", "Sintético duro (acrílico / óleo)",
               "Kolinsky sable (premium — acuarela)", "Cerda natural (óleo — stiff)",
               "Nailon (multiusos)", "Pelo mixto", "Esponja"]
  },

  color_mango: {
    tipo: "imagen",
    nota: "El vendedor sube foto del pincel / set real. El cliente elige la imagen en el client.",
    guia_vendedor: ["Mango negro corto (acuarela)", "Mango negro largo (óleo)",
                    "Mango madera natural", "Mango rojo / dorado (premium)",
                    "Mango azul (sintético)", "Mango blanco", "Set en estuche / tubo (ver foto)",
                    "Paleta oval madera", "Paleta papel desechable", "Paleta húmeda (ver foto)",
                    "Caballete de mesa (ver foto)", "Espátula (ver foto)"]
  },

  cantidad_set: {
    tipo: "texto",
    opciones: ["Pincel individual", "Set 3 pinceles", "Set 5 pinceles", "Set 7 pinceles",
               "Set 10 pinceles", "Set 12 pinceles", "Set 15 pinceles", "Set 20+ pinceles"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Da Vinci (Kolinsky sable)", "Princeton Neptune / Catalyst", "Winsor & Newton Series 7",
               "Escoda Optimo / Perla", "Royal & Langnickel Zen", "Raphael (Francia)",
               "Liquitex (pinceles acrílico)", "Creative Mark (espátula / paleta)", "Artesco (pinceles)", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
