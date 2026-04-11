/**
 * VARIANTES - Mascotas > Perros > Snacks y Premios
 * Ruta: admin/src/variantes/mascotas/perros/snacks-premios/variantes.js
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
    opciones: ["Premio suave / Soft treat", "Premio crujiente / Crunchy treat",
               "Palito masticable (dental)", "Hueso natural (deshidratado)", "Hueso de nailon / sintético",
               "Oreja de cerdo deshidratada", "Pata de pollo deshidratada", "Cuero / Tripa bovina",
               "Jerky / Carne deshidratada en tiras", "Snack funcional (articulaciones / piel / pelaje)",
               "Galleta artesanal para perros", "Helado para perros (sin lactosa)", "Pasta dental + cepillo"]
  },

  sabor: {
    tipo: "imagen",
    nota: "El vendedor sube foto del empaque por sabor/tipo. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Pollo", "Vacuno / Res", "Salmón", "Pavo", "Hígado",
      "Tocino / Bacon", "Mantequilla de maní", "Queso",
      "Frutas y verduras (vegano)", "Mix surtido", "Sin saborizante añadido"
    ]
  },

  peso: {
    tipo: "texto",
    opciones: ["50 g", "100 g", "150 g", "200 g", "250 g", "400 g", "500 g", "1 kg", "Unidad (hueso / oreja)"]
  },

  funcion: {
    tipo: "texto",
    opciones: ["Premio general", "Dental / Limpieza dental", "Articulaciones / Glucosamina",
               "Pelaje brillante / Omega-3", "Relajante / Calmante", "Entrenamiento (mini bites)",
               "Sin función específica"]
  },

  tamano_mascota: {
    tipo: "texto",
    opciones: ["Perros pequeños (< 10 kg)", "Perros medianos (10–25 kg)",
               "Perros grandes (25 kg+)", "Todos los tamaños"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Zuke's Mini Naturals", "Wellness Soft WellBites", "Bil-Jac", "Merrick Power Bites",
               "Nylabone (masticable)", "Kong Stuff'n (relleno)", "Dentastix (dental)",
               "Greenies (dental)", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
