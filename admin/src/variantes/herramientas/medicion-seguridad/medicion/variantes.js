/**
 * VARIANTES - Herramientas > Medición y Seguridad > Medición
 * Ruta: admin/src/variantes/herramientas/medicion-seguridad/medicion/variantes.js
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
      "Cinta métrica / Huincha retráctil",
      "Nivel de burbuja (aluminio)",
      "Nivel láser de líneas",
      "Nivel láser de puntos",
      "Medidor láser de distancia",
      "Escuadra / Escuadra combinada",
      "Transportador / Bevel gauge",
      "Calibrador vernier / Pie de rey",
      "Micrómetro",
      "Multímetro digital",
      "Pinza amperimétrica / Clamp meter",
      "Termómetro infrarrojo (industrial)",
      "Detector de vigas / metales / tensión",
      "Plomada / Plumb bob",
      "Nivel digital con ángulo",
      "Telémetro laser + trípode"
    ]
  },

  precision: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "±1 mm",
      "±0.5 mm",
      "±0.3 mm",
      "±0.1 mm",
      "±0.01 mm (micrómetro)",
      "±1° / ±0.5° (nivel)"
    ]
  },

  alcance: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "No aplica",
      "Hasta 5 m (cinta)",
      "5–10 m",
      "10–50 m (laser)",
      "50–100 m",
      "100–200 m",
      "200 m+"
    ]
  },

  color_producto: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del instrumento. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Amarillo + negro (Stanley / DeWalt)", "Rojo + negro (Milwaukee)",
      "Verde (Bosch Laser)", "Gris + amarillo", "Naranja + negro",
      "Negro + gris (Fluke / Hioki)", "Plateado / Gris (calibrador)", "Genérico"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Bosch GLM 50-27 CG / GLL 3-80 (laser)",
      "Leica Disto E7500i / D2",
      "Stanley FATMAX / PowerLock (cinta)",
      "DeWalt DWHT36107 / DW089LG",
      "Fluke 117 / 323 / 62 MAX (multímetro / clamp / termómetro)",
      "Hioki E8112 / FT6031",
      "Mitutoyo 530 / 293 (calibrador / micrómetro)",
      "Milwaukee 2260-20 (detector)",
      "Zircon StudSensor e50 (detector vigas)",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
