/**
 * VARIANTES - Arte y Manualidades > Manualidades > Resina y Moldes
 * Ruta: admin/src/variantes/arte-manualidades/manualidades/resina-moldes/variantes.js
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
    opciones: ["Resina epoxi (kit A+B)", "Resina UV (curable con lámpara UV)", "Resina de poliéster",
               "Pigmento para resina (líquido)", "Pigmento para resina (polvo / mica)", "Pigmento metálico (resina)",
               "Molde de silicona (figura / joya)", "Molde de silicona (geométrico)", "Molde de silicona (bandeja / posavasos)",
               "Desmoldante en spray", "Lámpara UV (curado resina)", "Láminas de oro / plata (hoja)",
               "Flores secas para resina", "Inclusiones / decoraciones para resina", "Tazas mezcladoras (set)",
               "Espátulas de silicona (set)", "Guantes de nitrilo (caja)", "Máscara FFP2 (resina)"]
  },

  color_pigmento: {
    tipo: "imagen",
    nota: "El vendedor sube foto del color / efecto real del pigmento. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Pigmento transparente (sin color)", "Pigmento blanco opaco",
      "Pigmento negro", "Pigmento amarillo", "Pigmento naranja",
      "Pigmento rojo", "Pigmento rosa", "Pigmento violeta",
      "Pigmento azul ultramar", "Pigmento azul cobalto",
      "Pigmento verde", "Pigmento turquesa",
      "Mica dorada (metálica)", "Mica plateada (metálica)",
      "Mica cobre (metálica)", "Mica rosa gold (metálica)",
      "Mica azul / verde iridiscente", "Mica blanco perla",
      "Efecto mármol (set pigmentos)", "Efecto océano (set azules)",
      "Set pigmentos 6 colores básicos", "Set pigmentos 12 colores",
      "Set micas metálicas (set 10 colores)"
    ]
  },

  volumen_kit: {
    tipo: "texto",
    opciones: ["50 ml + 50 ml (kit mini)", "100 ml + 100 ml", "250 ml + 250 ml",
               "500 ml + 500 ml", "1 L + 1 L", "2 L + 2 L", "5 L + 5 L (profesional)",
               "10 ml (pigmento)", "20 ml", "50 ml", "100 g (mica / polvo)"]
  },

  ratio_mezcla: {
    tipo: "texto",
    opciones: ["1:1 (igual partes A y B)", "2:1", "3:1", "4:1", "1:2", "UV (solo componente — sin mezcla)"]
  },

  tiempo_curado: {
    tipo: "texto",
    opciones: ["UV: 1–3 min (lámpara UV)", "Epoxi: 24 h (desmolde) + 72 h (curado completo)",
               "Epoxi rápido: 30–60 min gel + 12 h desmolde", "Poliéster: 15–30 min"]
  },

  marca: {
    tipo: "texto",
    opciones: ["ArtResin (epoxi art grade)", "Alumilite (epoxi / moldes)", "Castin' Craft (poliéster)",
               "UV Resin (Padico / Kiyohara)", "Colour Mill (pigmento)", "Unicone Art (pigmento mica)",
               "Alumilite Amazing Mold Rubber", "Smooth-On (silicona moldes)", "Resina generica nacional", "Cristal (resina LATAM)", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
