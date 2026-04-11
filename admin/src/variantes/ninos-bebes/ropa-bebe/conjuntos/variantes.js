/**
 * VARIANTES - Bebés > Ropa Bebé > Conjuntos
 * Ruta: admin/src/variantes/bebes/ropa-bebe/conjuntos/variantes.js
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

  talla: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "RN (0–1 mes)",
      "0–3 meses",
      "3–6 meses",
      "6–9 meses",
      "9–12 meses",
      "12–18 meses",
      "18–24 meses",
      "2 años",
      "3 años"
    ]
  },

  piezas: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "2 piezas (body + pantalón)",
      "2 piezas (camiseta + pantalón)",
      "2 piezas (top + short)",
      "3 piezas (body + pantalón + gorro)",
      "3 piezas (camiseta + pantalón + chaleco)",
      "4 piezas (body + pantalón + bib + gorro)",
      "Set completo (5+ piezas)"
    ]
  },

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Conjunto casual diario",
      "Conjunto de paseo / salida",
      "Conjunto de verano",
      "Conjunto de invierno / abrigo",
      "Conjunto de recién nacido (gift set)",
      "Conjunto de bautizo / ocasión especial",
      "Conjunto deportivo / activo",
      "Conjunto de playa / piscina (con protección UV)"
    ]
  },

  genero: {
    tipo: "texto",
    requerido: true,
    opciones: ["Niño", "Niña", "Unisex"]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del conjunto completo. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Azul + blanco", "Rosa + blanco", "Blanco + gris", "Amarillo + verde",
      "Multicolor estampado", "Estampado animales de la selva",
      "Estampado oso / osito", "Estampado dinosaurios", "Estampado flores",
      "Azul marino + rayas", "Rosa + estrellas", "Blanco + lunares",
      "Verde oliva + beige", "Estampado frutas", "Set regalo (caja)"
    ]
  },

  material: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "100% Algodón",
      "Algodón orgánico",
      "Algodón + poliéster (fleece)",
      "Bambú",
      "Lana merino (invierno)"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Carter's",
      "Chicco",
      "H&M Baby",
      "Zara Baby",
      "OshKosh B'gosh",
      "Petit Bateau",
      "Absorba",
      "Mayoral",
      "Neck & Neck",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
