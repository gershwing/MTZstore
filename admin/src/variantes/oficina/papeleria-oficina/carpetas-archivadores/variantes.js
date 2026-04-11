/**
 * VARIANTES - Oficina > Papelería Oficina > Carpetas y Archivadores
 * Ruta: admin/src/variantes/oficina/papeleria-oficina/carpetas-archivadores/variantes.js
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
      "Archivador palanca tamaño carta",
      "Archivador palanca tamaño oficio",
      "Archivador palanca lomo ancho (8 cm)",
      "Carpeta de argollas 1\" / 1.5\" / 2\" / 3\"",
      "Carpeta con liga / solapas",
      "Carpeta con broche binder",
      "Carpeta colgante",
      "Separadores de carpeta (set)",
      "Folder manila carta / oficio (paquete)",
      "Folder plástico transparente",
      "Sobre de presentación / portafolio",
      "Caja archivadora",
      "Porta-documentos A4 con cierre"
    ]
  },

  tamano: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Carta (21.6×27.9 cm)",
      "Oficio / Legal (21.6×33 cm)",
      "A4 (21×29.7 cm)",
      "A5",
      "A3"
    ]
  },

  lomo_cm: {
    tipo: "texto",
    requerido: false,
    opciones: ["No aplica", "2 cm", "4 cm", "5 cm", "8 cm", "10 cm"]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del color real del archivador. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro", "Azul marino", "Rojo", "Verde", "Amarillo", "Blanco",
      "Gris", "Naranja", "Morado", "Marrón kraft", "Multicolor set (varios colores)"
    ]
  },

  material: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Cartón plastificado",
      "Plástico PVC",
      "Plástico PP (polipropileno)",
      "Tela / Canvas",
      "Cuero sintético"
    ]
  },

  pack: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Unidad individual",
      "Pack 5",
      "Pack 10",
      "Pack 20",
      "Caja 50 unidades",
      "Caja 100 unidades"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Leitz 180° / Alpha / Wow",
      "Avery",
      "Oxford",
      "Artesco",
      "Norma",
      "Staples",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
