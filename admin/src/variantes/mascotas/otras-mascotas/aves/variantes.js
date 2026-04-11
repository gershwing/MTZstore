/**
 * VARIANTES - Mascotas > Otras Mascotas > Aves
 * Ruta: admin/src/variantes/mascotas/otras-mascotas/aves/variantes.js
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

  tipo_producto: {
    tipo: "texto",
    requerido: true,
    opciones: ["Jaula para canario / pequeña (40–50 cm)", "Jaula para periquito / mediana (60–80 cm)",
               "Jaula para loro / grande (80–120 cm)", "Jaula para cacatúa / extra grande (120 cm+)",
               "Voliera exterior", "Alimento para canario", "Alimento para periquito / budgie",
               "Alimento para loro / papagayo", "Alimento para agapornis / inseparables",
               "Mix semillas + frutas deshidratadas", "Snack / premio para aves (mijo + mijo en rama)",
               "Arenilla / gravilla para aves", "Bebedero / comedero para jaula",
               "Juguete colgante para loro / periquito", "Percha de madera / cuerda",
               "Cáscara de sepia (calcio)", "Suplemento vitamínico para aves", "Nido de cría",
               "Incubadora / calefactor de huevos"]
  },

  especie: {
    tipo: "texto",
    opciones: ["Canario", "Periquito australiano / Budgie", "Agapornis / Inseparable", "Loro (pequeño)",
               "Cotorra / Loro mediano", "Cacatúa", "Guacamayo", "Diamante mandarin / Jilguero", "Todas las especies"]
  },

  color_producto: {
    tipo: "imagen",
    nota: "El vendedor sube foto del producto / jaula / alimento. El cliente elige la imagen en el client.",
    guia_vendedor: ["Jaula blanca", "Jaula negra", "Jaula verde vintage", "Jaula dorada / cromo",
                    "Jaula madera + metal", "Alimento (ver empaque)", "Juguete colgante (ver foto)",
                    "Accesorio suelto (ver foto)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Versele-Laga (alimento)", "Vitakraft", "Trill / Quiko", "Ferplast (jaulas)",
               "Living World", "Prevue Hendryx", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
