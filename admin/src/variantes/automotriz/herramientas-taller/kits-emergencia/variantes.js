/**
 * VARIANTES - Automotriz > Herramientas de Taller > Kits de Emergencia
 * Ruta: admin/src/variantes/automotriz/herramientas-taller/kits-emergencia/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/estilo es esencial para decidir.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },


  tipo: {
    tipo: "imagen",
    guia_vendedor: ["Kit básico", "Kit estándar", "Kit completo", "Kit premium", "Mochila emergencia"]
  },

  contenido_incluye: {
    tipo: "texto",
    opciones: ["Triángulos de emergencia (x2)", "Chaleco reflectante", "Extintor 1 kg ABC", "Extintor 2 kg ABC", "Botiquín básico", "Botiquín completo (75 piezas)", "Cable de arranque (pasa corriente)", "Linterna LED", "Guantes de trabajo", "Cinta de balizamiento", "Lámpara de emergencia LED", "Inflador mini"]
  },

  extintor: {
    tipo: "texto",
    opciones: ["Sin extintor", "Extintor 1 kg ABC", "Extintor 2 kg ABC", "Extintor 6 kg ABC"]
  },

  normativa: {
    tipo: "texto",
    opciones: ["Sin certificación", "Norma Chile DS 211 (Automotriz)", "Norma Perú MTC", "Norma Bolivia (vigente)", "CE / Euro"]
  },

  presentacion: {
    tipo: "texto",
    opciones: ["Bolsa / Estuche compacto", "Mochila", "Caja rígida", "Caja de herramientas"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
