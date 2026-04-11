/**
 * VARIANTES - Niños y Bebés > Accesorios Bebé > Cambiadores
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  tipo: {
    tipo: "texto",
    opciones: ["Cambiador de mesa", "Cambiador plegable portatil", "Colchoneta cambiador", "Cambiador sobre cuna", "Mueble cambiador con cajones"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Blanco", "Gris", "Beige", "Rosa", "Azul"]
  },

  material: {
    tipo: "texto",
    opciones: ["Madera", "Plástico", "Tela impermeable", "Espuma + funda lavable"]
  },

  marca: {
    tipo: "texto",
    opciones: ["IKEA", "Chicco", "Stokke", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
