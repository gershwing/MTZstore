/**
 * VARIANTES - Moda > Ropa Mujer > Deportiva
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
    opciones: ["Legging", "Top deportivo", "Sports bra", "Short deportivo", "Conjunto deportivo", "Hoodie", "Sudadera"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Rosa", "Lila", "Azul", "Gris", "Verde Menta", "Coral"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Nike", "Adidas", "Puma", "Under Armour", "Reebok", "Lululemon", "Fila", "Genérica"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
