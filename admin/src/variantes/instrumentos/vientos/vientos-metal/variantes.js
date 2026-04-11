/**
 * VARIANTES - Instrumentos > Vientos > Vientos Metal
 * Ruta: admin/src/variantes/instrumentos/vientos/vientos-metal/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar en: colores / acabados de cuerpo, diseños de funda,
 *                  colores de batería — el músico compra por lo que ve.
 * tipo: "texto"  → selector de chips para especificaciones técnicas:
 *                  número de cuerdas, teclas, tallas, materiales, potencia.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: ["Trompeta en Si bemol (Bb)", "Trompeta de bolsillo (pocket trumpet)",
               "Trompeta de piccolo", "Corneta", "Trombón de varas tenor", "Trombón bajo",
               "Trombón de pistones", "Tuba", "Tuba eufonio / Eufonio",
               "Corno francés (F / Bb doble)", "Flugelhorn / Fliscorno", "Helicón",
               "Fiscorno / Bugle"]
  },

  acabado_campana: {
    tipo: "imagen",
    requerido: true,
    nota: "El vendedor sube foto real del instrumento. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Lacado amarillo (brass gold)", "Lacado amarillo brillante (ultra gloss)",
      "Plateado (silver plate)", "Niquelado (nickel plate)",
      "Lacado negro", "Lacado rojo (limited edition)",
      "Sin lacado (raw brass / vintage patina)",
      "Plateado + campana dorada (two-tone)",
      "Cobre + latón (gold + copper bell)"
    ]
  },

  material_cuerpo: {
    tipo: "texto",
    requerido: false,
    opciones: ["Latón amarillo", "Latón rojo (rose brass)", "Cobre", "Plata de ley",
               "Níquel plateado", "Latón fosforoso"]
  },

  numero_pistones_varas: {
    tipo: "texto",
    requerido: false,
    opciones: ["3 pistones (estándar)", "4 pistones (registro extendido)",
               "1 vara (trombón tenor)", "2 varas (trombón doble)", "Rotary (corno / válvulas)"]
  },

  nivel: {
    tipo: "texto",
    requerido: false,
    opciones: ["Principiante / Escolar", "Estudio / Intermedio", "Semiprofesional", "Profesional / Orquesta"]
  },

  marca: {
    tipo: "texto",
    requerido: true,
    opciones: ["Bach Stradivarius 180ML / 43 (trompeta)", "Yamaha YTR-2330 / 6335 / 8335 (trompeta)",
               "Jupiter JTR-500 / 1100 (trompeta)", "King 2055T / 3B (trombón)", "Conn 88H / 12H (trombón)",
               "Yamaha YSL-354 / 881 (trombón)", "Holton Farkas / TR-158 (corno)",
               "Miraphone 186 (tuba)", "Besson Prestige (eufonio)", "Genérico"]
  },

  incluye: {
    tipo: "texto",
    requerido: false,
    opciones: ["Solo instrumento", "Con boquilla estándar", "Con estuche rígido", "Kit completo (instrumento + boquilla + estuche)"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
