/**
 * VARIANTES - Moda > Accesorios > Gafas
 *
 * tipo: "imagen" → selector con foto del producto (estilo AliExpress)
 * tipo: "texto"  → selector de chips / botones de texto
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo", "De retorno"]
  },


  tipo: {
    tipo: "texto",
    opciones: ["Sol", "Sol polarizado", "Sol deportivo", "Lectura", "Blue Light/Anti luz azul", "Aviador"]
  },

  forma: {
    tipo: "texto",
    opciones: ["Aviador", "Wayfarer", "Cat Eye", "Redonda", "Cuadrada", "Rectangular", "Oversize", "Deportiva"]
  },

  color_marco: {
    tipo: "imagen",
    opciones: ["Negro", "Carey/Tortoise", "Dorado", "Plateado", "Transparente", "Azul", "Rosa", "Blanco"]
  },

  genero: {
    tipo: "texto",
    opciones: ["Hombre", "Mujer", "Unisex"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Ray-Ban", "Oakley", "Carrera", "Gucci", "Prada", "Versace", "Hawkers", "Goodr", "Genérica"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
