/**
 * VARIANTES - Mascotas > Otras Mascotas > Reptiles
 * Ruta: admin/src/variantes/mascotas/otras-mascotas/reptiles/variantes.js
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
    opciones: ["Terrario de vidrio (40–60 cm)", "Terrario de vidrio (60–90 cm)", "Terrario de vidrio (90–120 cm+)",
               "Terrario plástico / transporte", "Lámpara UVB (reptiles)", "Lámpara de calor / spot",
               "Lámpara de calor nocturno (rojo)", "Termostato para terrario",
               "Termómetro + higrómetro digital", "Alfombra de coco / sustrato",
               "Sustrato de arena (desert)", "Sustrato de corteza (tropical)",
               "Corteza de corcho / escondite", "Ramas + decoración terrario",
               "Plato bebedero para reptil", "Pinzas de alimentación",
               "Alimento grillo (caja viva)", "Alimento mealworm (larva)",
               "Suplemento calcio + vitamina D3", "Alimento pienso tortuga / iguana"]
  },

  especie: {
    tipo: "texto",
    opciones: ["Leopard gecko", "Bearded dragon / Dragón barbudo", "Tortuga de agua",
               "Tortuga terrestre", "Iguana verde", "Serpiente (boa / corn snake)", "Camaleón", "Todas las especies"]
  },

  color_producto: {
    tipo: "imagen",
    nota: "El vendedor sube foto real del producto / terrario. El cliente elige la imagen en el client.",
    guia_vendedor: ["Terrario vidrio estándar", "Terrario con fondo decorativo",
                    "Lámpara UVB (ver foto)", "Sustrato (ver foto)",
                    "Decoración + ramas (ver foto)", "Escondite corcho (ver foto)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Exo Terra (terrario + accesorios)", "ReptiZoo", "Zoo Med (lámpara / sustrato)",
               "Arcadia (UVB)", "Habistat (termostato)", "Lucky Reptile", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
