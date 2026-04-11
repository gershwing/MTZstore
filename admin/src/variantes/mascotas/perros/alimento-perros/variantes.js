/**
 * VARIANTES - Mascotas > Perros > Alimento Perros
 * Ruta: admin/src/variantes/mascotas/perros/alimento-perros/variantes.js
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
    opciones: ["Croqueta / Kibble seco", "Alimento húmedo en lata", "Alimento húmedo en sobre / pouch",
               "Alimento fresco refrigerado", "Alimento deshidratado / freeze-dried",
               "Dieta BARF (crudo congelado)", "Alimento senior", "Alimento cachorro",
               "Alimento para raza pequeña", "Alimento para raza grande",
               "Alimento medicado / veterinario (prescripción)", "Alimento sin granos / grain-free",
               "Alimento hipoalergénico (proteína hidrolizada)"]
  },

  sabor: {
    tipo: "imagen",
    nota: "El vendedor sube foto del empaque real por sabor. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Pollo", "Pollo + arroz", "Vacuno / Res", "Vacuno + vegetales",
      "Cordero + arroz", "Salmón + papa", "Pavo + boniato",
      "Mixto / Variado", "Pato + guisante (grain-free)",
      "Venado + garbanzo (hipoalergénico)", "Hígado", "Sin saborizante (neutro)"
    ]
  },

  etapa_vida: {
    tipo: "texto",
    opciones: ["Cachorro (< 1 año)", "Adulto (1–7 años)", "Senior (7+ años)", "Todas las etapas"]
  },

  tamano_raza: {
    tipo: "texto",
    opciones: ["Razas miniatura (< 5 kg)", "Razas pequeñas (5–10 kg)", "Razas medianas (10–25 kg)",
               "Razas grandes (25–45 kg)", "Razas gigantes (45 kg+)", "Todas las razas"]
  },

  peso_presentacion: {
    tipo: "texto",
    opciones: ["500 g", "1 kg", "1.5 kg", "2 kg", "3 kg", "4 kg", "6 kg", "8 kg", "10 kg",
               "15 kg", "20 kg", "25 kg", "Lata 400 g", "Sobre 100–150 g", "Tray 300 g"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Royal Canin (raza específica)", "Hills Science Diet / Prescription Diet",
               "Purina Pro Plan / ONE / Beneful", "Eukanuba", "Orijen / Acana (grain-free)",
               "Blue Buffalo Wilderness", "Taste of the Wild", "Merrick Grain Free",
               "Pedigree / Whiskas (Nestlé Purina)", "Natural Balance", "Equilibrio (LATAM)",
               "Dog Chow / Cat Chow", "Genérico / Sin marca"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
