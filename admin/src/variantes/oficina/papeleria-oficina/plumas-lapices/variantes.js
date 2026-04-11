/**
 * VARIANTES - Oficina > Papelería Oficina > Plumas y Lápices
 * Ruta: admin/src/variantes/oficina/papeleria-oficina/plumas-lapices/variantes.js
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
      "Bolígrafo / Lapicero estándar",
      "Bolígrafo de gel",
      "Bolígrafo roller",
      "Pluma estilográfica / Fountain pen",
      "Portaminas mecánico",
      "Lápiz de madera grafito",
      "Lápiz carpintero",
      "Marcador de pizarrón (borrable)",
      "Marcador permanente grueso",
      "Marcador permanente fino",
      "Plumón punta fina (archivo / documentos)",
      "Bolígrafo multifunción (3–4 colores)",
      "Bolígrafo con linterna / stylus"
    ]
  },

  grosor_punta: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Extrafino (0.3–0.4 mm)",
      "Fino (0.5 mm)",
      "Medio (0.7 mm)",
      "Grueso (1.0 mm)",
      "Muy grueso (1.6 mm+)"
    ]
  },

  color_tinta: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del bolígrafo / pluma real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro", "Azul", "Rojo", "Verde", "Morado", "Naranja",
      "Multicolor set 4", "Multicolor set 8", "Multicolor set 12", "Dorado / Plateado (metallic)"
    ]
  },

  pack: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Unidad individual",
      "Caja 6",
      "Caja 10",
      "Caja 12",
      "Caja 20",
      "Caja 50",
      "Caja 100"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "BIC Cristal / 4 Colores / Atlantis",
      "Pilot G2 / V5 / Frixion (borrable)",
      "Stabilo Point 88 / Boss",
      "Pentel EnerGel / GraphGear 1000",
      "Uni-ball Jetstream / Eye",
      "Lamy Safari / Al-Star (estilográfica)",
      "Parker Jotter / IM (estilográfica)",
      "Cross Click",
      "Montblanc Meisterstück (premium)",
      "Artesco / Norma (LATAM)",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
