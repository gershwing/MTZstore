/**
 * VARIANTES - Deportes > Fitness > Mancuernas y Pesas
 * Ruta: admin/src/variantes/deportes/fitness/mancuernas-pesas/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/diseño es esencial.
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
    opciones: [
      "Par de mancuernas fijas",
      "Mancuerna ajustable individual",
      "Set ajustable 5\u201325 kg",
      "Set ajustable 5\u201352.5 kg",
      "Kettlebell fija",
      "Set kettlebells",
      "Barra ol\u00edmpica 20 kg",
      "Barra corta / EZ curl",
      "Discos de peso (par)",
      "Set barra + discos completo",
      "Slam ball / Medicine ball",
      "Bola de peso (wall ball)",
      "Chaleco con peso"
    ]
  },

  peso: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "1 kg", "2 kg", "3 kg", "4 kg", "5 kg", "6 kg", "8 kg", "10 kg",
      "12 kg", "14 kg", "16 kg", "18 kg", "20 kg", "22 kg", "24 kg",
      "28 kg", "32 kg", "Ajustable 5\u201325 kg", "Ajustable 5\u201352.5 kg"
    ]
  },

  material: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Hierro fundido liso",
      "Hierro fundido recubierto de goma",
      "Hierro cromado",
      "Vinilo / PVC",
      "Neopreno",
      "Acero ol\u00edmpico",
      "Hierro + agarre de caucho"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del producto. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro liso", "Negro + goma gris", "Negro + goma roja", "Negro + goma verde",
      "Cromado / Plateado", "Verde", "Azul", "Rojo", "Naranja", "Morado",
      "Multicolor (set graduado)"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Bowflex SelectTech 552 / 1090",
      "PowerBlock Elite / Sport",
      "NordicTrack iSelect",
      "Rogue",
      "Eleiko",
      "CAP Barbell",
      "Yes4All",
      "Yaheetech",
      "Gen\u00e9rico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
