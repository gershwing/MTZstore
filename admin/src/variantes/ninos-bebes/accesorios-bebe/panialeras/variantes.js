/**
 * VARIANTES - Bebés > Accesorios Bebé > Pañaleras
 * Ruta: admin/src/variantes/bebes/accesorios-bebe/panialeras/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/estampado es esencial.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
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
    opciones: [
      "Bolso pañalera tipo tote (hombro)",
      "Mochila pañalera backpack",
      "Bolso pañalera crossbody / bandolera",
      "Cambiador portátil (solo cambiador)",
      "Bolso para carrito (se engancha al cochecito)",
      "Set bolso + cambiador + accesorios",
      "Bolso de maternidad (hospital + pañalera)",
      "Mini bolso salida rápida"
    ]
  },

  capacidad: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Pequeña (salida corta)",
      "Mediana (1 día)",
      "Grande (viaje / fin de semana)",
      "XL (viaje largo)"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del bolso. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro liso", "Gris marengo", "Beige / Camel", "Verde oliva",
      "Azul marino", "Marrón / Cuero", "Blanco + gris",
      "Estampado floral", "Estampado geométrico", "Negro + dorado",
      "Rosa palo", "Negro + beige", "Multicolor boho"
    ]
  },

  material: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Oxford nylon (impermeable)",
      "Canvas / Lona",
      "Cuero sintético PU",
      "Cuero genuino",
      "Tela acolchada quilted",
      "Tela impermeable PEVA interior"
    ]
  },

  incluye: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Solo bolso",
      "Con cambiador portátil",
      "Con organizador / insert",
      "Con ganchos para carrito",
      "Kit completo (bolso + cambiador + accesorios + isotérmica)"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Skip Hop Forma / Duo (signature)",
      "JuJuBe BFF / Hobobe",
      "Freshly Picked",
      "Storksak (cuero)",
      "Petunia Pickle Bottom",
      "Itzy Ritzy (mochila)",
      "Kibou (mini)",
      "Lässig Green Label",
      "Ergobaby Anywhere (mochila)",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
