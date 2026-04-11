/**
 * ÍNDICE — Electrónica
 * Importa y re-exporta todas las subcategorías.
 */

// ── Re-exports ──
export { variantes as apple } from './celulares/apple/variantes.js';
export { variantes as samsung } from './celulares/samsung/variantes.js';
export { variantes as xiaomi } from './celulares/xiaomi/variantes.js';
export { variantes as redmi } from './celulares/redmi/variantes.js';
export { variantes as poco } from './celulares/poco/variantes.js';
export { variantes as honor } from './celulares/honor/variantes.js';
export { variantes as infinix } from './celulares/infinix/variantes.js';
export { variantes as tecno } from './celulares/tecno/variantes.js';
export { variantes as motorola } from './celulares/motorola/variantes.js';
export { variantes as reacondicionados } from './celulares/reacondicionados/variantes.js';
export { variantes as fundas } from './accesorios-celulares/fundas/variantes.js';
export { variantes as protectores } from './accesorios-celulares/protectores/variantes.js';
export { variantes as cargadores } from './accesorios-celulares/cargadores/variantes.js';
export { variantes as powerbanks } from './accesorios-celulares/powerbanks/variantes.js';
export { variantes as macbooks } from './computacion/macbooks/variantes.js';
export { variantes as laptops } from './computacion/laptops/variantes.js';
export { variantes as pcsEscritorio } from './computacion/pcs-escritorio/variantes.js';
export { variantes as ipads } from './computacion/ipads/variantes.js';
export { variantes as tablets } from './computacion/tablets/variantes.js';
export { variantes as accesoriosComputacion } from './computacion/accesorios-computacion/variantes.js';
export { variantes as procesadores } from './componentes/procesadores/variantes.js';
export { variantes as tarjetasGraficas } from './componentes/tarjetas-graficas/variantes.js';
export { variantes as discos } from './componentes/discos/variantes.js';
export { variantes as memoriasRam } from './componentes/memorias-ram/variantes.js';
export { variantes as tarjetasMadre } from './componentes/tarjetas-madre/variantes.js';
export { variantes as fuentesPoder } from './componentes/fuentes-poder/variantes.js';
export { variantes as monitores } from './componentes/monitores/variantes.js';
export { variantes as refrigeracion } from './componentes/refrigeracion/variantes.js';
export { variantes as accesoriosHardware } from './componentes/accesorios-hardware/variantes.js';
export { variantes as audifonos } from './audio/audifonos/variantes.js';
export { variantes as altavoces } from './audio/altavoces/variantes.js';
export { variantes as microfonos } from './audio/microfonos/variantes.js';
export { variantes as camarasDigitales } from './camaras/camaras-digitales/variantes.js';
export { variantes as camarasAccion } from './camaras/camaras-accion/variantes.js';
export { variantes as accesoriosCamara } from './camaras/accesorios-camara/variantes.js';
export { variantes as televisoresLed } from './televisores/televisores-led/variantes.js';
export { variantes as televisoresQled } from './televisores/televisores-qled/variantes.js';
export { variantes as televisoresOled } from './televisores/televisores-oled/variantes.js';
export { variantes as smartTv } from './televisores/smart-tv/variantes.js';
export { variantes as soportesBases } from './televisores/soportes-bases/variantes.js';
export { variantes as proyectores } from './televisores/proyectores/variantes.js';
export { variantes as barrasSonido } from './televisores/barras-sonido/variantes.js';

/**
 * Mapa de rutas → archivo de variantes
 * Uso: MAPA['electronica/celulares/apple'] → importación dinámica
 */
