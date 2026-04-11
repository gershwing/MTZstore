/**
 * VARIANTES - Mascotas > Acuarios > Equipamiento Acuario
 * Ruta: admin/src/variantes/mascotas/acuarios/equipamiento-acuario/variantes.js
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
    opciones: ["Nuevo"]
  },

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: ["Acuario nano (10–20 L)", "Acuario mediano (40–80 L)", "Acuario grande (100–200 L)",
               "Acuario XL (250–500 L)", "Acuario marino / reef kit", "Kit acuario completo (todo incluido)",
               "Filtro interno / sumergible", "Filtro externo / canister", "Filtro HOB (hang on back)",
               "Skimmer proteico (marino)", "Calentador / Termocalefactor",
               "Enfriador / Chiller para acuario", "Iluminación LED para plantado",
               "Iluminación LED marino (reef)", "Bomba de circulación / power head",
               "Difusor de CO2 (planted tank)", "Regulador CO2 + botella",
               "Raspador / limpiavidrios magnético", "Sifón / aspiradora de fondo",
               "Tapa / cubierta de acuario", "Mueble / Mesa para acuario"]
  },

  capacidad_litros: {
    tipo: "texto",
    opciones: ["Hasta 20 L (nano)", "20–40 L", "40–80 L", "80–120 L", "120–200 L", "200–350 L", "350 L+"]
  },

  voltaje: {
    tipo: "texto",
    opciones: ["12V DC", "110V", "220V", "12V / 220V (adaptable)"]
  },

  color_producto: {
    tipo: "imagen",
    nota: "El vendedor sube foto real del equipo / acuario. El cliente elige la imagen en el client.",
    guia_vendedor: ["Acuario transparente solo", "Kit acuario con mueble negro",
                    "Kit acuario con mueble blanco", "Filtro negro (ver foto)",
                    "Calentador (ver foto)", "Lámpara LED (ver foto)",
                    "Acuario marino completo (ver foto)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Fluval (acuarios + filtros)", "Juwel (acuarios + iluminación)", "Eheim (filtros + calentadores)",
               "AquaEl (acuarios nano / kits)", "API Filstar (filtro)", "Hydor Koralia (bomba circulación)",
               "Tunze (marino / reef)", "Kessil (iluminación reef)", "CO2 Art (CO2 plantado)",
               "Seachem Tidal (HOB)", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
