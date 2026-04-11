/**
 * VARIANTES - Hogar y Cocina > Muebles > Camas
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


  tamano: {
    tipo: "texto",
    opciones: ["Individual (90×190)", "Semi doble (105×190)", "Doble (135×190)", "Queen (150×200)", "King (180×200)", "Super King (200×200)", "Litera individual"]
  },

  tipo_estructura: {
    tipo: "texto",
    opciones: ["Somier con patas", "Canapé/Box", "Plataforma", "Con cajones", "Litera", "Nido/Divan", "Cama alta"]
  },

  tipo_cabecera: {
    tipo: "texto",
    opciones: ["Tapizada", "Madera", "Metal", "Sin cabecera", "Capitoné", "Panel flotante"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Blanco", "Gris claro", "Gris oscuro", "Beige", "Negro", "Nogal", "Madera natural", "Azul petróleo", "Verde musgo", "Burdeos"]
  },

  material_estructura: {
    tipo: "texto",
    opciones: ["Madera maciza", "MDF/Melamina", "Metal", "Tapizado tela", "Tapizado cuero sintético", "Mixto madera+metal"]
  },

  incluye_colchon: {
    tipo: "texto",
    opciones: ["Sí", "No"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
