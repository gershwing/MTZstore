/**
 * VARIANTES - Oficina > Papelería Oficina > Organizadores
 * Ruta: admin/src/variantes/oficina/papeleria-oficina/organizadores/variantes.js
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
      "Bandeja de escritorio (documentos)",
      "Portabolígrafos / Lapicero de escritorio",
      "Organizador de escritorio multicompartimento",
      "Caja de almacenamiento de archivos",
      "Dispensador de cinta adhesiva",
      "Engrapador / Grapadora",
      "Sacagrapa / Quitagrapas",
      "Perforador 2 huecos",
      "Perforador 3 huecos",
      "Clip / Clips mariposa (caja)",
      "Grapa / Grapas 26/6 (caja)",
      "Post-it / Notas adhesivas (set)",
      "Pizarrón blanco de escritorio",
      "Pizarrón corcho",
      "Calendario de escritorio",
      "Rotulador de etiquetas / Label maker",
      "Sello de fechas",
      "Almohadilla de tinta",
      "Calculadora de escritorio",
      "Trituradora de papel"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del producto / organizador real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro mate", "Negro brillante", "Blanco", "Plateado / Cromado",
      "Dorado / Champán", "Gris", "Azul marino", "Transparente",
      "Madera natural / Bambú", "Madera oscura", "Multicolor pastel set"
    ]
  },

  material: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Plástico ABS",
      "Metal / Acero",
      "Madera / Bambú",
      "Acrílico / Metacrilato",
      "Cuero sintético",
      "Mesh metálico"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "3M Post-it",
      "Fellowes",
      "ACCO / Mead",
      "Leitz",
      "Rexel",
      "Artesco",
      "Genérico",
      "IKEA (papelería)"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
