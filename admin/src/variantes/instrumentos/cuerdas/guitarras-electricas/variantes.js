/**
 * VARIANTES - Instrumentos > Cuerdas > Guitarras Eléctricas
 * Ruta: admin/src/variantes/instrumentos/cuerdas/guitarras-electricas/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar en: colores / acabados de cuerpo, diseños de funda,
 *                  colores de batería — el músico compra por lo que ve.
 * tipo: "texto"  → selector de chips para especificaciones técnicas:
 *                  número de cuerdas, teclas, tallas, materiales, potencia.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  tipo_cuerpo: {
    tipo: "texto",
    requerido: true,
    opciones: ["Stratocaster (SSS)", "Stratocaster HSS", "Stratocaster HSH",
               "Telecaster (SS)", "Telecaster (HH)", "Les Paul (HH)",
               "Les Paul (P90 + HB)", "SG (HH)", "ES-335 / Semi-hollow (HH)",
               "Jazzmaster / Jaguar", "V-Shape / Flying V / Explorer",
               "Super Strat (HSH shred)", "Baritona", "7 cuerdas", "8 cuerdas"]
  },

  acabado_color: {
    tipo: "imagen",
    requerido: true,
    nota: "El vendedor sube foto real del acabado. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Sunburst 2 colores (lemon burst)", "Sunburst 3 colores (tabaco / tobacco)",
      "Sunburst negro (black burst)", "Cherry sunburst",
      "Fiesta Red", "Candy Apple Red", "Lake Placid Blue",
      "Olympic White", "Vintage White / Cream",
      "Negro brillante (gloss black)", "Negro mate (satin black)",
      "Dorado (Gold top)", "Honey burst / Amber",
      "Natural (maple top visible)", "Quilted Maple top azul",
      "Quilted Maple top verde", "Quilted Maple top morado",
      "Surf Green", "Sonic Blue", "Seafoam Green",
      "Trans Red / Trans Blue (translúcido)", "Silverburst"
    ]
  },

  pastillas: {
    tipo: "texto",
    requerido: true,
    opciones: ["SSS (3 single coil)", "HSS (humbucker + 2 single)", "HSH (humbucker + single + humbucker)",
               "HH (2 humbuckers)", "P90 + humbucker", "Active EMG (85/81)", "Active Fishman Fluence",
               "Piezo (acústica / semi-hollow)"]
  },

  numero_cuerdas: {
    tipo: "texto",
    requerido: true,
    opciones: ["6 cuerdas", "7 cuerdas", "8 cuerdas"]
  },

  escala_mm: {
    tipo: "texto",
    requerido: false,
    opciones: ["610 mm (Gibson short)", "628 mm (PRS)", "648 mm (Gibson estándar)", "660 mm (Fender estándar)", "686 mm (baritona)"]
  },

  mastil: {
    tipo: "texto",
    requerido: false,
    opciones: ["Maple (arce)", "Caoba", "Roasted maple", "Wenge", "Pau ferro", "Ebano"]
  },

  diapason: {
    tipo: "texto",
    requerido: false,
    opciones: ["Palisandro (rosewood)", "Arce (maple)", "Ébano", "Pau ferro", "Laurel"]
  },

  marca: {
    tipo: "texto",
    requerido: true,
    opciones: ["Fender American Professional II / Player / Vintera", "Gibson Les Paul Standard / SG Standard",
               "PRS SE Custom 24 / S2 / Core", "Epiphone Les Paul Standard / SG / ES-335",
               "Squier Classic Vibe / Affinity", "Ibanez RG / AZ / S Series",
               "ESP LTD EC-1000 / M-1000", "Jackson Dinky / Soloist",
               "Schecter Hellraiser / Omen", "Charvel Pro-Mod", "Genérico"]
  },

  incluye: {
    tipo: "texto",
    requerido: false,
    opciones: ["Solo guitarra", "Con funda blanda", "Con case rígido", "Kit completo (funda + correa + cuerdas + cable)"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
