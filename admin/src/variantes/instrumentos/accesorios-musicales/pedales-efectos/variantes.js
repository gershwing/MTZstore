/**
 * VARIANTES - Instrumentos > Accesorios Musicales > Pedales y Efectos
 * Ruta: admin/src/variantes/instrumentos/accesorios-musicales/pedales-efectos/variantes.js
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
    opciones: ["Afinador de pedal (tuner)", "Overdrive", "Distorsión / High gain", "Fuzz",
               "Booster de señal", "Compresor", "Chorus", "Flanger", "Phaser", "Tremolo", "Vibrato",
               "Reverb", "Delay analógico", "Delay digital", "Looper (pedal)", "Wah wah / Auto wah",
               "Pitch shifter / Octaver", "EQ gráfico de pedal", "Noise gate / Suppressor",
               "Multi-efectos (varios en uno)", "Pedalboard / Tablero para pedales", "Fuente de poder para pedales",
               "Expresión / Volumen pedal", "Pedal sustain para teclado", "Pedal triple para piano"]
  },

  formato: {
    tipo: "texto",
    requerido: false,
    opciones: ["Pedal compacto (mini)", "Pedal estándar (1590B)", "Pedal doble / dual", "Rack 19\"", "Pedalboard completo"]
  },

  color_producto: {
    tipo: "imagen",
    requerido: true,
    nota: "El vendedor sube foto real del pedal. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro / Black (estándar)", "Blanco / White", "Rojo", "Azul",
      "Verde", "Naranja", "Morado", "Plateado / Aluminio",
      "Dorado", "Amarillo", "Camuflaje", "Edición limitada (ver foto)"
    ]
  },

  voltaje: {
    tipo: "texto",
    requerido: false,
    opciones: ["9V DC (Boss / standard)", "9V / 18V switchable", "12V DC", "18V DC", "24V DC", "Batería 9V interna", "USB"]
  },

  true_bypass: {
    tipo: "texto",
    requerido: false,
    opciones: ["True bypass", "Buffered bypass", "Relay switching (silent)", "No especificado"]
  },

  marca: {
    tipo: "texto",
    requerido: true,
    opciones: ["Boss DS-1 / OD-1X / DD-8 / RV-6 / RC-5", "Electro-Harmonix Big Muff / Holy Grail / POG2",
               "Strymon BigSky / Timeline / Riverside", "MXR Phase 90 / Carbon Copy / M87",
               "TC Electronic Hall of Fame / Flashback / Polytune", "Ibanez Tube Screamer TS9 / TS808",
               "JHS Morning Glory / Colour Box", "Walrus Audio Fathom / Mako D1",
               "Line 6 HX Stomp / Helix (multi-efectos)", "Boss GT-1000 / ME-90 (multi-efectos)",
               "Fractal Audio Axe-Fx III (profesional)", "Neural DSP Quad Cortex", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
