/**
 * VARIANTES - Mascotas > Gatos > Salud e Higiene Gatos
 * Ruta: admin/src/variantes/mascotas/gatos/salud-higiene-gatos/variantes.js
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
    opciones: ["Antipulgas y garrapatas (pipeta gato)", "Antiparasitario interno para gato (pasta / tableta)",
               "Collar antipulgas para gato", "Champú para gato de pelo corto",
               "Champú para gato de pelo largo (angora / persa)", "Champú en seco para gato",
               "Cepillo / Furminator para gato", "Cortaúñas para gato",
               "Toallitas de limpieza facial", "Limpiador de oídos",
               "Pasta de malta (eliminación de bolas de pelo)", "Suplemento omega-3 + biotina (pelaje)",
               "Suplemento articulaciones para gato", "Probiótico digestivo felino",
               "Repelente de arañazos en muebles", "Spray de feromonas calmante (Feliway)"]
  },

  peso_gato: {
    tipo: "texto",
    opciones: ["Gatito (< 2 kg)", "Hasta 4 kg", "4–8 kg", "8 kg+", "Todas las tallas"]
  },

  color_producto: {
    tipo: "imagen",
    nota: "El vendedor sube foto del producto real. El cliente elige la imagen en el client.",
    guia_vendedor: ["Pipeta / caja (ver foto)", "Frasco champú (ver foto)",
                    "Pasta de malta (tubo)", "Cepillo / peine (ver foto)",
                    "Spray (ver foto)", "Suplemento frasco (ver foto)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Frontline Tri-Act / Plus (gato)", "Advantage II (gato)", "Revolution (pipeta gato)",
               "Bravecto Plus (gato)", "Seresto (collar gato)", "Drontal Cat (antiparasitario)",
               "Feliway Classic / Optimum (feromonas)", "Furminator (cepillo)",
               "Virbac", "Genérico / Veterinaria local"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
