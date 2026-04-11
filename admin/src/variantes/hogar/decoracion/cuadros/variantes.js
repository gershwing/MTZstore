/**
 * VARIANTES - Hogar y Cocina > Decoración > Cuadros
 *
 * tipo: "imagen" → selector con foto del producto (estilo AliExpress)
 * tipo: "texto"  → selector de chips / botones de texto
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },


  tipo: {
    tipo: "texto",
    opciones: ["Lienzo/Canvas", "Impresión enmarcada", "Set de cuadros", "Póster", "Fotografía artística", "Pintura original", "Metal wall art"]
  },

  tamano: {
    tipo: "texto",
    opciones: ["20×30 cm", "30×40 cm", "40×50 cm", "50×70 cm", "60×80 cm", "80×120 cm", "100×150 cm", "Personalizado"]
  },

  estilo_tematica: {
    tipo: "texto",
    opciones: ["Abstracto", "Paisaje", "Minimalista", "Moderno", "Botánico", "Retrato", "Geométrico", "Fotográfico", "Vintage"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Tonos neutros", "Blanco y negro", "Colores vivos", "Tonos tierra", "Tonos azules", "Verdes naturales", "Rosas"]
  },

  marco: {
    tipo: "texto",
    opciones: ["Sin marco", "Marco negro", "Marco blanco", "Marco madera natural", "Marco dorado", "Marco flotante"]
  },

  incluye_gancho: {
    tipo: "texto",
    opciones: ["Sí", "No"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
