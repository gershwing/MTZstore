/**
 * VARIANTES - Bebés > Juguetes > Muñecas y Peluches
 * Ruta: admin/src/variantes/bebes/juguetes/munecas/variantes.js
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
      "Muñeca de tela suave (bebé)",
      "Muñeca bebé realista (recién nacido)",
      "Fashion doll (tipo Barbie)",
      "Muñeca articulada",
      "Casa de muñecas",
      "Set ropa y accesorios para muñeca",
      "Muñeca interactiva (habla / llora)",
      "Muñeca coleccionable",
      "Familia de muñecas (set)",
      "Peluche animales grandes",
      "Peluche animales pequeños",
      "Peluche personaje (película / serie)",
      "Marioneta de mano",
      "Muñeco de trapo artesanal"
    ]
  },

  tamano: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Mini (10–15 cm)",
      "Pequeño (20–25 cm)",
      "Mediano (30–35 cm)",
      "Grande (45–50 cm)",
      "XL (55–65 cm)",
      "Peluche gigante (70 cm+)"
    ]
  },

  genero_orientado: {
    tipo: "texto",
    requerido: false,
    opciones: ["Niña", "Niño", "Unisex"]
  },

  edad_recomendada: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "0–2 años (sin piezas pequeñas)",
      "2–4 años",
      "4–7 años",
      "7–12 años",
      "Coleccionable (12+)"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real de la muñeca / peluche. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Muñeca piel clara + cabello rubio", "Muñeca piel clara + cabello castaño",
      "Muñeca piel morena + cabello negro", "Muñeca piel oscura + cabello rizado",
      "Peluche oso marrón", "Peluche oso blanco", "Peluche conejo rosa",
      "Peluche elefante gris", "Peluche unicornio", "Peluche dinosaurio",
      "Peluche personaje (ver foto)", "Set familia multiétnica"
    ]
  },

  material: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Tela suave + relleno fibra",
      "Vinilo / PVC (muñeca articulada)",
      "Silicona platino (realista)",
      "Peluche con pelaje sintético",
      "Madera (articulada)",
      "Algodón orgánico (tela)"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Barbie (Mattel)",
      "LOL Surprise",
      "Bratz",
      "American Girl",
      "Baby Alive (Hasbro)",
      "Corolle (Francia)",
      "Götz (Alemania)",
      "Our Generation",
      "Ty Beanie Boos (peluche)",
      "Jellycat (peluche)",
      "Build-A-Bear",
      "Disney (personajes)",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
