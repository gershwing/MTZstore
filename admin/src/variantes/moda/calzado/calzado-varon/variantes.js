/**
 * VARIANTES - Moda > Calzado > Calzado Varón
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
    opciones: ["38", "39", "40", "41", "42", "43", "44", "45"]
  },

  tipo: {
    tipo: "texto",
    opciones: ["Zapato vestir Oxford", "Zapato vestir Derby", "Mocasín/Loafer", "Náutico", "Chelsea Boot", "Bota casual"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Café Oscuro", "Café Claro", "Marrón", "Azul Marino", "Beige"]
  },

  material: {
    tipo: "texto",
    opciones: ["Cuero genuino", "Cuero sintético", "Tela/Canvas", "Gamuza", "Nylon/Mesh"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
