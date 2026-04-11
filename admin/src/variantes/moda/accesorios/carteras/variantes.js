/**
 * VARIANTES - Moda > Accesorios > Carteras
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
    opciones: ["Billetera larga", "Billetera compacta", "Tarjetero", "Monedero", "Billetera con cierre", "Clip para billetes"]
  },

  genero: {
    tipo: "texto",
    opciones: ["Hombre", "Mujer", "Unisex"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Café", "Marrón", "Azul Marino", "Burdeos", "Nude", "Rosa"]
  },

  material: {
    tipo: "texto",
    opciones: ["Cuero genuino", "Cuero sintético/PU", "Tela/Canvas", "Fibra de carbono"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
