/**
 * VARIANTES - Hogar y Cocina > Cocina > Cafeteras
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
    opciones: ["Espresso manual", "Automática", "Cápsulas", "Goteo/Filtro", "Prensa francesa", "Moka/Italiana", "Cold Brew", "Pour Over"]
  },

  capacidad: {
    tipo: "texto",
    opciones: ["1 taza", "2 tazas", "4 tazas", "6 tazas", "8 tazas", "10 tazas", "12 tazas", "1 L", "1.5 L"]
  },

  marca_modelo: {
    tipo: "texto",
    opciones: ["Nespresso", "Dolce Gusto", "De'Longhi", "Breville", "Philips", "Oster", "Bialetti", "Bodum", "Hamilton Beach"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Inox", "Rojo", "Azul", "Beige", "Gris"]
  },

  con_molinillo: {
    tipo: "texto",
    opciones: ["Sí", "No"]
  },

  presion_bar: {
    tipo: "texto",
    opciones: ["N/A", "9 bar", "15 bar", "19 bar", "20 bar"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
