/**
 * VARIANTES - Herramientas > Jardinería > Riego
 * Ruta: admin/src/variantes/herramientas/jardineria/riego/variantes.js
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
      "Manguera de jardín (por metro)",
      "Manguera expandible 15–30 m",
      "Manguera expandible 30–50 m",
      "Pistola de riego multifunción",
      "Aspersor de jardín (oscilante)",
      "Aspersor pop-up",
      "Riego por goteo (kit completo)",
      "Temporizador de riego digital",
      "Bomba de agua sumergible",
      "Bomba de superficie para pozo",
      "Kit goteo para macetas / huerto urbano",
      "Rollo de cinta de goteo (por metro)",
      "Conectores y accesorios manguera (set)",
      "Regadera manual",
      "Pulverizador de mochila manual 8–20 L",
      "Sensor de humedad de suelo"
    ]
  },

  diametro_manguera: {
    tipo: "texto",
    requerido: false,
    opciones: ["No aplica", "1/2\" (12 mm)", "3/4\" (19 mm)", "1\" (25 mm)"]
  },

  longitud_m: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "No aplica", "10 m", "15 m", "20 m", "25 m",
      "30 m", "50 m", "100 m", "Por metro (cinta goteo)"
    ]
  },

  presion_bar: {
    tipo: "texto",
    requerido: false,
    opciones: ["No aplica", "1–3 bar", "3–5 bar", "5–8 bar", "8–12 bar", "12 bar+"]
  },

  color_producto: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del producto. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Verde oscuro (manguera clásica)", "Negro (manguera profesional)",
      "Azul + gris (kit riego)", "Naranja + gris", "Gris + negro",
      "Verde expandible", "Negro + amarillo (bomba)", "Genérico varios colores"
    ]
  },

  material_manguera: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "PVC estándar",
      "PVC reforzado 3 capas",
      "Goma natural",
      "Poliuretano expandible",
      "Nailon trenzado (premium)",
      "Polietileno (cinta goteo)"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Gardena Classic / Comfort / Premium",
      "Karcher GardenHose / BP3",
      "Melnor / Flexon",
      "Orbit (riego programable)",
      "Rain Bird (goteo / aspersores)",
      "Bosch UniversalAquatak",
      "Gilmour",
      "Tramontina / Vonder (LATAM)",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
