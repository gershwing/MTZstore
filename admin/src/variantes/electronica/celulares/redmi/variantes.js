/**
 * VARIANTES - Electrónica > Celulares > Redmi
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

    "Redmi A3": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Claro", "Dorado"] },
      ram: { tipo: "texto", opciones: ["3 GB", "4 GB", "6 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB"] },
    },

    "Redmi 13C": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Marino", "Verde Menta", "Dorado"] },
      ram: { tipo: "texto", opciones: ["4 GB", "6 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Redmi 14C": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Verde", "Dorado"] },
      ram: { tipo: "texto", opciones: ["4 GB", "6 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Redmi A4 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Claro"] },
      ram: { tipo: "texto", opciones: ["4 GB", "6 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB"] },
    },

    "Redmi Note 13 4G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Hielo", "Menta", "Verde"] },
      ram: { tipo: "texto", opciones: ["6 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Redmi Note 13 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Verde Aurora"] },
      ram: { tipo: "texto", opciones: ["6 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Redmi Note 13 Pro 4G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco", "Morado", "Verde"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Redmi Note 13 Pro 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco", "Morado Coral", "Verde Aurora"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Redmi Note 13 Pro+ 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco", "Morado Coral", "Fusión"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Redmi A5": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Claro", "Verde"] },
      ram: { tipo: "texto", opciones: ["3 GB", "4 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB"] },
    },

    "Redmi 13x": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Verde Menta"] },
      ram: { tipo: "texto", opciones: ["6 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Redmi 15C": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Verde"] },
      ram: { tipo: "texto", opciones: ["4 GB", "6 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Redmi Note 14 4G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Hielo", "Verde", "Morado"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Redmi Note 14 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Hielo", "Morado", "Verde"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Redmi Note 14 Pro 4G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Hielo", "Morado", "Plata"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Redmi Note 14 Pro 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Hielo", "Morado", "Plata"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Redmi Note 14 Pro+ 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Morado", "Plata"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Redmi Note 15 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Verde", "Plata"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Redmi Note 15 Pro 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Morado", "Plata"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Redmi Note 15 Pro+ 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Plata", "Morado"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Redmi Turbo 4 Pro": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco", "Azul"] },
      ram: { tipo: "texto", opciones: ["12 GB", "16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

  }

}; // fin variantes

export function getAtributos() { return variantes; }
export function getVariantesModelo(nombre) { return variantes.modelos[nombre] ?? null; }
export function getListaModelos() { return Object.keys(variantes.modelos); }
