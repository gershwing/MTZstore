/**
 * VARIANTES - Instrumentos > Percusión > Baterías
 * Ruta: admin/src/variantes/instrumentos/percusion/baterias/variantes.js
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
    opciones: ["Batería acústica 4 piezas (shell pack)", "Batería acústica 5 piezas (shell pack)",
               "Batería acústica con platos (kit completo)", "Batería electrónica de malla",
               "Batería electrónica de caucho", "Batería electrónica híbrida (malla + caucho)",
               "Pad de práctica individual", "Set de pads de práctica completo",
               "Caja / Snare individual", "Bombo individual", "Tom individual", "Hi-hat individual"]
  },

  numero_piezas: {
    tipo: "texto",
    requerido: true,
    opciones: ["3 piezas (bombo + redoblante + 1 tom)", "4 piezas (+ floor tom)",
               "5 piezas (+ 2 toms + floor tom)", "6 piezas", "7 piezas + platos"]
  },

  color_bateria: {
    tipo: "imagen",
    requerido: true,
    nota: "El vendedor sube foto real de la batería / acabado de cáscara. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro (wrap liso)", "Blanco (wrap liso)", "Rojo brillante",
      "Azul medianoche", "Purpura / Morado",
      "Maple natural (lacado brillante)", "Caoba (lacado)",
      "Silver sparkle / Plata brillante", "Black sparkle",
      "Blue sparkle", "Wine red", "Candy apple red lacado",
      "Transparent red (lacado translúcido)", "Transparent blue",
      "Gold sparkle", "Snare negro (individual)"
    ]
  },

  material_cascara: {
    tipo: "texto",
    requerido: false,
    opciones: ["Álamo / Poplar (estudio)", "Abedul / Birch", "Arce / Maple", "Caoba / Mahogany",
               "Roble / Oak", "Caucho / Rubber pad (electrónica)", "Malla (mesh head — electrónica)"]
  },

  diametro_bombo: {
    tipo: "texto",
    requerido: false,
    opciones: ["18\"", "20\"", "22\"", "24\""]
  },

  modulo_electronica: {
    tipo: "texto",
    requerido: false,
    opciones: ["No aplica (acústica)", "Módulo básico (Roland TD-07 / Alesis Nitro)",
               "Módulo intermedio (Roland TD-17 / Yamaha DTX402)",
               "Módulo avanzado (Roland TD-27 / Yamaha DTX8K)"]
  },

  marca: {
    tipo: "texto",
    requerido: true,
    opciones: ["Pearl Export / Session Studio / Reference", "Tama Imperialstar / Starclassic",
               "DW Collector's / Performance / Design", "Ludwig Classic Maple / Accent",
               "Yamaha Stage Custom / Recording Custom / Live Custom",
               "Mapex Armory / Saturn / Black Panther", "Sonor AQ2 / SQ2 / Prolite",
               "Roland TD-07KV / TD-17KVX / TD-27KV (electrónica)",
               "Yamaha DTX452K / DTX8K-M (electrónica)", "Alesis Nitro Max / Surge (electrónica)",
               "Genérico"]
  },

  incluye: {
    tipo: "texto",
    requerido: false,
    opciones: ["Solo shell pack (sin platos)", "Con platos (hi-hat + crash + ride)", "Con trono / banqueta",
               "Kit completo (shell + platos + trono + baquetas)", "Con módulo electrónico incluido"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
