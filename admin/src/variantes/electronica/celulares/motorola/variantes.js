/**
 * VARIANTES - Electrónica > Celulares > Motorola
 *
 * tipo: "imagen" → selector con foto del producto (estilo AliExpress)
 * tipo: "texto"  → selector de chips / botones de texto
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo", "Usado", "Reacondicionado", "Caja Abierta"]
  },

  modelos: {

    "Moto G04": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Verde"] },
      ram: { tipo: "texto", opciones: ["4 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB"] },
    },

    "Moto G04s": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Plata"] },
      ram: { tipo: "texto", opciones: ["4 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB"] },
    },

    "Moto G05": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul", "Gris"] },
      ram: { tipo: "texto", opciones: ["4 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB"] },
    },

    "Moto G06": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul"] },
      ram: { tipo: "texto", opciones: ["4 GB", "6 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB"] },
    },

    "Moto G06 Power": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Plata"] },
      ram: { tipo: "texto", opciones: ["4 GB", "6 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB"] },
    },

    "Moto G15": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Hielo", "Verde", "Gris"] },
      ram: { tipo: "texto", opciones: ["4 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Moto G24": {
      colores: { tipo: "imagen", opciones: ["Negro Hielo", "Azul Hielo", "Rosa Lavanda"] },
      ram: { tipo: "texto", opciones: ["4 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Moto G24 Power": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Verde"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Moto G35 5G": {
      colores: { tipo: "imagen", opciones: ["Negro Medianoche", "Verde Mar", "Gris Pizarra"] },
      ram: { tipo: "texto", opciones: ["4 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Moto G45 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul", "Melocotón"] },
      ram: { tipo: "texto", opciones: ["4 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Moto G55 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Pantone", "Verde"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Moto G56 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Hielo", "Verde"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Moto G57 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Verde", "Gris"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Moto G57 Power 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul", "Pantone"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Moto G64 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Hielo", "Verde", "Gris"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Moto G67 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Pantone", "Verde", "Gris"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Moto G67 Power 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul", "Pantone"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Moto G75 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul Hielo", "Gris"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Moto G85 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde Oliva", "Azul Zafiro", "Gris"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Moto G86 5G": {
      colores: { tipo: "imagen", opciones: ["Dorado", "Cósmico", "Rojo", "Hechizante"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Moto G86 Power 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Verde", "Pantone"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Moto G96 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Verde", "Pantone"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Motorola Edge 50 Fusion": {
      colores: { tipo: "imagen", opciones: ["Azul Bosque", "Rosa Hot", "Azul Marshmallow", "Pantone Koala Grey"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB", "512 GB"] },
    },

    "Motorola Edge 50": {
      colores: { tipo: "imagen", opciones: ["Azul Medianoche"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Motorola Edge 50 Pro": {
      colores: { tipo: "imagen", opciones: ["Negro", "Lavanda", "Verde"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Motorola Edge 50 Ultra": {
      colores: { tipo: "imagen", opciones: ["Madera de Abedul", "Cuero Morado", "Blanco Titanio"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["512 GB"] },
    },

    "Motorola Edge 50 Neo": {
      colores: { tipo: "imagen", opciones: ["Negro Medianoche", "Azul Hielo", "Pantone Peach Fuzz", "Pantone Latté"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Motorola Edge 60 Fusion": {
      colores: { tipo: "imagen", opciones: ["Azul Pantone", "Gris", "Verde", "Violeta"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Motorola Edge 60 Stylus": {
      colores: { tipo: "imagen", opciones: ["Pantone Surf the Web", "Pantone Gibraltar Sea"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Motorola Edge 60": {
      colores: { tipo: "imagen", opciones: ["Azul", "Verde", "Pantone", "Gris"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Motorola Edge 60 Pro": {
      colores: { tipo: "imagen", opciones: ["Pantone Dazzling Blue", "Uva Chispeante", "Sombra"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Motorola Razr 2024": {
      colores: { tipo: "imagen", opciones: ["Arena del Sahara", "Negro Medianoche", "Lila Estelar", "Verde Menta"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Motorola Razr Plus 2024": {
      colores: { tipo: "imagen", opciones: ["Negro Medianoche", "Gris Arenoso", "Azul Atardecer", "Rosa Peonía"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Motorola Razr 2025": {
      colores: { tipo: "imagen", opciones: ["PANTONE Azul Rio", "PANTONE Escarabajo", "PANTONE Senda Montaña", "PANTONE Cabaret"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Motorola Razr Plus 2025": {
      colores: { tipo: "imagen", opciones: ["Negro Grafito", "Azul Hielo", "Verde Bosque", "Lila"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Motorola Razr Ultra 2025": {
      colores: { tipo: "imagen", opciones: ["PANTONE Rojo Rio Alcantara", "PANTONE Escarabajo Alcantara", "PANTONE Senda Madera", "PANTONE Cabaret"] },
      ram: { tipo: "texto", opciones: ["16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["512 GB", "1 TB"] },
    },

  }

}; // fin variantes

export function getAtributos() { return variantes; }
export function getVariantesModelo(nombre) { return variantes.modelos[nombre] ?? null; }
export function getListaModelos() { return Object.keys(variantes.modelos); }
