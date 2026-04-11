/**
 * VARIANTES - Instrumentos > Percusión > Percusión Latina
 * Ruta: admin/src/variantes/instrumentos/percusion/percusion-latina/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar en: colores / acabados de cuerpo, diseños de funda,
 *                  colores de batería — el músico compra por lo que ve.
 * tipo: "texto"  → selector de chips para especificaciones técnicas:
 *                  número de cuerdas, teclas, tallas, materiales, potencia.
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
    opciones: ["Congas (par 11\"+12\")", "Conga individual", "Bongós (par)", "Timbales (par)",
               "Pandero / Pandereta", "Güiro", "Claves", "Maracas (par)", "Cencerro / Cowbell",
               "Shaker / Chéquere", "Triángulo", "Tam-tam / Gong", "Platos de orquesta (par)",
               "Platillo crash individual", "Platillo ride individual", "Platillo hi-hat (par)",
               "Platillo china", "Platillo splash", "Platillo effect / stack", "Set platos completo"]
  },

  diametro_pulgadas: {
    tipo: "texto",
    requerido: false,
    opciones: ["6\"", "8\"", "10\"", "11\"", "12\"", "13\"", "14\"", "16\"", "18\"", "20\"", "22\""]
  },

  color_producto: {
    tipo: "imagen",
    requerido: true,
    nota: "El vendedor sube foto real del instrumento / platillo. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Natural (cuero + madera natural)", "Caoba oscura", "Negro",
      "Rojo brillante", "Azul", "Verde",
      "Bronce brillante (platillo)", "Bronce mate / satin (platillo)",
      "Bronce oscuro / black (platillo)", "Plata / Natural bronce",
      "Gold / Dorado (platillo)", "Raw / sin acabado (platillo)"
    ]
  },

  material_cuerpo: {
    tipo: "texto",
    requerido: false,
    opciones: ["Madera de mango", "Madera de fibra", "Fibra de vidrio", "Metal (timbales / platillos)",
               "Latón (brass)", "Bronce B8 (platillos entrada)", "Bronce B20 (platillos profesional)"]
  },

  marca_percusion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Meinl (congas / bongos / platillos)", "LP (Latin Percussion)", "Toca Percussion",
               "Gibraltar", "Pearl Primero", "Gon Bops", "Remo (parches)"]
  },

  marca_platillos: {
    tipo: "texto",
    requerido: false,
    opciones: ["Zildjian A / K / S / A Custom", "Sabian AA / HHX / AAX / B8X",
               "Meinl Byzance / Classics Custom / HCS", "Paiste 2002 / PST / Signature",
               "Istanbul Agop / Mehmet", "Dream Bliss / Contact", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
