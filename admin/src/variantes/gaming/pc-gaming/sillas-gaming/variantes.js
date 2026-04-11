/**
 * VARIANTES - Gaming y Tecnología > PC Gaming > Sillas Gaming
 * Ruta: admin/src/variantes/gaming/pc-gaming/sillas-gaming/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/estilo es esencial para decidir.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
 *
 * Nota gaming: las ediciones especiales y bundles se manejan como variante,
 *              NO como producto separado.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo", "Usado", "Reacondicionado", "Caja Abierta"]
  },


  tipo: {
    tipo: "texto",
    opciones: ["Silla gaming estándar", "Silla gaming premium (cuero PU)", "Silla ergonómica gaming / oficina", "Silla racing (respaldo alto)", "Silla de piso (plegable, sin patas)", "Silla cockpit / Simulador"]
  },

  material: {
    tipo: "texto",
    opciones: ["Cuero sintético PU", "Tela transpirable (Mesh)", "Tela + cuero sintético (híbrido)", "Cuero genuino", "Terciopelo / Velour"]
  },

  capacidad_peso: {
    tipo: "texto",
    opciones: ["Hasta 100 kg", "Hasta 120 kg", "Hasta 150 kg", "Hasta 180 kg (XL)"]
  },

  reclinacion: {
    tipo: "texto",
    opciones: ["Hasta 135°", "Hasta 155°", "Hasta 180° (completamente plano)"]
  },

  reposabrazos: {
    tipo: "texto",
    opciones: ["Fijos", "1D (arriba/abajo)", "2D (arriba/abajo + adentro/afuera)", "3D (+ adelante/atrás)", "4D (+ rotación)"]
  },

  incluye: {
    tipo: "texto",
    opciones: ["Solo silla", "Con cojín lumbar", "Con cojín lumbar + cervical", "Con reposapiés retráctil", "Con altavoces Bluetooth integrados"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Negro + Rojo", "Negro + Azul", "Negro + Blanco", "Negro + Verde", "Rosa + Blanco", "Gris", "Todo blanco"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
