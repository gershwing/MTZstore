/**
 * VARIANTES - Arte y Manualidades > Manualidades > Cerámica y Arcilla
 * Ruta: admin/src/variantes/arte-manualidades/manualidades/ceramica-arcilla/variantes.js
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
    opciones: ["Arcilla para horno (polymer clay)", "Arcilla de secado al aire (air dry clay)",
               "Arcilla de modelar / plastilina profesional", "Arcilla cerámica (para torno / horno eléctrico)",
               "Arcilla de papel (ligera)", "Pasta de porcelana fría", "Pasta Fimo (polimér)",
               "Pasta Premo Sculpey", "Arcilla self-hardening (sin horno)", "Arena cinética",
               "Herramientas de modelado (set)", "Torno de alfarero manual / eléctrico",
               "Horno para arcilla polimérica (doméstico)", "Esmalte / Glasur para cerámica",
               "Engobe / Slip (pintura cerámica cruda)", "Barniz para arcilla polimérica", "Arcilla local / artesanal", "Ceramica andina"]
  },

  color_arcilla: {
    tipo: "imagen",
    nota: "El vendedor sube foto del color real de la arcilla / pasta. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Blanco puro", "Blanco marfil / crema", "Negro", "Gris",
      "Rojo / Terracota", "Naranja", "Amarillo", "Verde",
      "Azul", "Violeta / Lila", "Rosa", "Marrón / Camel",
      "Dorado (metálico)", "Plateado (metálico)", "Cobre (metálico)",
      "Translúcido / Transparente", "Blanco porcelana frío",
      "Arcilla natural (color tierra)", "Arena cinética (beige natural)",
      "Set colores básicos (pack)", "Set colores pastel (pack)",
      "Set colores neón (pack)"
    ]
  },

  peso_cantidad: {
    tipo: "texto",
    opciones: ["57 g (2 oz — bloque Fimo)", "100 g", "250 g", "500 g", "1 kg", "2 kg", "5 kg", "10 kg",
               "Pack 8 colores", "Pack 12 colores", "Pack 24 colores"]
  },

  temperatura_coccion: {
    tipo: "texto",
    opciones: ["Sin cocción (air dry / porcelana fría)", "110–130°C (polymer clay — horno doméstico)",
               "900–1000°C (gres — horno eléctrico)", "1100–1280°C (porcelana — horno profesional)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Fimo Soft / Effect / Professional (Staedtler)", "Premo Sculpey / Souffle (Polyform)",
               "Cernit (Van Aken)", "Das Pronto (air dry)", "Activa Plus (air dry)",
               "Amaco (cerámica / esmalte)", "Speedball (herramientas / esmalte)", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
