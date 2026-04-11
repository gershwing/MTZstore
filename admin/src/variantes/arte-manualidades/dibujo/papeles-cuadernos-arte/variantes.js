/**
 * VARIANTES - Arte y Manualidades > Dibujo > Papeles y Cuadernos de Arte
 * Ruta: admin/src/variantes/arte-manualidades/dibujo/papeles-cuadernos-arte/variantes.js
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
    opciones: ["Bloc de dibujo (papel liso)", "Bloc de papel para acuarela (prensado en frío)",
               "Bloc de papel para acuarela (prensado en caliente)", "Bloc de papel para acuarela (grano grueso)",
               "Bloc de papel para pastel / pastelmat", "Bloc para bocetos (sketch)", "Bloc para liner / tinta",
               "Bloc para marcadores (papel especial alcohol)", "Cuaderno de artista (tapa dura cosido)",
               "Papel de acuarela suelto (hojas)", "Papel Fabriano (hojas sueltas)",
               "Papel Canson (hojas sueltas)", "Papel de color (hojas para pastel / carbón)",
               "Papel de arroz / washi (caligrafía / sumi-e)", "Rollo de papel kraft (bocetos / mural)"]
  },

  gramaje_gsm: {
    tipo: "texto",
    opciones: ["90 g/m²", "120 g/m²", "150 g/m²", "180 g/m²", "200 g/m²", "220 g/m²", "250 g/m²",
               "300 g/m² (acuarela estándar)", "356 g/m²", "400 g/m²", "600 g/m² (premium)"]
  },

  tamano: {
    tipo: "texto",
    opciones: ["A6 (10×14 cm)", "A5 (14×20 cm)", "A4 (21×29.7 cm)", "A3 (29.7×42 cm)", "A2 (42×59.4 cm)",
               "A1 (59.4×84 cm)", "24×32 cm", "26×36 cm", "30×40 cm", "40×50 cm", "50×65 cm",
               "46×61 cm (half sheet)", "56×76 cm (full sheet)"]
  },

  hojas_pack: {
    tipo: "texto",
    opciones: ["10 hojas", "12 hojas", "20 hojas", "24 hojas", "30 hojas", "40 hojas", "50 hojas", "100 hojas"]
  },

  color_papel: {
    tipo: "imagen",
    nota: "El vendedor sube foto del papel / cuaderno real. El cliente elige la imagen en el client.",
    guia_vendedor: ["Blanco brillante (hot press)", "Blanco natural (cold press)",
                    "Blanco grano grueso (rough)", "Crema / Ivory (cuaderno artista)",
                    "Gris medio (pastel)", "Negro (papel de color)", "Azul noche",
                    "Papel kraft (marrón)", "Papel washi / arroz (fibras visibles)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Arches (300 gsm — acuarela)", "Fabriano Artistico / 5 / Academia",
               "Canson XL / Mi-Teintes / Montval", "Hahnemühle (acuarela / boceto)",
               "Strathmore (serie 200 / 400 / 500)", "Clairefontaine (manga / boceto)",
               "Moleskine Art (cuaderno artista)", "Leuchtturm1917 (cuaderno)", "Artesco (cuadernos)", "Torre (cuadernos LATAM)", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
