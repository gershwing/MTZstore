/**
 * VARIANTES - Moda > Ropa Mujer > Chaquetas
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
    opciones: ["Blazer", "Denim", "Cuero/Biker", "Puffer/Acolchada", "Trench", "Teddy/Peluche", "Cortavientos"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Beige", "Rosa", "Azul", "Café", "Rojo", "Camel"]
  },

  material: {
    tipo: "texto",
    opciones: ["Cuero genuino", "Cuero sintético", "Denim", "Nylon", "Poliéster", "Lana"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
