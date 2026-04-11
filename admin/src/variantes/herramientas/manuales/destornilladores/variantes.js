/**
 * VARIANTES - Herramientas > Manuales > Destornilladores
 * Ruta: admin/src/variantes/herramientas/manuales/destornilladores/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/acabado es esencial.
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
      "Destornillador plano",
      "Destornillador Phillips / Cruz",
      "Destornillador Torx",
      "Destornillador Pozidriv",
      "Destornillador hexagonal / Allen",
      "Set destornilladores mango fijo",
      "Set de puntas intercambiables (bit set)",
      "Destornillador de precisión / relojero",
      "Destornillador de impacto manual",
      "Destornillador eléctrico compacto USB-C",
      "Destornillador con trinquete / ratchet"
    ]
  },

  puntas_incluidas: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "1 punta (unitario)",
      "6 puntas",
      "10 puntas",
      "25 puntas",
      "50 puntas",
      "100 puntas",
      "200+ puntas"
    ]
  },

  medidas_punta: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "SL 3 mm",
      "SL 5 mm",
      "SL 6 mm",
      "PH0 / PH1 / PH2 / PH3",
      "PZ0 / PZ1 / PZ2 / PZ3",
      "T10 / T15 / T20 / T25 / T30",
      "HEX 3–10 mm",
      "Set variado (PH + PZ + SL + TX)"
    ]
  },

  material_mango: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Plástico bi-material",
      "Goma suave (soft grip)",
      "Madera",
      "Metal con grip",
      "Plástico reforzado CrV"
    ]
  },

  color_producto: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del producto. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Amarillo + negro (Stanley)", "Rojo + negro (Wera)", "Naranja (Felo)",
      "Azul + negro (Wiha)", "Verde (Vessel)", "Gris + amarillo (Bosch)",
      "Rojo (PB Swiss)", "Multicolor set (por tipo)", "Genérico"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Wera Kraftform / Koloss / Zyklop",
      "Wiha SoftFinish / Insulated",
      "PB Swiss Tools",
      "Felo Ergonic / Industrial",
      "Vessel Ball Grip",
      "Stanley FatMax / Classic",
      "DeWalt DWHT65022",
      "Klein Tools",
      "Bosch 2607002515 (bit set)",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
