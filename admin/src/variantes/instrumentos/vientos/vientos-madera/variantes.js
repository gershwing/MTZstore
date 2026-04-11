/**
 * VARIANTES - Instrumentos > Vientos > Vientos Madera
 * Ruta: admin/src/variantes/instrumentos/vientos/vientos-madera/variantes.js
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
    opciones: ["Flauta traversa (Boehm system)", "Flauta de pecho / dulce soprano (C)", "Flauta dulce contralto (F)",
               "Flauta irlandesa (flute / whistle)", "Tin whistle / Low whistle",
               "Clarinete en Si bemol (Bb)", "Clarinete bajo", "Saxofón alto (Mi bemol)",
               "Saxofón tenor (Si bemol)", "Saxofón soprano", "Saxofón barítono",
               "Oboe", "Fagot / Bassoon", "Quena (flauta andina LATAM)", "Siku / Zampoña (LATAM)",
               "Ocarina (6 agujeros)", "Recorder soprano ABS (escolar)"]
  },

  material_cuerpo: {
    tipo: "texto",
    requerido: true,
    opciones: ["Plástico ABS (estudio / principiante)", "Níquel plateado", "Plata de ley 925",
               "Madera de granadillo / ébano", "Madera de mopane", "Latón lacado amarillo",
               "Latón lacado negro", "Caña natural (quena / zampoña)", "Resina (ocarina)"]
  },

  color_producto: {
    tipo: "imagen",
    requerido: true,
    nota: "El vendedor sube foto real del instrumento. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Plateado / Silver", "Dorado / Gold lacado", "Negro lacado",
      "Níquel mate", "Plata 925 (profesional)", "Madera ébano natural",
      "Madera granadillo", "Rojo (ABS escolar)", "Verde (ABS escolar)",
      "Natural caña (quena)", "Multicolor (ocarina)"
    ]
  },

  tonalidad: {
    tipo: "texto",
    requerido: false,
    opciones: ["C / Do", "D / Re", "E / Mi", "F / Fa", "G / Sol", "Bb / Si bemol", "Eb / Mi bemol", "Set varias tonalidades"]
  },

  nivel: {
    tipo: "texto",
    requerido: false,
    opciones: ["Principiante / Escolar", "Estudio / Intermedio", "Semiprofesional", "Profesional / Concierto"]
  },

  marca: {
    tipo: "texto",
    requerido: true,
    opciones: ["Yamaha YFL-222 / 577 / 677 (flauta)", "Pearl 505 / 665 / 795 (flauta)",
               "Buffet Crampon R13 / E11 (clarinete)", "Yamaha YCL-255 / 450 (clarinete)",
               "Yamaha YAS-280 / 62 / 875EX (saxo alto)", "Selmer Paris Serie III / Série II (saxo)",
               "Yanagisawa AWO10 / AWO20 (saxo)", "Jupiter JAS-500 / 1100", "Rico Royal / Vandoren (cañas)",
               "Navarrete / Mapale (quena / zampoña LATAM)", "Genérico"]
  },

  incluye: {
    tipo: "texto",
    requerido: false,
    opciones: ["Solo instrumento", "Con boquilla / embocadura", "Con estuche / funda", "Kit completo (instrumento + accesorios)"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
