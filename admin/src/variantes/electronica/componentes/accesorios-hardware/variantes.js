/**
 * VARIANTES - Electrónica > Componentes > Accesorios de Hardware
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


  tipo: {
    tipo: "texto",
    opciones: ["Gabinete ATX", "Gabinete mATX", "Gabinete ITX", "Tarjeta de sonido", "Tarjeta capturadora", "Riser PCIe (extensión GPU)", "Kit cables extensión RGB", "Adaptador Wi-Fi PCIe / USB", "Controlador ARGB / ventiladores", "Lector de tarjetas SD", "Hub interno USB 3.0"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Negro+vidrio templado", "Blanco+vidrio templado"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
