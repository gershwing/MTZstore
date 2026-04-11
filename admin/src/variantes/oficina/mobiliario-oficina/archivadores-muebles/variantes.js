/**
 * VARIANTES - Oficina > Mobiliario Oficina > Archivadores y Muebles
 * Ruta: admin/src/variantes/oficina/mobiliario-oficina/archivadores-muebles/variantes.js
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
      "Archivador metálico 2 gavetas (carta / legal)",
      "Archivador metálico 3 gavetas",
      "Archivador metálico 4 gavetas",
      "Archivador lateral (carpetas colgantes horizontal)",
      "Archivador de madera / MDF",
      "Armario de oficina con puertas",
      "Locker / Casillero",
      "Estantería de oficina abierta",
      "Cajonera de escritorio (pedestal)",
      "Mueble bajo con cajones",
      "Vitrina / Librería con vidrio",
      "Carro porta-archivos con ruedas"
    ]
  },

  medidas_ancho: {
    tipo: "texto",
    requerido: false,
    opciones: ["40–50 cm", "50–60 cm", "60–80 cm", "80–100 cm", "100–120 cm", "Modular"]
  },

  numero_cajones: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "2 cajones",
      "3 cajones",
      "4 cajones",
      "5 cajones",
      "6 cajones",
      "Estantería (sin cajones)"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del mueble. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Gris claro (metálico)", "Gris oscuro (metálico)", "Negro (metálico)",
      "Beige / Arena (metálico)", "Blanco (madera)", "Roble / Madera natural",
      "Nogal / Wengué", "Negro mate (madera)", "Blanco + patas metal negro"
    ]
  },

  material: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Metal / Acero laminado en frío",
      "Acero + MDF (combinado)",
      "MDF lacado",
      "Madera maciza",
      "Melamina"
    ]
  },

  cierre: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Sin cerradura",
      "Con llave (1 cerradura)",
      "Con llave (cerradura por cajón)",
      "Con código digital"
    ]
  },

  certificacion: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Sin certificación",
      "EN 14073 (mobiliario oficina Europa)",
      "BIFMA",
      "Ignífugo clase B"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "IKEA Kallax / Alex / Galant",
      "Bisley (metálico premium)",
      "HON 310 / 800 Series",
      "Hirsh Industries",
      "Lorell",
      "Global Industrial",
      "Genérico",
      "Marca local"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
