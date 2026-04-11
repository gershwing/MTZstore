/**
 * VARIANTES - Electrónica > Accesorios Celulares > Powerbanks
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


  capacidad: {
    tipo: "texto",
    opciones: ["5000 mAh", "8000 mAh", "10000 mAh", "12000 mAh", "15000 mAh", "20000 mAh", "25000 mAh", "30000 mAh"]
  },

  potencia_carga: {
    tipo: "texto",
    opciones: ["15W", "18W", "20W", "22.5W", "25W", "30W", "45W", "65W", "100W", "120W+"]
  },

  puertos: {
    tipo: "texto",
    opciones: ["1x USB-A", "1x USB-C", "USB-A + USB-C", "2x USB-C + USB-A", "Con carga inalámbrica Qi", "Con MagSafe 15W"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Azul", "Verde", "Rosa", "Plateado"]
  },

  formato: {
    tipo: "texto",
    opciones: ["Slim delgado", "Estándar", "Compacto mini", "Solar"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
