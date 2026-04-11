/**
 * VARIANTES - Electrónica > Componentes > Fuentes de Poder
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


  potencia: {
    tipo: "texto",
    opciones: ["450W", "550W", "650W", "750W", "850W", "1000W", "1200W", "1600W"]
  },

  certificacion: {
    tipo: "texto",
    opciones: ["80+ White", "80+ Bronze", "80+ Silver", "80+ Gold", "80+ Platinum", "80+ Titanium"]
  },

  modularidad: {
    tipo: "texto",
    opciones: ["No modular", "Semi modular", "Full modular"]
  },

  conector_pcie: {
    tipo: "texto",
    opciones: ["6+2 pin PCIe", "8 pin PCIe (2x)", "16 pin PCIe 5.0 (600W)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Corsair", "EVGA SuperNOVA", "Seasonic Focus", "be quiet!", "Fractal Ion", "Cooler Master", "NZXT"]
  },

  color: {
    tipo: "imagen",
    guia_vendedor: ["Negro", "Negro / Rojo", "Negro / Verde", "Blanco"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
