/**
 * VARIANTES - Hogar y Cocina > Cocina > Hornos y Freidoras de Aire
 *
 * tipo: "imagen" → selector con foto del producto (estilo AliExpress)
 * tipo: "texto"  → selector de chips / botones de texto
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },


  tipo: {
    tipo: "texto",
    opciones: ["Freidora de aire", "Horno eléctrico", "Horno tostador", "Freidora de aire + horno", "Freidora convencional", "Horno de convección"]
  },

  capacidad: {
    tipo: "texto",
    opciones: ["2 L", "3.5 L", "4 L", "5 L", "6 L", "7 L", "8 L", "10 L", "12 L", "15+ L"]
  },

  potencia: {
    tipo: "texto",
    opciones: ["800 W", "1000 W", "1200 W", "1400 W", "1500 W", "1700 W", "1800 W", "2000+ W"]
  },

  marca_modelo: {
    tipo: "texto",
    opciones: ["Ninja", "Philips", "Cosori", "Oster", "Cuisinart", "Black+Decker", "Xiaomi", "Midea", "Breville"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Gris", "Inox", "Rojo", "Verde oscuro"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
