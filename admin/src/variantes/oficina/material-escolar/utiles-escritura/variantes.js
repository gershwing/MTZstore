/**
 * VARIANTES - Oficina > Material Escolar > Útiles de Escritura
 * Ruta: admin/src/variantes/oficina/material-escolar/utiles-escritura/variantes.js
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
      "Lápiz grafito HB / 2B / 4B (caja)",
      "Lápices de colores (12 colores)",
      "Lápices de colores (24 colores)",
      "Lápices de colores (36 / 48 / 72 colores)",
      "Plumones de colores (set)",
      "Plumones punta fina (set)",
      "Marcadores permanentes (set)",
      "Resaltadores / Marcadores fluorescentes (set)",
      "Lapicero / Bolígrafo azul / negro / rojo (caja)",
      "Lapicero gel (set)",
      "Portaminas 0.5 mm / 0.7 mm",
      "Minas de repuesto",
      "Goma de borrar",
      "Corrector líquido / Tipex",
      "Corrector en cinta",
      "Tijeras escolares",
      "Pegamento en barra",
      "Pegamento líquido / silicona fría",
      "Regla / Escuadra / Transportador",
      "Compás de dibujo técnico",
      "Set de geometría completo"
    ]
  },

  cantidad: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Unidad individual",
      "Caja 6 unidades",
      "Caja 12 unidades",
      "Caja 24 unidades",
      "Caja 36 unidades",
      "Caja 48 unidades",
      "Caja 72 unidades",
      "Set completo (varios tipos)"
    ]
  },

  color_set: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del set de colores o del producto. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Caja colores primarios (12)", "Caja colores ampliada (24)", "Caja premium (36+)",
      "Set plumones colores vivos", "Set resaltadores pasteles", "Set resaltadores neón",
      "Bolígrafo negro (caja)", "Bolígrafo azul (caja)", "Set bolígrafos surtidos",
      "Set completo escolar (todo incluido)"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Faber-Castell Goldfaber / Polychromos / Connector",
      "Staedtler Noris / Luna / Triplus",
      "Crayola Classic / Signature",
      "Prismacolor Premier (profesional)",
      "Maped Color'Peps",
      "BIC Evolution / Cristal / 4 Colores",
      "Pilot G2 / V5 (gel)",
      "Pentel EnerGel / GraphGear",
      "Uni Jetstream / Pin (punta fina)",
      "Artesco / Norma (LATAM)",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
