/**
 * VARIANTES - Electrónica > Computación > MacBooks
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

    "MacBook Air M1 13 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Plata", "Gris espacial", "Oro"] },
      ram: { tipo: "texto", opciones: ["8 GB", "16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB", "2 TB"] },
    },

    "MacBook Air M2 13 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Medianoche", "Blanco estelar", "Plata", "Azul cielo"] },
      ram: { tipo: "texto", opciones: ["8 GB", "16 GB", "24 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB", "2 TB"] },
    },

    "MacBook Air M2 15 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Medianoche", "Blanco estelar", "Plata", "Azul cielo"] },
      ram: { tipo: "texto", opciones: ["8 GB", "16 GB", "24 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB", "2 TB"] },
    },

    "MacBook Air M3 13 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Medianoche", "Blanco estelar", "Plata", "Azul cielo"] },
      ram: { tipo: "texto", opciones: ["8 GB", "16 GB", "24 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB", "2 TB"] },
    },

    "MacBook Air M3 15 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Medianoche", "Blanco estelar", "Plata", "Azul cielo"] },
      ram: { tipo: "texto", opciones: ["8 GB", "16 GB", "24 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB", "2 TB"] },
    },

    "MacBook Air M4 13 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Medianoche", "Blanco estelar", "Plata", "Azul cielo", "Rojo"] },
      ram: { tipo: "texto", opciones: ["16 GB", "32 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB", "2 TB"] },
    },

    "MacBook Air M4 15 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Medianoche", "Blanco estelar", "Plata", "Azul cielo", "Rojo"] },
      ram: { tipo: "texto", opciones: ["16 GB", "32 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB", "2 TB"] },
    },

    "MacBook Pro M3 14 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Negro espacial", "Plata"] },
      ram: { tipo: "texto", opciones: ["8 GB", "16 GB", "36 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["512 GB", "1 TB", "2 TB", "4 TB"] },
    },

    "MacBook Pro M3 16 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Negro espacial", "Plata"] },
      ram: { tipo: "texto", opciones: ["18 GB", "36 GB", "48 GB", "128 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"] },
    },

    "MacBook Pro M4 14 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Negro espacial", "Plata"] },
      ram: { tipo: "texto", opciones: ["16 GB", "24 GB", "32 GB", "64 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["512 GB", "1 TB", "2 TB", "4 TB"] },
    },

    "MacBook Pro M4 Pro 14 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Negro espacial", "Plata"] },
      ram: { tipo: "texto", opciones: ["24 GB", "48 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["512 GB", "1 TB", "2 TB", "4 TB"] },
    },

    "MacBook Pro M4 Pro 16 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Negro espacial", "Plata"] },
      ram: { tipo: "texto", opciones: ["24 GB", "48 GB", "64 GB", "128 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"] },
    },

    "MacBook Air M5 13 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Azul Cielo", "Medianoche", "Blanco Estelar", "Plata"] },
      ram: { tipo: "texto", opciones: ["16 GB", "32 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["512 GB", "1 TB", "2 TB", "4 TB"] },
    },

    "MacBook Air M5 15 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Azul Cielo", "Medianoche", "Blanco Estelar", "Plata"] },
      ram: { tipo: "texto", opciones: ["16 GB", "32 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["512 GB", "1 TB", "2 TB", "4 TB"] },
    },

    "MacBook Pro M5 14 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Negro Espacial", "Plata"] },
      ram: { tipo: "texto", opciones: ["16 GB", "24 GB", "32 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["1 TB", "2 TB", "4 TB", "8 TB"] },
    },

    "MacBook Pro M5 Pro 14 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Negro Espacial", "Plata"] },
      ram: { tipo: "texto", opciones: ["24 GB", "36 GB", "48 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["1 TB", "2 TB", "4 TB", "8 TB"] },
    },

    "MacBook Pro M5 Max 14 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Negro Espacial", "Plata"] },
      ram: { tipo: "texto", opciones: ["36 GB", "48 GB", "64 GB", "96 GB", "128 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["2 TB", "4 TB", "8 TB"] },
    },

    "MacBook Pro M5 Pro 16 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Negro Espacial", "Plata"] },
      ram: { tipo: "texto", opciones: ["24 GB", "36 GB", "48 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["1 TB", "2 TB", "4 TB", "8 TB"] },
    },

    "MacBook Pro M5 Max 16 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Negro Espacial", "Plata"] },
      ram: { tipo: "texto", opciones: ["36 GB", "48 GB", "64 GB", "96 GB", "128 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["2 TB", "4 TB", "8 TB"] },
    },

  }

}; // fin variantes

export function getAtributos() { return variantes; }
export function getVariantesModelo(nombre) { return variantes.modelos[nombre] ?? null; }
export function getListaModelos() { return Object.keys(variantes.modelos); }
