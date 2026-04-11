/**
 * VARIANTES - Instrumentos > Percusión > Cajones y Bongos
 * Ruta: admin/src/variantes/instrumentos/percusion/cajones-bongos/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar en: colores / acabados de cuerpo, diseños de funda,
 *                  colores de batería — el músico compra por lo que ve.
 * tipo: "texto"  → selector de chips para especificaciones técnicas:
 *                  número de cuerdas, teclas, tallas, materiales, potencia.
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
    opciones: ["Cajón flamenco (con bordones)", "Cajón de snare (cuerdas cruzadas)", "Cajón sin bordones (neutro)",
               "Cajón eléctrico (con pastilla / micrófono)", "Cajón infantil (talla niño)",
               "Bongós (par estándar)", "Bongós profesionales", "Bongó individual",
               "Cajita de música / Music box", "Frame drum / Pandero frame", "Tar / Duff (tambor de marco)"]
  },

  madera_tapa: {
    tipo: "texto",
    requerido: false,
    opciones: ["Álamo (tapa suave — flamenco)", "Abedul (tapa equilibrada)", "Arce / Maple (tapa brillante)",
               "Sapele / Caoba (cálido)", "Haya / Beech", "Fibra de carbono (premium)",
               "Okume (ligero)", "Paulownia (acústico)"]
  },

  color_cuerpo: {
    tipo: "imagen",
    requerido: true,
    nota: "El vendedor sube foto real del cajón. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Natural / Madera vista barnizada", "Caoba oscura barnizada",
      "Nogal / Wenge oscuro", "Negro pintado", "Blanco pintado",
      "Estampado mandala (serigrafía)", "Estampado tribal / étnico",
      "Estampado geométrico", "Estampado personalizable (ver foto)",
      "Rojo lacado", "Azul lacado"
    ]
  },

  medidas_cm: {
    tipo: "texto",
    requerido: false,
    opciones: ["28×28×47 cm (estándar adulto)", "24×24×40 cm (junior)", "20×20×30 cm (infantil)", "Talla personalizable"]
  },

  con_funda: {
    tipo: "texto",
    requerido: false,
    opciones: ["Sin funda", "Con funda de transporte acolchada", "Con mochila de cajón"]
  },

  marca: {
    tipo: "texto",
    requerido: true,
    opciones: ["Meinl Artisan / Woodcraft / String", "Schlagwerk 2in1 / Cajon Plus",
               "LP Americana / Aspire", "Pearl Primero / Boom Box",
               "Gon Bops Alex Acuña / Mariano", "Sela Varios / SE 271",
               "Tycoon Percussion", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
