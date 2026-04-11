/**
 * VARIANTES - Gaming y Tecnología > PC Gaming > Headsets Gaming
 * Ruta: admin/src/variantes/gaming/pc-gaming/headsets-gaming/variantes.js
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
    requerido: true,
    opciones: ["Over-ear cerrado", "Over-ear abierto", "On-ear", "In-ear gaming"]
  },

  conectividad: {
    tipo: "texto",
    opciones: ["USB con cable", "Jack 3.5 mm", "USB + Jack 3.5 mm", "2.4 GHz inalámbrico (dongle USB)", "Bluetooth", "Bluetooth + 2.4 GHz"]
  },

  sonido: {
    tipo: "texto",
    opciones: ["Estéreo", "7.1 virtual (software)", "7.1 real (múltiples drivers)", "Dolby Atmos / Spatial Audio"]
  },

  microfono: {
    tipo: "texto",
    opciones: ["Micrófono boom retráctil", "Micrófono boom desmontable", "Micrófono integrado (oculto)", "Sin micrófono"]
  },

  driver_size: {
    tipo: "texto",
    opciones: ["40 mm", "50 mm", "53 mm"]
  },

  iluminacion: {
    tipo: "texto",
    opciones: ["Sin iluminación", "RGB", "LED fijo"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Negro + RGB", "Verde", "Rosa", "Rojo", "Azul"]
  },

  compatible_con: {
    tipo: "texto",
    opciones: ["PC + PS5 + PS4", "PC + Xbox", "PC + PS + Xbox + Switch (universal)", "PC solamente", "Multiplataforma (ver descripción)"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
