/**
 * VARIANTES - Mascotas > Perros > Accesorios Perros
 * Ruta: admin/src/variantes/mascotas/perros/accesorios-perros/variantes.js
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
    opciones: ["Collar de tela / nylon", "Collar de cuero", "Collar antipulgas", "Collar antipulgas + garrapatas",
               "Collar GPS inteligente", "Correa estándar (1.2–1.5 m)", "Correa extensible / retráctil (3–8 m)",
               "Correa tipo arnés de mano", "Arnés tipo H (espalda)", "Arnés tipo chaleco",
               "Arnés de seguridad (auto)", "Cama / colchón básico", "Cama ortopédica memoria foam",
               "Cama cueva / iglu", "Transportín rígido (jaula)", "Transportín blando / bolso",
               "Mochila de transporte para perro", "Cochecito / Carrito para perro",
               "Valla / Barrera para auto", "Bebedero automático", "Comedero automático con temporizador",
               "Comedero antiatraque (slow feeder)", "Juguete de mordida", "Pelota lanzadora",
               "Kong rellenable", "Juguete interactivo / puzzle", "Piscina inflable para perros"]
  },

  talla: {
    tipo: "texto",
    opciones: ["XS (cuello 20–28 cm / hasta 3 kg)", "S (cuello 28–38 cm / 3–7 kg)",
               "M (cuello 38–48 cm / 7–18 kg)", "L (cuello 48–58 cm / 18–35 kg)",
               "XL (cuello 58–72 cm / 35–60 kg)", "XXL (cuello 72 cm+ / 60 kg+)", "Talla única ajustable"]
  },

  color: {
    tipo: "imagen",
    nota: "El vendedor sube foto del color/diseño real. El cliente elige la imagen en el client.",
    guia_vendedor: ["Negro", "Rojo", "Azul marino", "Verde", "Rosa", "Naranja",
                    "Morado", "Gris", "Beige / Arena", "Estampado floral",
                    "Estampado geométrico", "Camuflaje", "Arcoíris", "Multicolor"]
  },

  material: {
    tipo: "texto",
    opciones: ["Nylon / Poliéster", "Cuero genuino", "Cuero sintético PU", "Neopreno", "Algodón", "Cuerda trenzada"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Ruffwear (arnés outdoor)", "Julius-K9 (arnés + correa)", "PetSafe (collar GPS / anti-ladrido)",
               "Tractive GPS", "Kong (juguetes)", "Chuckit (pelota)", "FurHaven (cama)", "Kurgo (auto)",
               "Trixie", "Ferplast", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
