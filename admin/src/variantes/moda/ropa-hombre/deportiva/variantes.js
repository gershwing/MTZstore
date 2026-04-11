/**
 * VARIANTES - Moda > Ropa Hombre > Deportiva
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


  talla: {
    tipo: "texto",
    requerido: true,
    opciones: ["XS", "S", "M", "L", "XL", "XXL", "3XL"]
  },

  tipo: {
    tipo: "texto",
    opciones: ["Camiseta deportiva", "Short deportivo", "Conjunto/Track Suit", "Sudadera", "Hoodie", "Legging hombre", "Compression"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Gris", "Azul", "Rojo", "Verde Neón", "Naranja"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Nike", "Adidas", "Puma", "Under Armour", "Reebok", "New Balance", "Fila", "Genérica"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