export const MAPA = {
  'electronica/celulares/apple': () => import('./celulares/apple/variantes.js'),
  'electronica/celulares/samsung': () => import('./celulares/samsung/variantes.js'),
  'electronica/celulares/xiaomi': () => import('./celulares/xiaomi/variantes.js'),
  'electronica/celulares/redmi': () => import('./celulares/redmi/variantes.js'),
  'electronica/celulares/poco': () => import('./celulares/poco/variantes.js'),
  'electronica/celulares/honor': () => import('./celulares/honor/variantes.js'),
  'electronica/celulares/infinix': () => import('./celulares/infinix/variantes.js'),
  'electronica/celulares/tecno': () => import('./celulares/tecno/variantes.js'),
  'electronica/celulares/motorola': () => import('./celulares/motorola/variantes.js'),
  'electronica/celulares/reacondicionados': () => import('./celulares/reacondicionados/variantes.js'),
  'electronica/accesorios-celulares/fundas': () => import('./accesorios-celulares/fundas/variantes.js'),
  'electronica/accesorios-celulares/protectores': () => import('./accesorios-celulares/protectores/variantes.js'),
  'electronica/accesorios-celulares/cargadores': () => import('./accesorios-celulares/cargadores/variantes.js'),
  'electronica/accesorios-celulares/powerbanks': () => import('./accesorios-celulares/powerbanks/variantes.js'),
  'electronica/computacion/macbooks': () => import('./computacion/macbooks/variantes.js'),
  'electronica/computacion/laptops': () => import('./computacion/laptops/variantes.js'),
  'electronica/computacion/pcs-escritorio': () => import('./computacion/pcs-escritorio/variantes.js'),
  'electronica/computacion/ipads': () => import('./computacion/ipads/variantes.js'),
  'electronica/computacion/tablets': () => import('./computacion/tablets/variantes.js'),
  'electronica/computacion/accesorios-computacion': () => import('./computacion/accesorios-computacion/variantes.js'),
  'electronica/componentes/procesadores': () => import('./componentes/procesadores/variantes.js'),
  'electronica/componentes/tarjetas-graficas': () => import('./componentes/tarjetas-graficas/variantes.js'),
  'electronica/componentes/discos': () => import('./componentes/discos/variantes.js'),
  'electronica/componentes/memorias-ram': () => import('./componentes/memorias-ram/variantes.js'),
  'electronica/componentes/tarjetas-madre': () => import('./componentes/tarjetas-madre/variantes.js'),
  'electronica/componentes/fuentes-poder': () => import('./componentes/fuentes-poder/variantes.js'),
  'electronica/componentes/monitores': () => import('./componentes/monitores/variantes.js'),
  'electronica/componentes/refrigeracion': () => import('./componentes/refrigeracion/variantes.js'),
  'electronica/componentes/accesorios-hardware': () => import('./componentes/accesorios-hardware/variantes.js'),
  'electronica/audio/audifonos': () => import('./audio/audifonos/variantes.js'),
  'electronica/audio/altavoces': () => import('./audio/altavoces/variantes.js'),
  'electronica/audio/microfonos': () => import('./audio/microfonos/variantes.js'),
  'electronica/camaras/camaras-digitales': () => import('./camaras/camaras-digitales/variantes.js'),
  'electronica/camaras/camaras-accion': () => import('./camaras/camaras-accion/variantes.js'),
  'electronica/camaras/accesorios-camara': () => import('./camaras/accesorios-camara/variantes.js'),
  'electronica/televisores/televisores-led': () => import('./televisores/televisores-led/variantes.js'),
  'electronica/televisores/televisores-qled': () => import('./televisores/televisores-qled/variantes.js'),
  'electronica/televisores/televisores-oled': () => import('./televisores/televisores-oled/variantes.js'),
  'electronica/televisores/smart-tv': () => import('./televisores/smart-tv/variantes.js'),
  'electronica/televisores/soportes-bases': () => import('./televisores/soportes-bases/variantes.js'),
  'electronica/televisores/proyectores': () => import('./televisores/proyectores/variantes.js'),
  'electronica/televisores/barras-sonido': () => import('./televisores/barras-sonido/variantes.js'),
};

/**
 * Helper: obtener variantes por ruta
 * Uso: await getVariantesPorRuta('electronica/celulares/apple')
 */
export async function getVariantesPorRuta(ruta) {
  const loader = MAPA[ruta];
  if (!loader) return null;
  const mod = await loader();
  return mod.variantes ?? null;
}
