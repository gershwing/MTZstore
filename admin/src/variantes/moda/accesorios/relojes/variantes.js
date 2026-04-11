/**
 * VARIANTES - Moda > Accesorios > Relojes
 *
 * tipo: "imagen" → selector con foto del producto (estilo AliExpress)
 * tipo: "texto"  → selector de chips / botones de texto
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo", "De retorno"]
  },


  tipo: {
    tipo: "texto",
    opciones: ["Analógico clásico", "Digital", "Smartwatch", "Cronógrafo", "Automático/Mecánico", "Deportivo"]
  },

  material_correa: {
    tipo: "texto",
    opciones: ["Acero inoxidable", "Cuero genuino", "Cuero sintético", "Silicona/Caucho", "Nylon/NATO", "Titanio", "Cerámica"]
  },

  color_caja: {
    tipo: "imagen",
    opciones: ["Plateado", "Dorado", "Oro Rosa", "Negro", "Azul", "Gunmetal"]
  },

  genero: {
    tipo: "texto",
    opciones: ["Hombre", "Mujer", "Unisex"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Casio", "Citizen", "Seiko", "Fossil", "Michael Kors", "Tommy Hilfiger", "Guess", "Swatch", "Apple Watch", "Samsung Galaxy Watch", "Garmin", "Amazfit"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
