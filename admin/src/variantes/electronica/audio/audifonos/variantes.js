/**
 * VARIANTES - Electrónica > Audio > Audífonos
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


  tipo: {
    tipo: "texto",
    opciones: ["TWS In-ear (True Wireless)", "On-ear Bluetooth", "Over-ear Bluetooth", "Over-ear con cable", "In-ear deportivos", "Gaming Headset"]
  },

  cancelacion_ruido: {
    tipo: "texto",
    opciones: ["Sin ANC", "ANC básico", "ANC avanzado (Pro)", "ANC adaptativo"]
  },

  marca_modelo: {
    tipo: "texto",
    opciones: ["Sony WF-1000XM5", "Sony WH-1000XM5", "Sony WF-C700N", "Apple AirPods 4", "Apple AirPods Pro 2", "Apple AirPods Max", "Samsung Galaxy Buds3", "Samsung Galaxy Buds3 Pro", "Bose QC Ultra Earbuds", "Bose QC45", "JBL Live Pro 2", "JBL Quantum", "Jabra Elite 10", "Anker Soundcore Liberty 4", "Sennheiser Momentum 4", "HyperX Cloud III", "Logitech G Pro X 2", "SteelSeries Arctis Nova Pro", "Razer BlackShark V2"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Plata", "Azul", "Beige", "Verde", "Rosa"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
