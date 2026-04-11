/**
 * VARIANTES - Niños y Bebés > Ropa Bebé > Abrigos
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
    opciones: ["Campera / Chamarra", "Buzo con capucha", "Chaleco acolchado", "Poncho", "Cardigan / Saco de lana", "Rompe vientos", "Overol de invierno"]
  },

  genero: {
    tipo: "texto",
    opciones: ["Niño", "Niña", "Unisex"]
  },

  color: {
    tipo: "imagen",
    variante: true,
    opciones: []
  },

  material: {
    tipo: "texto",
    opciones: ["Algodón acolchado", "Polar / Fleece", "Lana", "Alpaca", "Pluma / Down", "Polyester impermeable", "Algodón + Poliéster"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Carter's", "H&M Baby", "Zara Baby", "Chicco", "Artesanal boliviano", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
