/**
 * VARIANTES - Electrónica > Accesorios Celulares > Cargadores
 *
 * tipo: "imagen" → selector con foto del producto (estilo AliExpress)
 * tipo: "texto"  → selector de chips / botones de texto
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo", "Usado", "Reacondicionado", "Caja Abierta"]
  },


  tipo_producto: {
    tipo: "texto",
    opciones: ["Cargador de pared", "Cable únicamente", "Kit cargador + cable", "Cargador inalámbrico Qi", "Cargador MagSafe", "Cargador de auto", "Base de carga múltiple"]
  },

  conector: {
    tipo: "texto",
    opciones: ["USB-C", "Lightning", "Micro USB", "USB-A", "MagSafe", "Multi-punta"]
  },

  potencia: {
    tipo: "texto",
    opciones: ["15W", "20W", "25W", "30W", "35W", "40W", "45W", "50W", "55W", "60W", "67W", "90W", "120W", "140W+"]
  },

  puertos: {
    tipo: "texto",
    opciones: ["1 puerto", "2 puertos", "3 puertos", "4 puertos GaN"]
  },

  color: {
    tipo: "imagen",
    opciones: []
  },

  longitud_cable: {
    tipo: "texto",
    opciones: ["0.25 m", "1 m", "1.5 m", "2 m", "3 m"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
