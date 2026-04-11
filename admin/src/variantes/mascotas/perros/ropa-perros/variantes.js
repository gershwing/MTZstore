/**
 * VARIANTES - Mascotas > Perros > Ropa Perros
 * Ruta: admin/src/variantes/mascotas/perros/ropa-perros/variantes.js
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
    opciones: ["Camiseta básica", "Polera / Sweater de punto", "Abrigo / Chaqueta impermeable",
               "Disfraz / Costume", "Pijama", "Vestido (hembra)", "Impermeable / Poncho lluvia",
               "Botas / Zapatos para perro", "Calcetines antideslizantes", "Bandana / Pañuelo",
               "Malla de verano (protección UV)"]
  },

  talla: {
    tipo: "texto",
    opciones: ["XXS (pecho 20–25 cm)", "XS (pecho 26–32 cm)", "S (pecho 33–40 cm)",
               "M (pecho 41–50 cm)", "L (pecho 51–62 cm)", "XL (pecho 63–75 cm)", "XXL (pecho 76 cm+)"]
  },

  color: {
    tipo: "imagen",
    nota: "El vendedor sube foto real de la prenda. El cliente elige la imagen en el client.",
    guia_vendedor: ["Negro", "Blanco", "Rojo", "Rosa", "Azul", "Verde", "Amarillo",
                    "Gris", "Estampado lunares", "Estampado rayas", "Estampado navideño",
                    "Estampado Halloween", "Disfraz específico (ver foto)"]
  },

  material: {
    tipo: "texto",
    opciones: ["Algodón suave", "Algodón orgánico", "Polar / Fleece", "Impermeable PU", "Nylon reforzado", "Lana merino"]
  },

  genero_perro: {
    tipo: "texto",
    opciones: ["Macho / Neutro", "Hembra", "Unisex"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Canada Pooch", "Ruffwear", "Youly", "Pet Life", "RC Pet Products", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
