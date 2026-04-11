/**
 * VARIANTES - Belleza y Salud > Cuidado Personal > Secadoras de Cabello
 * Ruta: admin/src/variantes/belleza/cuidado-personal/secadoras-cabello/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/estilo es esencial para decidir.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
 *
 * Nota belleza: los tonos de maquillaje y colores de producto se manejan
 *               con tipo:"imagen" para que el cliente vea el tono real.
 *               Cada variante de tono requiere foto subida por el vendedor.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },


  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: ["Secador convencional", "Secador iónico", "Secador profesional (salón)", "Secador de viaje (compacto / plegable)", "Secador con difusor incluido"]
  },

  potencia: {
    tipo: "texto",
    opciones: ["1000–1400 W", "1400–1800 W", "1800–2200 W", "2200–2400 W", "2400 W+"]
  },

  tecnologia: {
    tipo: "texto",
    opciones: ["Estándar", "Iónica", "Cerámica + iónica", "Turmalina", "Infrarrojo", "Sin aspas (tipo Dyson)"]
  },

  velocidades_temp: {
    tipo: "texto",
    opciones: ["2 velocidades / 2 temperaturas", "2 velocidades / 3 temperaturas", "3 velocidades / 3 temperaturas", "Digital con control preciso"]
  },

  accesorios: {
    tipo: "texto",
    opciones: ["Solo boquilla concentradora", "Concentradora + difusor", "Concentradora + difusor + peine", "Sin accesorios"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Rosa", "Blanco", "Rojo", "Morado", "Dorado / Gold", "Plateado"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
