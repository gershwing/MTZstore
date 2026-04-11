/**
 * VARIANTES - Niños y Bebés > Ropa Bebé > Pantalones
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
    opciones: ["Pantalón algodón", "Jean / Denim", "Short / Bermuda", "Calza / Legging", "Pantalón deportivo", "Pantalón de polar", "Overol / Jardinero"]
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
    opciones: ["Algodón 100%", "Algodón + Spandex", "Denim", "Polar / Fleece", "Polyester deportivo"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Carter's", "OshKosh B'gosh", "H&M Baby", "Zara Baby", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
