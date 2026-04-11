/**
 * VARIANTES - Instrumentos > Teclados y Piano > Pianos Digitales
 * Ruta: admin/src/variantes/instrumentos/teclados-piano/pianos-digitales/variantes.js
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

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: ["Piano digital de 88 teclas (mueble)", "Piano digital de 88 teclas (portátil / stage)",
               "Piano digital de 88 teclas con pedales y soporte", "Piano digital de 73 teclas",
               "Piano de cola digital", "Piano de piano bar / upright digital", "Piano híbrido (acción mecánica + digital)"]
  },

  numero_teclas: {
    tipo: "texto",
    requerido: true,
    opciones: ["61 teclas", "73 teclas", "76 teclas", "88 teclas"]
  },

  accion_teclado: {
    tipo: "texto",
    requerido: true,
    opciones: ["Sin contrapeso (sin weighted)", "Semi-pesado (semi-weighted)",
               "Pesado / Graded Hammer (GH)", "Pesado graduado con escapamiento (GH3X / RH3)",
               "Acción de madera + martillo (high-end)"]
  },

  polifonia: {
    tipo: "texto",
    requerido: false,
    opciones: ["32 voces", "64 voces", "128 voces", "192 voces", "256 voces", "320 voces+"]
  },

  color_producto: {
    tipo: "imagen",
    requerido: true,
    nota: "El vendedor sube foto real del piano. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro mate (standard)", "Negro brillante (lacado)", "Blanco mate",
      "Blanco brillante (lacado)", "Madera natural / Rosewood finish",
      "Negro + teclas marfil (premium)", "Plateado / Space grey (stage)"
    ]
  },

  conectividad: {
    tipo: "texto",
    requerido: false,
    opciones: ["Jack 6.35 mm (L/R)", "USB to Host (MIDI)", "Bluetooth MIDI + Audio",
               "MIDI DIN 5 pines", "Jack + USB + Bluetooth", "XLR + Jack + USB + Bluetooth"]
  },

  altavoces_w: {
    tipo: "texto",
    requerido: false,
    opciones: ["Sin altavoces (stage)", "Hasta 10 W", "10–20 W", "20–40 W", "40–80 W", "80 W+"]
  },

  marca: {
    tipo: "texto",
    requerido: true,
    opciones: ["Yamaha P-45 / P-125a / P-515", "Yamaha Clavinova CLP-745 / CLP-785",
               "Roland FP-30X / FP-90X / RD-88", "Roland HP704 / LX706 (mueble)",
               "Kawai ES120 / MP11SE / CA99", "Kawai KDP120 (mueble)",
               "Casio CDP-S360 / CT-S1000V / PX-S3100", "Korg B2 / LP-380 / Grandstage",
               "Nord Piano 5 / Stage 4 (stage profesional)", "Steinway Spirio (high-end)", "Genérico"]
  },

  incluye: {
    tipo: "texto",
    requerido: false,
    opciones: ["Solo piano", "Con soporte X", "Con soporte triple pedal", "Con banco + soporte + pedal", "Kit completo con auriculares"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
