/**
 * VARIANTES - Farmacia > Respiratorio y Alergias > Antihistamínicos
 * Ruta: admin/src/variantes/farmacia/respiratorio-alergias/antihistamínicos/variantes.js
 *
 * IMPORTANTE: Solo productos OTC (venta libre sin receta).
 * condicion: siempre ["Nuevo"] — nunca Usado / Reacondicionado.
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar solo en: sabores de jarabes, colores de vendas,
 *                  presentaciones con packaging visualmente distinto.
 * tipo: "texto"  → predominante en farmacia: dosis, forma farmacéutica,
 *                  principio activo, cantidad, rango de edad.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Sellado de fabrica", "Fecha vigente"]
  },

  principio_activo: {
    tipo: "texto",
    requerido: true,
    opciones: ["Loratadina (no sedante)", "Cetirizina (no sedante)", "Levocetirizina",
               "Fexofenadina (no sedante)", "Bilastina (no sedante)", "Rupatadina",
               "Clorfenamina / Clorfeniramina (sedante — 1a generación)",
               "Difenhidramina (sedante / inductor del sueño OTC)",
               "Ketotifeno (colirio / oral)", "Azelastina (spray nasal)"]
  },

  indicacion: {
    tipo: "texto",
    opciones: ["Rinitis alérgica estacional", "Rinitis alérgica perenne", "Urticaria / Ronchas",
               "Alergia alimentaria leve (síntomas)", "Picaduras insectos",
               "Conjuntivitis alérgica", "Alergia al polvo / ácaros", "Dermatitis alérgica"]
  },

  forma_farmaceutica: {
    tipo: "texto",
    opciones: ["Comprimido", "Comprimido bucodispersable (se disuelve en boca)", "Cápsula",
               "Jarabe / Solución oral", "Gotas orales", "Spray nasal", "Colirio oftálmico",
               "Crema tópica (antihistamínico + cortisona leve OTC)"]
  },

  dosis_mg: {
    tipo: "texto",
    opciones: ["1 mg / ml (jarabe pediátrico)", "2.5 mg", "5 mg", "10 mg", "20 mg", "120 mg", "180 mg"]
  },

  cantidad_unidades: {
    tipo: "texto",
    opciones: ["7 unidades", "10 unidades", "14 unidades", "20 unidades", "30 unidades",
               "Frasco 60 ml", "Frasco 100 ml", "Frasco 120 ml"]
  },

  edad_uso: {
    tipo: "texto",
    opciones: ["Bebé (desde 6 meses — solo loratadina / cetirizina pediátrico)", "Niño (2–11 años)",
               "Adulto y adolescente (12+ años)", "Adulto (18+)"]
  },

  presentacion_imagen: {
    tipo: "imagen",
    nota: "El vendedor sube foto del empaque real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Comprimido (ver caja)", "Jarabe (ver frasco)", "Colirio (ver frasco)",
      "Spray nasal (ver envase)", "Crema tópica (ver tubo)",
      "Pack alergia completo (ver caja)"
    ]
  },

  marca: {
    tipo: "texto",
    opciones: ["Claritin / Loratadina MK (Bayer)", "Zyrtec (cetirizina — UCB / J&J)",
               "Allegra / Fexofenadina (Sanofi)", "Bilaxten (bilastina)", "Clarityne (MSD)",
               "Aerius (desloratadina OTC en algunos países)", "Benadryl (difenhidramina — J&J)",
               "Zaditen (ketotifeno)", "Genérico / Farmacia"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
