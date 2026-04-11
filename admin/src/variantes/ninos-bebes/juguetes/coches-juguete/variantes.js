/**
 * VARIANTES - Bebés > Juguetes > Coches de Juguete
 * Ruta: admin/src/variantes/bebes/juguetes/coches-juguete/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/estampado es esencial.
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
      "Coche RC eléctrico (radio control)",
      "Coche de fricción / push-and-go",
      "Set de pista (slot / circuito)",
      "Camión de construcción / volquete",
      "Coche de policía / ambulancia / bomberos",
      "Coche coleccionable diecast",
      "Set de coches (pack varios)",
      "Garage / Estacionamiento de juguete",
      "Coche gigante para montar (ride-on)",
      "Moto de juguete (fricción / RC)",
      "Tractor / Vehículo agrícola",
      "Nave espacial / vehículo fantasía",
      "Coche de madera (push toy)",
      "Helicóptero / Avión de juguete",
      "Barco de juguete"
    ]
  },

  escala: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "No aplica (tamaño libre)",
      "1:64 (Hot Wheels estándar)",
      "1:43",
      "1:32",
      "1:24",
      "1:18",
      "1:10 (RC grande)",
      "Ride-on (montar)"
    ]
  },

  edad_recomendada: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "1–3 años (sin piezas pequeñas)",
      "3–5 años",
      "5–8 años",
      "8–12 años",
      "Coleccionable (12+)"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del coche / vehículo. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Rojo", "Azul", "Negro", "Amarillo", "Verde", "Naranja",
      "Blanco + azul (policía)", "Rojo + blanco (bomberos)", "Amarillo (taxi)",
      "Gris / Plateado (deportivo)", "Multicolor set", "Camuflaje (RC offroad)"
    ]
  },

  material: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Metal diecast (zinc)",
      "Plástico ABS resistente",
      "Madera",
      "Metal + plástico",
      "Goma + plástico"
    ]
  },

  velocidad_rc: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "No aplica",
      "Hasta 10 km/h",
      "10–20 km/h",
      "20–35 km/h",
      "35–50 km/h",
      "50 km/h+"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Hot Wheels (Mattel)",
      "Matchbox",
      "LEGO Technic / City",
      "Bruder (plástico)",
      "Siku (metal)",
      "Carrera GO (pista)",
      "Traxxas (RC profesional)",
      "ARRMA / Redcat (RC)",
      "Brio (madera)",
      "Fisher-Price (ride-on)",
      "Peg Perego (ride-on)",
      "Power Wheels (ride-on)",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
