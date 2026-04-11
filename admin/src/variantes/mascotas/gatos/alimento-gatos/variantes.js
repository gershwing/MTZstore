/**
 * VARIANTES - Mascotas > Gatos > Alimento Gatos
 * Ruta: admin/src/variantes/mascotas/gatos/alimento-gatos/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del sabor/color/diseño es esencial.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Sellado de fabrica", "Fecha vigente"]
  },

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: ["Croqueta seca para gato", "Alimento húmedo en lata", "Alimento húmedo en sobre / pouch",
               "Alimento húmedo en tray / bandeja", "Alimento fresco refrigerado",
               "Alimento deshidratado / freeze-dried", "Dieta BARF felina (crudo congelado)",
               "Alimento para gatito / kitten", "Alimento para gato senior (7+ años)",
               "Alimento para gato castrado / esterilizado (control de peso)",
               "Alimento medicado / veterinario (urinary / renal / hairball)",
               "Alimento sin granos / grain-free", "Alimento hipoalergénico"]
  },

  sabor: {
    tipo: "imagen",
    nota: "El vendedor sube foto del empaque real por sabor. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Pollo", "Pollo + pavo", "Atún", "Salmón", "Salmón + trucha",
      "Pescado blanco", "Mariscos mix", "Vacuno", "Conejo",
      "Pato (grain-free)", "Venado (hipoalergénico)", "Mix sabores (pack variado)",
      "Pollo + arroz (urinary / sterilized)", "Sin cereales (solo proteína)"
    ]
  },

  etapa_vida: {
    tipo: "texto",
    opciones: ["Kitten / Gatito (< 1 año)", "Adulto (1–7 años)", "Senior (7+ años)", "Todas las etapas"]
  },

  peso_presentacion: {
    tipo: "texto",
    opciones: ["85 g (lata mini)", "150 g (lata)", "185 g (lata)", "400 g (lata grande)",
               "500 g (croqueta)", "1 kg", "1.5 kg", "2 kg", "3 kg", "4 kg", "6 kg", "10 kg",
               "Sobre 50–100 g", "Pack 12 sobres", "Pack 24 sobres"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Royal Canin (raza / etapa específica)", "Hills Science Diet / c/d (urinary)",
               "Purina Pro Plan / Fancy Feast / Friskies", "Orijen Cat & Kitten",
               "Blue Buffalo Wilderness (grain-free)", "Acana Regionals",
               "Whiskas (lata / sobre)", "Felix (PURINA)", "Sheba (sobre premium)",
               "Cat Chow", "Equilibrio Gatos (LATAM)", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
