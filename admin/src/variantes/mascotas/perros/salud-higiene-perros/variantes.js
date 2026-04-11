/**
 * VARIANTES - Mascotas > Perros > Salud e Higiene Perros
 * Ruta: admin/src/variantes/mascotas/perros/salud-higiene-perros/variantes.js
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
    opciones: ["Antipulgas y garrapatas (pipeta / spot-on)", "Antiparasitario interno (tableta / pasta)",
               "Collar antipulgas de larga duración", "Spray antipulgas para el hogar",
               "Champú para perros (pelo normal)", "Champú antipulgas", "Champú para perros de pelo largo",
               "Champú en seco", "Acondicionador / Desenredante", "Perfume / Colonia para perro",
               "Cepillo de dientes + pasta dental", "Toallitas húmedas para perros",
               "Cortaúñas / Tijeras de aseo", "Cepillo / Furminator (desmoldante)",
               "Rasqueta / Guante de baño", "Secador de pelo para mascotas",
               "Suplemento omega-3 (piel + pelaje)", "Suplemento articulaciones (glucosamina + condroitín)",
               "Suplemento probiótico digestivo", "Pipeta antiparasitaria (combo pulgas + gusanos)"]
  },

  peso_mascota: {
    tipo: "texto",
    opciones: ["Hasta 4 kg", "4–10 kg", "10–25 kg", "25–40 kg", "40 kg+", "Todas las tallas"]
  },

  duracion_proteccion: {
    tipo: "texto",
    opciones: ["1 mes", "3 meses", "4 meses", "6 meses", "8 meses", "1 año (collar)", "Uso único"]
  },

  color_producto: {
    tipo: "imagen",
    nota: "El vendedor sube foto del producto real. El cliente elige la imagen en el client.",
    guia_vendedor: ["Frasco champú (ver foto)", "Caja tabletas (ver foto)", "Pipeta (ver foto)",
                    "Collar antipulgas (azul / naranja / verde)", "Cepillo / herramienta (ver foto)",
                    "Suplemento frasco (ver foto)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Frontline Plus / Tri-Act", "Advantage / Advantix II", "NexGard (tableta masticable)",
               "Bravecto (tableta 3 meses)", "Seresto (collar 8 meses)", "Drontal (antiparasitario interno)",
               "Furminator (cepillo)", "Wahl Pet (champú / trimmer)", "Virbac (veterinario)",
               "Genérico / Marca veterinaria local"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
