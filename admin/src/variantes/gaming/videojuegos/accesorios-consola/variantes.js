/**
 * VARIANTES - Gaming y Tecnología > Videojuegos > Accesorios de Consola
 * Ruta: admin/src/variantes/gaming/videojuegos/accesorios-consola/variantes.js
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
    opciones: ["Control / Mando inalámbrico", "Control / Mando con cable", "Control Pro / Elite", "Base de carga (controles)", "Auriculares / Headset gaming", "Funda protectora (consola)", "Protector de pantalla (Switch)", "Soporte vertical (consola)", "Disco duro externo / SSD", "Cable HDMI 2.1", "Adaptador / Hub USB", "Skin / Vinilo decorativo", "Thumbstick grips (tapas de joystick)", "Teclado / Chat pad"]
  },

  compatible_con: {
    tipo: "texto",
    requerido: true,
    opciones: ["PS5", "PS4", "Xbox Series X|S", "Xbox One", "Nintendo Switch", "Nintendo Switch Lite", "PC", "Universal / Multiplataforma"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Rojo", "Azul", "Verde", "Morado", "Rosa", "Camuflaje", "Transparente", "Edición Especial (ver descripción)"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
