/**
 * VARIANTES - Electrónica > Celulares > Apple
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

  version: {
    tipo: "texto",
    variante: true,
    opciones: ["2 eSIM", "1 eSIM + 1 SIM", "2 SIM"]
  },

  modelos: {

    "iPhone SE 2022": {
      colores: { tipo: "imagen", opciones: ["Medianoche", "Blanco Estelar", "Rojo"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB", "256 GB"] },
    },

    "iPhone 13 Mini": {
      colores: { tipo: "imagen", opciones: ["Medianoche", "Blanco Estelar", "Azul", "Rosa", "Rojo", "Verde Alpino"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB", "512 GB"] },
    },

    "iPhone 13": {
      colores: { tipo: "imagen", opciones: ["Medianoche", "Blanco Estelar", "Azul", "Rosa", "Rojo", "Verde Alpino"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB", "512 GB"] },
    },

    "iPhone 13 Pro": {
      colores: { tipo: "imagen", opciones: ["Grafito", "Oro", "Plata", "Azul Alpino", "Verde Alpino"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB", "512 GB", "1 TB"] },
    },

    "iPhone 13 Pro Max": {
      colores: { tipo: "imagen", opciones: ["Grafito", "Oro", "Plata", "Azul Alpino", "Verde Alpino"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB", "512 GB", "1 TB"] },
    },

    "iPhone 14": {
      colores: { tipo: "imagen", opciones: ["Medianoche", "Blanco Estelar", "Azul", "Púrpura", "Rojo", "Amarillo"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB", "512 GB"] },
    },

    "iPhone 14 Plus": {
      colores: { tipo: "imagen", opciones: ["Medianoche", "Blanco Estelar", "Azul", "Púrpura", "Rojo", "Amarillo"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB", "512 GB"] },
    },

    "iPhone 14 Pro": {
      colores: { tipo: "imagen", opciones: ["Negro Espacial", "Plata", "Oro", "Morado Oscuro"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB", "512 GB", "1 TB"] },
    },

    "iPhone 14 Pro Max": {
      colores: { tipo: "imagen", opciones: ["Negro Espacial", "Plata", "Oro", "Morado Oscuro"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB", "512 GB", "1 TB"] },
    },

    "iPhone 15": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Verde", "Amarillo", "Rosa"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB", "512 GB"] },
    },

    "iPhone 15 Plus": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Verde", "Amarillo", "Rosa"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB", "512 GB"] },
    },

    "iPhone 15 Pro": {
      colores: { tipo: "imagen", opciones: ["Titanio Negro", "Titanio Blanco", "Titanio Azul", "Titanio Natural"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB", "512 GB", "1 TB"] },
    },

    "iPhone 15 Pro Max": {
      colores: { tipo: "imagen", opciones: ["Titanio Negro", "Titanio Blanco", "Titanio Azul", "Titanio Natural"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "iPhone 16 E": {
      colores: { tipo: "imagen", opciones: ["Blanco", "Negro"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "iPhone 16": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco", "Rosa", "Verde Azulado", "Ultramar"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB", "512 GB"] },
    },

    "iPhone 16 Plus": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco", "Rosa", "Verde Azulado", "Ultramar"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB", "512 GB"] },
    },

    "iPhone 16 Pro": {
      colores: { tipo: "imagen", opciones: ["Titanio Negro", "Titanio Blanco", "Titanio Natural", "Titanio Desierto"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB", "512 GB", "1 TB"] },
    },

    "iPhone 16 Pro Max": {
      colores: { tipo: "imagen", opciones: ["Titanio Negro", "Titanio Blanco", "Titanio Natural", "Titanio Desierto"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "iPhone 17": {
      colores: { tipo: "imagen", opciones: ["Lavanda", "Verde Salvia", "Azul Neblina", "Blanco", "Negro"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "iPhone 17 Air": {
      colores: { tipo: "imagen", opciones: ["Negro", "Plata", "Azul Cielo", "Dorado"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "iPhone 17 Pro": {
      colores: { tipo: "imagen", opciones: ["Titanio Plata", "Azul Profundo", "Naranja Cósmico"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB", "2 TB"] },
    },

    "iPhone 17 Pro Max": {
      colores: { tipo: "imagen", opciones: ["Titanio Plata", "Azul Profundo", "Naranja Cósmico"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB", "2 TB"] },
    },

  }

}; // fin variantes

export function getAtributos() { return variantes; }
export function getVariantesModelo(nombre) { return variantes.modelos[nombre] ?? null; }
export function getListaModelos() { return Object.keys(variantes.modelos); }
