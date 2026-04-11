/**
 * VARIANTES - Hogar y Cocina > Muebles > Sofás
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
    opciones: ["2 plazas", "3 plazas", "Seccional/L", "Seccional/U", "Sofá cama", "Reclinable", "Modular", "Chaise longue"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Gris claro", "Gris oscuro", "Beige", "Azul marino", "Verde oliva", "Marrón", "Negro", "Terracota", "Mostaza", "Blanco hueso", "Burdeos"]
  },

  material_tapizado: {
    tipo: "texto",
    opciones: ["Tela", "Cuero genuino", "Cuero sintético/PU", "Lino", "Terciopelo", "Microfibra", "Pana"]
  },

  relleno: {
    tipo: "texto",
    opciones: ["Espuma HD", "Espuma+pluma", "Resortes ensacados", "Viscoelástico", "Espuma convencional"]
  },

  patas: {
    tipo: "texto",
    opciones: ["Madera", "Metal negro", "Metal dorado", "Cromado", "Sin patas (piso)", "Plástico"]
  },

  medida_largo: {
    tipo: "texto",
    opciones: ["140 cm", "160 cm", "180 cm", "200 cm", "220 cm", "240 cm", "260 cm", "280+ cm"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
