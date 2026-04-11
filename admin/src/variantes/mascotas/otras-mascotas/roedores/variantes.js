/**
 * VARIANTES - Mascotas > Otras Mascotas > Roedores
 * Ruta: admin/src/variantes/mascotas/otras-mascotas/roedores/variantes.js
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
    opciones: ["Jaula para hámster", "Jaula para cobayo / cuy / conejo",
               "Terrario para ratón / gerbil", "Alimento para hámster", "Alimento para conejo",
               "Alimento para cobayo / cuy", "Alimento para chinchilla",
               "Alimento para ratón / gerbil", "Heno / Paja timothy (conejo / cobayo)",
               "Snack / premio para roedores (palito de miel + semillas)",
               "Rueda de ejercicio", "Tubo / Túnel de juego", "Cama / Lecho de virutas",
               "Bebedero de botella para jaula", "Comedero de cerámica",
               "Pelota de paseo exterior", "Casa / escondite de madera", "Pienso premium sin azúcar"]
  },

  especie: {
    tipo: "texto",
    opciones: ["Hámster sirio / dorado", "Hámster enano (Roborovski / Campbell)", "Conejo enano",
               "Cobayo / Cuy", "Chinchilla", "Ratón doméstico", "Gerbil / Jerbo", "Todas las especies"]
  },

  color_producto: {
    tipo: "imagen",
    nota: "El vendedor sube foto real del producto. El cliente elige la imagen en el client.",
    guia_vendedor: ["Jaula rosa + blanca", "Jaula azul + blanca", "Jaula transparente + color",
                    "Jaula madera (conejo)", "Alimento (ver empaque)", "Rueda plateada",
                    "Rueda de colores", "Accesorio / juguete (ver foto)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Habitrail (Hagen)", "Savic (jaulas)", "Ferplast (jaulas / accesorios)",
               "Kaytee (alimento + cama)", "Oxbow Animal Health (conejo / cobayo)",
               "Supreme Science Selective", "Vitakraft", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
