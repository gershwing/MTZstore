/**
 * VARIANTES - Electrónica > Celulares > Tecno
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

    "Tecno Spark 20C": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Profundo", "Verde", "Blanco"] },
      ram: { tipo: "texto", opciones: ["4 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB"] },
    },

    "Tecno Spark 20": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Ombre", "Verde", "Dorado Blanco"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Tecno Spark 20 Pro": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Violeta", "Gris"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Tecno Spark 20 Pro+": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Verde Claro", "Dorado"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Tecno Spark Go 2024": {
      colores: { tipo: "imagen", opciones: ["Blanco Misterio", "Dorado Alpenglow", "Magic Skin", "Negro Gravedad"] },
      ram: { tipo: "texto", opciones: ["4 GB", "6 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB"] },
    },

    "Tecno Spark Go 1": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul", "Blanco"] },
      ram: { tipo: "texto", opciones: ["3 GB", "4 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB"] },
    },

    "Tecno Spark Go 1S": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul Cielo", "Blanco"] },
      ram: { tipo: "texto", opciones: ["3 GB", "4 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB"] },
    },

    "Tecno Spark 30C": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul", "Plata"] },
      ram: { tipo: "texto", opciones: ["4 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Tecno Spark 30": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Gris", "Dorado"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Tecno Spark 30 Pro": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Plata", "Azul Cielo"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Tecno Spark 40C": {
      colores: { tipo: "imagen", opciones: ["Negro Tinta", "Gris Titanio", "Blanco Velo", "Azul Espejismo"] },
      ram: { tipo: "texto", opciones: ["4 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB"] },
    },

    "Tecno Spark 40 4G": {
      colores: { tipo: "imagen", opciones: ["Negro Tinta", "Gris Titanio", "Blanco Velo", "Azul Espejismo", "Naranja Sol"] },
      ram: { tipo: "texto", opciones: ["4 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Tecno Spark 40 Pro": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Verde", "Plata"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Tecno Spark 40 Pro+": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul Cielo", "Gris"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Tecno Camon 30": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul", "Gris"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Tecno Camon 30 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Gris"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Tecno Camon 30 Pro 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde Oliva", "Azul"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Tecno Camon 30 Premier 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Dorado Champán", "Verde Esmeralda"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["512 GB"] },
    },

    "Tecno Camon 30S": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Plata", "Azul"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Tecno Camon 30S Pro": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Plata"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Tecno Camon 40 4G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Plata", "Azul Cielo"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Tecno Camon 40 Pro 4G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde Jade", "Gris", "Azul"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Tecno Camon 40 Pro 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde Jade", "Plata", "Violeta"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Tecno Camon 40 Premier 5G": {
      colores: { tipo: "imagen", opciones: ["Negro Galaxia", "Verde Lago Esmeralda"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Tecno Pova 6 Neo": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Plata", "Azul"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Tecno Pova 6": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Plata"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Tecno Pova 6 Pro 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul Hielo"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Tecno Pova 6 Neo 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul", "Plata"] },
      ram: { tipo: "texto", opciones: ["4 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Tecno Pova 7 4G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul", "Plata"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Tecno Pova 7 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul", "Plata"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Tecno Pova 7 Pro 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Tecno Pova 7 Ultra 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Naranja Gaming"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Tecno Pova Curve 2 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul Cielo", "Plata"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Tecno Pop 9 4G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Verde", "Blanco"] },
      ram: { tipo: "texto", opciones: ["2 GB", "3 GB", "4 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB"] },
    },

    "Tecno Pop 9 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul", "Gris"] },
      ram: { tipo: "texto", opciones: ["4 GB", "6 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB"] },
    },

    "Tecno Phantom V Flip2 5G": {
      colores: { tipo: "imagen", opciones: ["Verde Travertino", "Gris Polvo de Luna"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Tecno Phantom V Fold2 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Dorado", "Verde"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["512 GB"] },
    },

  }

}; // fin variantes

export function getAtributos() { return variantes; }
export function getVariantesModelo(nombre) { return variantes.modelos[nombre] ?? null; }
export function getListaModelos() { return Object.keys(variantes.modelos); }
