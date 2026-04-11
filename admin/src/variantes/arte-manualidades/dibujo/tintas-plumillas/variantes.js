/**
 * VARIANTES - Arte y Manualidades > Dibujo > Tintas y Plumillas
 * Ruta: admin/src/variantes/arte-manualidades/dibujo/tintas-plumillas/variantes.js
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
    opciones: ["Tinta china negra (frasco)", "Tinta de color (frasco)", "Tinta para calígrafia",
               "Tinta acuarelable", "Tinta india pigmentada", "Liner / Fineliner (rotulador técnico)",
               "Set liners / fineliners", "Rotulador brush pen (punta pincel)", "Set brush pens",
               "Rotulador de doble punta (brush + fino)", "Plumilla / Portaplumas + puntas",
               "Set de plumillas calígrafas", "Marcador alcohol (Copic style)", "Set marcadores alcohol",
               "Marcador acuarelable", "Posca / Marcador de pintura (acrílico)", "Set Posca"]
  },

  color_tinta: {
    tipo: "imagen",
    nota: "El vendedor sube foto del color real de la tinta / rotulador. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro (estándar)", "Negro sepia (cálido)", "Sepia (marrón)",
      "Tinta china azul", "Tinta roja", "Violeta / Índigo",
      "Set tintas colores primarios", "Set tintas 6 colores", "Set tintas 12 colores",
      "Liner negro 0.05 mm", "Liner negro 0.1 mm", "Liner negro 0.3 mm",
      "Liner negro 0.5 mm", "Liner negro 0.8 mm", "Set liners varios grosores",
      "Brush pen negro", "Brush pen sepia", "Brush pen gris",
      "Set brush pens básicos (6 colores)", "Set brush pens (12 colores)",
      "Set brush pens (24 colores)",
      "Posca blanco (sobre papel negro)", "Posca negro", "Posca colores (set)",
      "Marcador alcohol (set 12 grises)", "Marcador alcohol (set 36 colores)",
      "Marcador alcohol (set 72 colores / Copic style)"
    ]
  },

  grosor_punta_mm: {
    tipo: "texto",
    opciones: ["0.05 mm", "0.1 mm", "0.2 mm", "0.3 mm", "0.4 mm", "0.5 mm", "0.6 mm", "0.8 mm",
               "1.0 mm", "Brush (variable)", "Cincel / Calígrafia", "Varios (set)"]
  },

  cantidad_set: {
    tipo: "texto",
    opciones: ["Unidad individual", "Set 3", "Set 6", "Set 8", "Set 12", "Set 24", "Set 36", "Set 72", "Set 120+"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Micron Sakura (liner)", "Staedtler Pigment Liner", "Rotring (liner / portaplumas)",
               "Copic (marcador alcohol)", "Winsor & Newton (brush pen / tinta)",
               "Molotow (Posca style)", "Posca (Uni Mitsubishi)", "Tombow ABT (brush pen)",
               "Koh-I-Noor (tinta / plumilla)", "Brause / Leonardt (plumillas calígrafia)", "Artline", "Faber-Castell (marcadores)", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
