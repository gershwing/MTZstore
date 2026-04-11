/**
 * ÍNDICE — Moda
 * Importa y re-exporta todas las subcategorías.
 */

// ── Re-exports ──
export { variantes as pantalones_h } from './ropa-hombre/pantalones/variantes.js';
export { variantes as chaquetas_h } from './ropa-hombre/chaquetas/variantes.js';
export { variantes as poleras_h } from './ropa-hombre/poleras/variantes.js';
export { variantes as formal_h } from './ropa-hombre/formal/variantes.js';
export { variantes as deportiva_h } from './ropa-hombre/deportiva/variantes.js';
export { variantes as interiores_h } from './ropa-hombre/interiores/variantes.js';
export { variantes as vestidos } from './ropa-mujer/vestidos/variantes.js';
export { variantes as blusas } from './ropa-mujer/blusas/variantes.js';
export { variantes as jeans } from './ropa-mujer/jeans/variantes.js';
export { variantes as chaquetas_m } from './ropa-mujer/chaquetas/variantes.js';
export { variantes as formal_m } from './ropa-mujer/formal/variantes.js';
export { variantes as deportiva_m } from './ropa-mujer/deportiva/variantes.js';
export { variantes as interiores_m } from './ropa-mujer/interiores/variantes.js';
export { variantes as zapatillasVaron } from './calzado/zapatillas-varon/variantes.js';
export { variantes as zapatillasDamas } from './calzado/zapatillas-damas/variantes.js';
export { variantes as calzadoVaron } from './calzado/calzado-varon/variantes.js';
export { variantes as calzadoDamas } from './calzado/calzado-damas/variantes.js';
export { variantes as botas } from './calzado/botas/variantes.js';
export { variantes as sandalias } from './calzado/sandalias/variantes.js';
export { variantes as relojes } from './accesorios/relojes/variantes.js';
export { variantes as gafas } from './accesorios/gafas/variantes.js';
export { variantes as bolsos } from './accesorios/bolsos/variantes.js';
export { variantes as carteras } from './accesorios/carteras/variantes.js';
export { variantes as pendientes } from './joyas/pendientes/variantes.js';
export { variantes as brazaletes } from './joyas/brazaletes/variantes.js';
export { variantes as collares } from './joyas/collares/variantes.js';

/**
 * Mapa de rutas → archivo de variantes
 * Uso: MAPA['moda/ropa-hombre/pantalones'] → importación dinámica
 */
export const MAPA = {
  'moda/ropa-hombre/pantalones': () => import('./ropa-hombre/pantalones/variantes.js'),
  'moda/ropa-hombre/chaquetas': () => import('./ropa-hombre/chaquetas/variantes.js'),
  'moda/ropa-hombre/poleras': () => import('./ropa-hombre/poleras/variantes.js'),
  'moda/ropa-hombre/formal': () => import('./ropa-hombre/formal/variantes.js'),
  'moda/ropa-hombre/deportiva': () => import('./ropa-hombre/deportiva/variantes.js'),
  'moda/ropa-hombre/interiores': () => import('./ropa-hombre/interiores/variantes.js'),
  'moda/ropa-mujer/vestidos': () => import('./ropa-mujer/vestidos/variantes.js'),
  'moda/ropa-mujer/blusas': () => import('./ropa-mujer/blusas/variantes.js'),
  'moda/ropa-mujer/jeans': () => import('./ropa-mujer/jeans/variantes.js'),
  'moda/ropa-mujer/chaquetas': () => import('./ropa-mujer/chaquetas/variantes.js'),
  'moda/ropa-mujer/formal': () => import('./ropa-mujer/formal/variantes.js'),
  'moda/ropa-mujer/deportiva': () => import('./ropa-mujer/deportiva/variantes.js'),
  'moda/ropa-mujer/interiores': () => import('./ropa-mujer/interiores/variantes.js'),
  'moda/calzado/zapatillas-varon': () => import('./calzado/zapatillas-varon/variantes.js'),
  'moda/calzado/zapatillas-damas': () => import('./calzado/zapatillas-damas/variantes.js'),
  'moda/calzado/calzado-varon': () => import('./calzado/calzado-varon/variantes.js'),
  'moda/calzado/calzado-damas': () => import('./calzado/calzado-damas/variantes.js'),
  'moda/calzado/botas': () => import('./calzado/botas/variantes.js'),
  'moda/calzado/sandalias': () => import('./calzado/sandalias/variantes.js'),
  'moda/accesorios/relojes': () => import('./accesorios/relojes/variantes.js'),
  'moda/accesorios/gafas': () => import('./accesorios/gafas/variantes.js'),
  'moda/accesorios/bolsos': () => import('./accesorios/bolsos/variantes.js'),
  'moda/accesorios/carteras': () => import('./accesorios/carteras/variantes.js'),
  'moda/joyas/pendientes': () => import('./joyas/pendientes/variantes.js'),
  'moda/joyas/brazaletes': () => import('./joyas/brazaletes/variantes.js'),
  'moda/joyas/collares': () => import('./joyas/collares/variantes.js'),
};

/**
 * Helper: obtener variantes por ruta
 * Uso: await getVariantesPorRuta('moda/calzado/botas')
 */
export async function getVariantesPorRuta(ruta) {
  const loader = MAPA[ruta];
  if (!loader) return null;
  const mod = await loader();
  return mod.variantes ?? null;
}
