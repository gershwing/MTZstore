/**
 * VARIANTES - Oficina > Mobiliario Oficina > Escritorios de Oficina
 * Ruta: admin/src/variantes/oficina/mobiliario-oficina/escritorios-oficina/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/diseño es esencial.
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
      "Escritorio recto 120 cm",
      "Escritorio recto 140 cm",
      "Escritorio recto 160 cm",
      "Escritorio en L / esquinero (derecha)",
      "Escritorio en L / esquinero (izquierda)",
      "Escritorio standing / regulable en altura (manual)",
      "Escritorio standing (eléctrico)",
      "Escritorio con cajones integrados",
      "Escritorio con estante superior / hutch",
      "Escritorio flotante / de pared",
      "Mesa de reuniones 4–6 personas",
      "Mesa de reuniones 8–12 personas"
    ]
  },

  ancho_cm: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "80 cm", "100 cm", "120 cm", "140 cm",
      "160 cm", "180 cm", "200 cm+", "Configurable"
    ]
  },

  altura_regulable: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Fija",
      "Manual (palanca / manivela)",
      "Eléctrica 1 motor",
      "Eléctrica 2 motores",
      "Eléctrica con memoria (4 alturas)"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del escritorio real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Blanco", "Negro mate", "Roble / Madera natural", "Nogal / Madera café",
      "Gris claro", "Gris oscuro", "Blanco + patas negras", "Madera + patas negras",
      "Negro + patas negras", "Blanco + patas blancas", "Wengué"
    ]
  },

  material_tablero: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "MDF lacado",
      "Melamina",
      "Madera maciza",
      "Tablero de partículas + melamina",
      "MDF + chapa de madera"
    ]
  },

  material_patas: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Metal negro",
      "Metal blanco",
      "Metal plateado",
      "Madera maciza",
      "Aluminio"
    ]
  },

  certificacion: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Sin certificación especial",
      "BIFMA (resistencia USA)",
      "ISO 9001",
      "GREENGUARD (baja emisión VOC)"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Flexispot E7 / E5 (standing)",
      "Uplift V2 (standing)",
      "Autonomous SmartDesk",
      "Standing Desk IKEA Bekant",
      "IKEA Linnmon / Alex / Micke",
      "Fully Jarvis (standing)",
      "Genérico",
      "Marca local"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
