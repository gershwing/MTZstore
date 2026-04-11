/**
 * VARIANTES - Moda > Ropa Hombre > Pantalones
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
    opciones: ["28", "30", "32", "34", "36", "38", "40", "42"]
  },

  tipo: {
    tipo: "texto",
    opciones: ["Jeans", "Chinos", "Cargo", "Jogger", "Vestir", "Bermuda"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Azul Oscuro", "Azul Claro", "Gris", "Beige", "Café", "Verde Oliva", "Blanco"]
  },

  material: {
    tipo: "texto",
    opciones: ["Denim", "Algodón", "Poliéster", "Gabardina", "Lino"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
