/**
 * VARIANTES - Niños y Bebés > Accesorios Bebé > Andadores
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  tipo: {
    tipo: "texto",
    opciones: ["Andador clásico con ruedas", "Caminador de empuje", "Centro de actividades", "Arnés de caminar", "Saltarín / Jumper"]
  },

  edad_uso: {
    tipo: "texto",
    opciones: ["6-12 meses", "6-18 meses", "9-24 meses"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Rosa", "Azul", "Verde", "Rojo", "Multicolor"]
  },

  material: {
    tipo: "texto",
    opciones: ["Plástico ABS", "Madera", "Metal + Plástico"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Fisher-Price", "Chicco", "VTech", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
