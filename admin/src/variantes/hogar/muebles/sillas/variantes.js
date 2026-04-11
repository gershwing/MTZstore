/**
 * VARIANTES - Hogar y Cocina > Muebles > Sillas
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
    opciones: ["Oficina/Escritorio", "Gamer", "Comedor", "Bar/Alta", "Mecedora", "Plegable", "Ergonómica", "Sillón auxiliar"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Gris", "Blanco", "Beige", "Azul", "Verde", "Rosa", "Marrón", "Rojo", "Madera+tapizado", "Metal+tapizado"]
  },

  material_asiento: {
    tipo: "texto",
    opciones: ["Tela mesh", "Cuero sintético", "Cuero genuino", "Tela tapizada", "Plástico", "Madera", "Terciopelo"]
  },

  material_estructura: {
    tipo: "texto",
    opciones: ["Metal", "Madera", "Plástico", "Metal+plástico", "Aluminio"]
  },

  regulable_altura: {
    tipo: "texto",
    opciones: ["Sí", "No"]
  },

  reposabrazos: {
    tipo: "texto",
    opciones: ["Sí, fijos", "Sí, ajustables", "Sí, abatibles", "No"]
  },

  ruedas: {
    tipo: "texto",
    opciones: ["Sí", "No"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
