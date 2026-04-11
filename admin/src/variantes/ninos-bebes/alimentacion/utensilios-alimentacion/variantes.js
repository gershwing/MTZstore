/**
 * VARIANTES - Bebés > Alimentación > Utensilios de Alimentación
 * Ruta: admin/src/variantes/bebes/alimentacion/utensilios-alimentacion/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/estampado es esencial.
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
      "Set de cubiertos (cuchara + tenedor)",
      "Cuchara de silicona flexible",
      "Plato con ventosa antideslizante",
      "Bol / Cuenco con tapa",
      "Set plato + bol + cubiertos",
      "Babero impermeable con bolsillo",
      "Babero de silicona",
      "Vaso de aprendizaje / Sippy cup",
      "Vaso con pitillo (straw cup)",
      "Vaso 360° (sin derrames)",
      "Termo / Vaso con tapa hermética",
      "Procesador de alimentos bebé",
      "Silla de comer portátil / booster",
      "Triturador / Masticador de alimentos (mesh feeder)",
      "Pajita / Pitillo de aprendizaje",
      "Set completo alimentación (todo incluido)"
    ]
  },

  edad: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "4–6 meses (inicio)",
      "6–9 meses",
      "9–12 meses",
      "12–18 meses",
      "18–24 meses",
      "2–4 años",
      "4+ años"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del producto. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Blanco + gris", "Rosa + blanco", "Azul + blanco", "Verde menta",
      "Naranja + beige", "Multicolor set", "Transparente + rosa",
      "Nude / Beige natural", "Amarillo + gris", "Estampado animales"
    ]
  },

  material: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Silicona grado alimentario (libre BPA)",
      "Plástico PP (libre BPA)",
      "Acero inoxidable",
      "Bambú (ecológico)",
      "Cerámica",
      "Madera natural",
      "Melamina"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "OXO Tot Transitions",
      "Ezpz Mini Mat / Tiny Bowl",
      "Munchkin 360°",
      "NUK First Choice",
      "Philips Avent",
      "Béaba Babycook (procesador)",
      "BÉABA",
      "Learning Curve",
      "Bumkins (babero)",
      "Grabease (cubiertos)",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
