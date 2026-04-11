/**
 * VARIANTES - Bebés > Ropa Bebé > Zapatos Bebé
 * Ruta: admin/src/variantes/bebes/ropa-bebe/zapatos-bebe/variantes.js
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
      "16 (0–6 meses)",
      "17 (6–9 meses)",
      "18 (9–12 meses)",
      "19 (12–15 meses)",
      "20 (15–18 meses)",
      "21 (18–21 meses)",
      "22 (21–24 meses)",
      "23 (2 años)",
      "24 (2.5 años)",
      "25 (3 años)",
      "26 (3.5 años)",
      "27 (4 años)"
    ]
  },

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Patucos / Botitas tejidas (recién nacido)",
      "Zapatito de tela (primeros pasos)",
      "Sandalia de tela / cuero",
      "Botita de cuero suave",
      "Zapatilla deportiva mini",
      "Zapato de ocasión / bautizo",
      "Bota de lluvia mini",
      "Calcetin antideslizante"
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
    nota: "El vendedor sube foto del zapato real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Blanco", "Rosa palo", "Azul bebé", "Beige / Nude", "Rojo",
      "Dorado (bautizo)", "Plateado (bautizo)", "Multicolor estampado",
      "Negro + blanco", "Marrón cuero", "Estampado animales",
      "Verde menta", "Amarillo", "Con brillos / glitter"
    ]
  },

  material: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Cuero genuino suave",
      "Cuero sintético PU",
      "Tela de algodón",
      "Goma + tela",
      "Tejido / Crochet",
      "Ante / Nubuck",
      "Material reciclado"
    ]
  },

  suela: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Sin suela (patucos)",
      "Suela blanda antideslizante",
      "Suela flexible de goma",
      "Suela ligera EVA"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Robeez",
      "Bobux",
      "Stride Rite Baby",
      "See Kai Run",
      "Naturino Baby",
      "Chicco Baby",
      "Pablosky Baby",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
