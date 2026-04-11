/**
 * VARIANTES - Hogar y Cocina > Cocina > Utensilios
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


  tipo_producto: {
    tipo: "texto",
    opciones: ["Set de espátulas", "Cucharones", "Pinzas", "Cuchillos (set)", "Tabla de cortar", "Rallador", "Colador", "Batidor", "Moldes para hornear"]
  },

  material: {
    tipo: "texto",
    opciones: ["Silicona", "Acero inoxidable", "Nylon", "Madera", "Bambú", "Plástico BPA-free"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Gris", "Blanco", "Madera natural", "Rojo", "Verde", "Azul"]
  },

  piezas: {
    tipo: "texto",
    opciones: ["1 pieza", "3 piezas", "5 piezas", "6 piezas", "8 piezas", "10+ piezas"]
  },

  apto_lavavajillas: {
    tipo: "texto",
    opciones: ["Sí", "No"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
