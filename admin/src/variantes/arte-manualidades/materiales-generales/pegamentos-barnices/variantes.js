/**
 * VARIANTES - Arte y Manualidades > Materiales Generales > Pegamentos y Barnices
 * Ruta: admin/src/variantes/arte-manualidades/materiales-generales/pegamentos-barnices/variantes.js
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
    opciones: ["Pegamento PVA / Cola blanca (manualidades)", "Mod Podge (decoupage + barniz)",
               "Pegamento de barra (papel / cartulina)", "Pegamento en spray (reposicionable)",
               "Pegamento en spray (permanente)", "Pegamento de silicona (pistola de calor)",
               "Cinta washi / masking tape (uso artístico)", "Cinta de doble cara espuma",
               "Barniz acrílico mate (para pintura)", "Barniz acrílico satinado", "Barniz acrílico brillante",
               "Barniz protector para resina", "Barniz UV (anti-amarillamiento)", "Laca en spray (fijador dibujo)",
               "Fijador para pastel / carbón (spray)", "Medio para acrílico (retardante / pouring)", "Gel medium"]
  },

  volumen: {
    tipo: "texto",
    opciones: ["22 ml (barra)", "30 ml", "50 ml", "100 ml", "118 ml (4 oz)", "236 ml (8 oz)", "473 ml (16 oz)",
               "500 ml", "946 ml (32 oz)", "1 L", "Spray 400 ml", "Spray 500 ml"]
  },

  acabado: {
    tipo: "texto",
    opciones: ["No aplica (pegamento puro)", "Mate", "Satinado", "Semi-brillante", "Brillante", "Ultra brillante"]
  },

  color_presentacion: {
    tipo: "imagen",
    nota: "El vendedor sube foto del producto real. El cliente elige la imagen en el client.",
    guia_vendedor: ["Mod Podge frasco azul (mate)", "Mod Podge frasco rojo (brillante)",
                    "Barniz spray (ver lata)", "Laca fijadora (ver lata)",
                    "PVA frasco (ver foto)", "Pistola de silicona (ver foto)",
                    "Spray pegamento (ver lata)", "Gel medium (ver frasco)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Mod Podge (Plaid)", "Liquitex (mediums / barniz)", "Golden (GAC / mediums)",
               "Winsor & Newton (barniz artístico)", "Krylon (fijador / barniz spray)",
               "Loctite / UHU (pegamento)", "Elmer's PVA", "3M (spray adhesivo)", "Pegastic (Bolivia)", "Akapol (Bolivia)", "Resistol (LATAM)", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
