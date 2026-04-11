/**
 * VARIANTES - Hogar y Cocina > Electrodomésticos > Aspiradoras
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
    opciones: ["Robot", "Vertical/Stick", "Trineo", "De mano", "Aspiradora-fregadora", "Industrial"]
  },

  potencia_succion: {
    tipo: "texto",
    opciones: ["2000 Pa", "4000 Pa", "6000 Pa", "8000 Pa", "10000 Pa", "15000+ Pa"]
  },

  autonomia_min: {
    tipo: "texto",
    opciones: ["20 min", "30 min", "40 min", "60 min", "90 min", "120+ min", "Con cable"]
  },

  marca_modelo: {
    tipo: "texto",
    opciones: ["Dyson", "iRobot Roomba", "Roborock", "Xiaomi", "Samsung", "Cecotec", "Karcher", "Bissell", "Shark"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Plata", "Azul", "Rojo"]
  },

  capacidad_deposito: {
    tipo: "texto",
    opciones: ["0.3 L", "0.5 L", "0.6 L", "0.8 L", "1 L", "1.5 L", "2+ L"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
