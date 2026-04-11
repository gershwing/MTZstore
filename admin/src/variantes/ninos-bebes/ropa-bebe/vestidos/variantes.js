/**
 * VARIANTES - Niños y Bebés > Ropa Bebé > Vestidos
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  talla: {
    tipo: "texto",
    variante: true,
    opciones: ["0-3 meses", "3-6 meses", "6-9 meses", "9-12 meses", "12-18 meses", "18-24 meses", "2 años", "3 años", "4 años", "5 años", "6 años"]
  },

  tipo: {
    tipo: "texto",
    opciones: ["Vestido casual", "Vestido de fiesta", "Vestido de bautizo", "Vestido de verano", "Vestido con tutú", "Conjunto vestido + calza"]
  },

  genero: {
    tipo: "texto",
    opciones: ["Niña"]
  },

  color: {
    tipo: "imagen",
    variante: true,
    opciones: []
  },

  material: {
    tipo: "texto",
    opciones: ["Algodón 100%", "Algodón + Poliéster", "Tul / Organza", "Lino", "Polar"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Carter's", "H&M Baby", "Zara Baby", "Mayoral", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
