/**
 * VARIANTES - Niños y Bebés > Accesorios Bebé > Bañeras
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  tipo: {
    tipo: "texto",
    opciones: ["Bañera clásica", "Bañera plegable", "Bañera con soporte", "Bañera inflable", "Asiento de baño", "Tina con termómetro"]
  },

  edad_uso: {
    tipo: "texto",
    opciones: ["0-6 meses", "0-12 meses", "0-24 meses", "6 meses - 3 años"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Blanco", "Rosa", "Azul", "Verde", "Gris"]
  },

  material: {
    tipo: "texto",
    opciones: ["Plástico PP", "Plástico plegable", "PVC inflable", "Silicona"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Chicco", "Fisher-Price", "Stokke", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
