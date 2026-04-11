/**
 * VARIANTES - Mascotas > Acuarios > Peces y Acuarios
 * Ruta: admin/src/variantes/mascotas/acuarios/peces-acuarios/variantes.js
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

  tipo_producto: {
    tipo: "texto",
    requerido: true,
    opciones: ["Alimento escamas (flakes) agua dulce", "Alimento gránulos (pellets) agua dulce",
               "Alimento para peces de fondo (tabletas)", "Alimento para goldfish / carpa",
               "Alimento para peces tropicales", "Alimento para peces marinos / reef",
               "Alimento para disco / discus", "Alimento liofilizado / freeze-dried",
               "Alimento vivo (artemia / tubifex)", "Alimento para camarones de acuario",
               "Vitaminas y suplementos para peces", "Acondicionador de agua (dechlorinador)",
               "Sal marina para acuario (reef / FOWLR)", "Antiparasitario para peces",
               "Antibacteriano para peces", "Planta artificial decorativa", "Planta viva de acuario",
               "Sustrato / grava de color", "Piedra / roca decorativa", "Coral artificial"]
  },

  especie_pez: {
    tipo: "texto",
    opciones: ["Peces de agua dulce tropicales (guppy / molly / neón)", "Goldfish / Carpa",
               "Bettas / Peces luchadores", "Disco / Discus", "Peces de fondo (corydoras / pleco)",
               "Peces marinos / Reef", "Camarones de agua dulce (neocaridina / cristal)", "Todas las especies"]
  },

  sabor_tipo: {
    tipo: "imagen",
    nota: "El vendedor sube foto del empaque / producto. El cliente elige la imagen en el client.",
    guia_vendedor: ["Escamas (flakes) tropicales", "Gránulos pequeños", "Gránulos medianos",
                    "Tabletas de fondo", "Liofilizado artemia", "Liofilizado tubifex",
                    "Escamas goldfish", "Pellets disco / discus",
                    "Planta artificial verde", "Planta artificial colorida", "Sustrato de color"]
  },

  peso_volumen: {
    tipo: "texto",
    opciones: ["10 g", "20 g", "50 g", "100 g", "150 g", "200 g", "250 g", "500 g", "1 kg", "250 ml", "500 ml", "1 L"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Tetra (flakes / gránulos / acondicionador)", "JBL (alimento / acondicionador)",
               "Sera (alimento / medic)", "Hikari (peces premium / bettas)", "API (acondicionador / medic)",
               "Red Sea (sal marina / reef)", "Fluval (alimento / accesorios)", "Dennerle (planta / sustrato)",
               "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
