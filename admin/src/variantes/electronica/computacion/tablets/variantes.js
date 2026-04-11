/**
 * VARIANTES - Electrónica > Computación > Tablets
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

    "Samsung Tab S9 11 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Grafito", "Beige", "Verde Menta"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      conectividad: { tipo: "texto", opciones: ["Wi-Fi", "5G"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Samsung Tab S9+ 12.4 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Grafito", "Beige"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      conectividad: { tipo: "texto", opciones: ["Wi-Fi", "5G"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Samsung Tab S9 Ultra 14.6 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Grafito"] },
      ram: { tipo: "texto", opciones: ["12 GB", "16 GB"] },
      conectividad: { tipo: "texto", opciones: ["Wi-Fi", "5G"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "Samsung Tab S9 FE 10.9 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Verde", "Lavanda", "Plateado", "Grafito"] },
      ram: { tipo: "texto", opciones: ["6 GB", "8 GB"] },
      conectividad: { tipo: "texto", opciones: ["Wi-Fi", "5G"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Samsung Tab S10 11 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Grafito", "Azul", "Plateado"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      conectividad: { tipo: "texto", opciones: ["Wi-Fi", "5G"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Samsung Tab S10+ 12.4 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Grafito", "Plateado"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      conectividad: { tipo: "texto", opciones: ["Wi-Fi", "5G"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Samsung Tab S10 Ultra 14.6 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Grafito"] },
      ram: { tipo: "texto", opciones: ["12 GB", "16 GB"] },
      conectividad: { tipo: "texto", opciones: ["Wi-Fi", "5G"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "Xiaomi Pad 6 11 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Champan", "Gris", "Azul Mist"] },
      ram: { tipo: "texto", opciones: ["6 GB", "8 GB"] },
      conectividad: { tipo: "texto", opciones: ["Wi-Fi"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Xiaomi Pad 6s Pro 12.4 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Gris", "Negro", "Blanco"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      conectividad: { tipo: "texto", opciones: ["Wi-Fi", "5G"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Redmi Pad Pro 12.1 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Gris", "Verde", "Azul"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      conectividad: { tipo: "texto", opciones: ["Wi-Fi", "5G"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Huawei MatePad 11.5 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Gris espacial", "Blanco"] },
      ram: { tipo: "texto", opciones: ["6 GB", "8 GB"] },
      conectividad: { tipo: "texto", opciones: ["Wi-Fi", "LTE"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

  }

}; // fin variantes

export function getAtributos() { return variantes; }
export function getVariantesModelo(nombre) { return variantes.modelos[nombre] ?? null; }
export function getListaModelos() { return Object.keys(variantes.modelos); }
