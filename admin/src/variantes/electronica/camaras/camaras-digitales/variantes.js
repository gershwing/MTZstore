/**
 * VARIANTES - Electrónica > Cámaras > Cámaras Digitales
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


  tipo_camara: {
    tipo: "texto",
    opciones: ["Mirrorless Full Frame", "Mirrorless APS-C", "DSLR Full Frame", "DSLR APS-C", "Compacta premium"]
  },

  marca_modelo: {
    tipo: "texto",
    opciones: ["Sony A7 IV", "Sony A7C II", "Sony A6700", "Sony ZV-E10 II", "Canon EOS R6 II", "Canon EOS R8", "Canon EOS R50", "Canon EOS R100", "Nikon Z6 III", "Nikon Z50 II", "Fujifilm X-T5", "Fujifilm X100VI", "OM System OM-5", "Panasonic S5 II", "Sony RX100 VII"]
  },

  kit: {
    tipo: "texto",
    opciones: ["Solo cuerpo (body only)", "Kit con lente 28-70mm", "Kit con lente 16-50mm", "Kit doble lente"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Plata/Negro", "Negro mate"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
