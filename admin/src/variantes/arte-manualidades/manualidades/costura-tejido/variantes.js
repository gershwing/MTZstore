/**
 * VARIANTES - Arte y Manualidades > Manualidades > Costura y Tejido
 * Ruta: admin/src/variantes/arte-manualidades/manualidades/costura-tejido/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  AMPLIO uso en esta categoría: colores de pintura, tonos
 *                  de tela, texturas de papel, colores de hilo — la foto
 *                  del color real es decisiva para el artista.
 * tipo: "texto"  → selector de chips para especificaciones técnicas:
 *                  gramaje, tamaño, volumen, número de pinceles, dureza.
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
    opciones: ["Hilo de bordar (madeja)", "Set hilos de bordar (colores variados)", "Hilo coser a máquina (bobina)",
               "Hilo coser a mano", "Lana para tejer (ovillo — gruesa)", "Lana para tejer (ovillo — fina)",
               "Lana merino (ovillo)", "Hilo de algodón para amigurumi / crochet",
               "Hilo macramé (rollo)", "Tela de algodón (por metro)", "Tela de fieltro (por metro / pliego)",
               "Tela de lino (por metro)", "Tela impermeable", "Tela estampada (por metro)",
               "Aguja de coser a mano (set)", "Aguja de ganchillo / crochet (set)",
               "Aguja de tejer (par)", "Bastidor de bordado", "Aro de bordado (set tamaños)",
               "Tijera de costura", "Dedal", "Alfiletero + alfileres", "Cremallera (unidad)",
               "Botones (pack por color / talla)", "Elástico / Goma por metro", "Entretela / Termoadhesiva",
               "Lana de alpaca (ovillo)", "Lana de llama (ovillo)", "Aguayo / Textil andino"]
  },

  color_hilo_tela: {
    tipo: "imagen",
    nota: "El vendedor sube foto del color real del hilo / lana / tela. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Blanco", "Crema / Hueso", "Amarillo brillante", "Amarillo mostaza",
      "Naranja", "Coral / Salmón", "Rojo", "Granate / Burdeos",
      "Rosa claro", "Rosa fucsia", "Violeta claro", "Morado oscuro",
      "Azul cielo", "Azul marino", "Azul petróleo", "Verde menta",
      "Verde prado", "Verde oscuro / Bosque", "Marrón camel", "Marrón chocolate",
      "Gris perla", "Gris antracita", "Negro", "Dorado metálico", "Plateado metálico",
      "Lana blanca natural", "Lana cruda / beige", "Lana gris melange",
      "Lana azul marino", "Lana rojo burdeos", "Lana verde musgo",
      "Lana mostaza", "Lana coral", "Lana multicolor / jaspeada",
      "Tela algodón blanca", "Tela algodón estampada (ver foto)",
      "Fieltro verde", "Fieltro rojo", "Fieltro azul", "Fieltro negro",
      "Fieltro multicolor (set hojas)", "Tela lino crudo",
      "Macramé natural / beige", "Macramé blanco"
    ]
  },

  grosor_peso: {
    tipo: "texto",
    opciones: ["Lace (0)", "Fingering / Sock (1)", "Sport (2)", "DK / Light worsted (3)",
               "Worsted (4)", "Bulky (5)", "Super bulky (6)", "Jumbo (7)",
               "Hilo bordar 6 hebras estándar", "Hilo máquina (ver descripción)"]
  },

  material_fibra: {
    tipo: "texto",
    opciones: ["Algodón 100%", "Lana 100%", "Lana merino", "Acrílico 100%", "Acrílico + lana",
               "Alpaca", "Llama", "Vicuña", "Bambú / Viscosa", "Poliéster", "Hilo metálico (lurex)", "Mezcla (ver etiqueta)"]
  },

  cantidad: {
    tipo: "texto",
    opciones: ["1 madeja / ovillo / metro", "Pack 4 madejas", "Pack 6 madejas", "Pack 10 madejas",
               "Pack 25 madejas", "Rollo 50 m", "Rollo 100 m", "Por metro lineal (tela)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["DMC (hilo bordar — madeja 8 m)", "Anchor (hilo bordar)", "Coats (hilo coser / tejer)",
               "Drops Design (lana / algodón)", "Schachenmayr / Regia", "Paintbox Simply (hilo)",
               "Lion Brand (lana)", "Boye / Clover (agujas)", "Prym (accesorios costura)", "Lana boliviana artesanal", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
