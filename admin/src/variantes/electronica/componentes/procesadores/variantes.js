/**
 * VARIANTES - Electrónica > Componentes > Procesadores
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


  marca: {
    tipo: "texto",
    opciones: ["Intel", "AMD"]
  },

  serie_intel: {
    tipo: "texto",
    opciones: ["Core i3 12a Gen", "Core i5 12a Gen", "Core i7 12a Gen", "Core i9 12a Gen", "Core i3 13a Gen", "Core i5 13a Gen", "Core i7 13a Gen", "Core i9 13a Gen", "Core i5 14a Gen", "Core i7 14a Gen", "Core i9 14a Gen", "Core Ultra 5", "Core Ultra 7", "Core Ultra 9"]
  },

  serie_amd: {
    tipo: "texto",
    opciones: ["Ryzen 5 5600", "Ryzen 7 5700X", "Ryzen 7 5800X3D", "Ryzen 9 5900X", "Ryzen 9 5950X", "Ryzen 5 7600", "Ryzen 7 7700X", "Ryzen 9 7900X", "Ryzen 9 7950X", "Ryzen 5 9600X", "Ryzen 7 9700X", "Ryzen 9 9900X", "Ryzen 9 9950X"]
  },

  socket: {
    tipo: "texto",
    opciones: ["LGA1700 (Intel 12/13/14 Gen)", "LGA1851 (Intel Core Ultra 200)", "AM4 (AMD Ryzen 5000)", "AM5 (AMD Ryzen 7000/9000)"]
  },

  incluye_disipador: {
    tipo: "texto",
    opciones: ["Con disipador stock", "Sin disipador (solo procesador)"]
  },

  color_empaque: {
    tipo: "imagen",
    guia_vendedor: ["Intel Azul", "AMD Rojo", "AMD Naranja"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
