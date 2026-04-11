/**
 * VARIANTES - Automotriz > Accesorios Exteriores > Luces LED
 * Ruta: admin/src/variantes/automotriz/accesorios-exteriores/luces-led/variantes.js
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Foco H4 LED blanco",
      "Foco H4 LED amarillo",
      "Foco H4 LED bicolor",
      "Foco H7 LED",
      "Foco H11 LED",
      "Barra LED 4x4 offroad",
      "DRL luz diurna",
      "Antiniebla LED",
      "Stop LED",
      "Luz matrícula LED",
      "Tira LED decorativa interior",
      "Foco marcha atrás LED",
      "Kit completo conversión LED"
    ]
  },

  color_luz: {
    tipo: "texto",
    requerido: false,
    opciones: ["Blanco 6000K", "Amarillo 3000K", "Bicolor blanco/amarillo", "RGB multicolor"]
  },

  voltaje: {
    tipo: "texto",
    requerido: false,
    opciones: ["12V", "24V", "12V + 24V universal"]
  },

  pack: {
    tipo: "texto",
    requerido: false,
    opciones: ["1 unidad", "Par (x2)", "Kit completo"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
