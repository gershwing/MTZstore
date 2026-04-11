/**
 * VARIANTES - Mascotas > Gatos > Accesorios Gatos
 * Ruta: admin/src/variantes/mascotas/gatos/accesorios-gatos/variantes.js
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
    opciones: ["Arenero abierto", "Arenero cubierto / cerrado", "Arenero con filtro de carbón",
               "Arenero automático / autolimpiante", "Arena de bentonita (aglomerante)",
               "Arena de sílice", "Arena de madera / pellets", "Arena biodegradable (tofu)",
               "Cama / Cojín suave", "Cama cueva / iglu", "Hamaca para ventana",
               "Rascador de poste", "Rascador + árbol multiactividades", "Árbol para gatos (con cubículo)",
               "Túnel / Cueva de juego", "Juguete de plumas (varita)", "Pelota interactiva automática",
               "Ratón / Peluche crujiente", "Juguete con hierba gatera / catnip",
               "Dispensador de croquetas interactivo / puzzle", "Transportín rígido",
               "Transportín blando / mochila", "Bebedero fuente circulante (con bomba)",
               "Collar para gato con cascabel", "Collar GPS para gato", "Arnés + correa para paseo"]
  },

  talla: {
    tipo: "texto",
    opciones: ["XS (gato kitten / miniatura)", "S (gato adulto pequeño)", "M (gato adulto estándar)",
               "L (gato grande / Maine Coon / Ragdoll)", "Talla única ajustable"]
  },

  color: {
    tipo: "imagen",
    nota: "El vendedor sube foto del color/diseño del accesorio. El cliente elige la imagen en el client.",
    guia_vendedor: ["Gris", "Beige / Crema", "Negro", "Blanco", "Azul",
                    "Rosa", "Verde", "Naranja", "Madera natural (rascador)",
                    "Multicolor (árbol actividades)", "Estampado patas / huellas"]
  },

  material: {
    tipo: "texto",
    opciones: ["Sisal (rascador)", "Felpa / Plush", "Algodón", "Cartón corrugado", "Plástico ABS",
               "Acero inoxidable (bebedero)", "Madera + sisal (árbol)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Litter Robot (automático)", "PetSafe (bebedero / juguete)", "Catit Flower Fountain",
               "Go Cat (juguete varita)", "SmartyKat (juguete)", "FUKUMARU (cama)", "Tractive GPS",
               "Hepper (árbol premium)", "Frisco / Chewy", "Trixie", "Ferplast", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
