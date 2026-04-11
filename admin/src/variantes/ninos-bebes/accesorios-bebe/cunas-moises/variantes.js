/**
 * VARIANTES - Bebés > Accesorios Bebé > Cunas y Moisés
 * Ruta: admin/src/variantes/bebes/accesorios-bebe/cunas-moises/variantes.js
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
      "Moisés / Cuna portátil (newborn)",
      "Cuna de madera clásica",
      "Cuna con ruedas",
      "Cuna colecho / Adosable (co-sleeper)",
      "Cuna convertible (cama infantil)",
      "Cuna de viaje / Pack n Play",
      "Balancín / Mecedora bebé (bouncer)",
      "Hamaca / Swing automático",
      "Cuna mecedora automática",
      "Nido / Reductor de cuna",
      "Cuña antirreflujo"
    ]
  },

  edad_uso: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Recién nacido – 6 meses",
      "Recién nacido – 9 meses",
      "Recién nacido – 3 años (convertible)",
      "0–18 kg",
      "Hasta 9 kg (bouncer / hamaca)"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del producto. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Blanco", "Gris", "Beige / Arena", "Madera natural", "Madera + gris",
      "Negro", "Blanco + madera", "Menta / Verde suave", "Rosa palo",
      "Azul claro", "Gris + estrella", "Madera + blanco"
    ]
  },

  material_estructura: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Madera maciza (haya / pino)",
      "Madera MDF lacada",
      "Metal / Acero",
      "Tela + estructura metálica (cuna viaje)",
      "Plástico reforzado (bouncer)"
    ]
  },

  colchon: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Sin colchón (solo estructura)",
      "Con colchón de espuma incluido",
      "Con colchón breathable incluido",
      "Con colchón de muelles incluido"
    ]
  },

  certificacion: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "EN 716 (cuna — Europe)",
      "ASTM (USA)",
      "BS EN 1870 (balancín)",
      "Sin certificación especificada"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "IKEA Sundvik / Sniglar",
      "Stokke Sleepi V3 / Tripp Trapp Newborn",
      "Chicco Next2Me Magic / Lullago",
      "Joie Kubbie Sleep / Serina Swing",
      "Nuna SENA Aire / LEAF Grow",
      "Graco Pack 'n Play On the Go",
      "4moms MamaRoo / RockaRoo",
      "Ingenuity Boutique Collection",
      "Fisher-Price Auto Rock 'n Play",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
