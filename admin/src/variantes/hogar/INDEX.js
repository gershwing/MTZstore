/**
 * ÍNDICE — Hogar y Cocina
 * Importa y re-exporta todas las subcategorías.
 */

// ── Re-exports ──
export { variantes as refrigeradores } from './electrodomesticos/refrigeradores/variantes.js';
export { variantes as microondas } from './electrodomesticos/microondas/variantes.js';
export { variantes as lavadoras } from './electrodomesticos/lavadoras/variantes.js';
export { variantes as aspiradoras } from './electrodomesticos/aspiradoras/variantes.js';
export { variantes as airesAcondicionados } from './electrodomesticos/aires-acondicionados/variantes.js';
export { variantes as ollas } from './cocina/ollas/variantes.js';
export { variantes as utensilios } from './cocina/utensilios/variantes.js';
export { variantes as cafeteras } from './cocina/cafeteras/variantes.js';
export { variantes as licuadorasBatidoras } from './cocina/licuadoras-batidoras/variantes.js';
export { variantes as hornosFreidoras } from './cocina/hornos-freidoras/variantes.js';
export { variantes as camas } from './muebles/camas/variantes.js';
export { variantes as roperos } from './muebles/roperos/variantes.js';
export { variantes as sofas } from './muebles/sofas/variantes.js';
export { variantes as mesas } from './muebles/mesas/variantes.js';
export { variantes as escritorios } from './muebles/escritorios/variantes.js';
export { variantes as sillas } from './muebles/sillas/variantes.js';
export { variantes as cuadros } from './decoracion/cuadros/variantes.js';
export { variantes as iluminacion } from './decoracion/iluminacion/variantes.js';
export { variantes as espejos } from './decoracion/espejos/variantes.js';

/**
 * Mapa de rutas → archivo de variantes
 * Uso: MAPA['hogar/electrodomesticos/refrigeradores'] → importación dinámica
 */
export const MAPA = {
  'hogar/electrodomesticos/refrigeradores': () => import('./electrodomesticos/refrigeradores/variantes.js'),
  'hogar/electrodomesticos/microondas': () => import('./electrodomesticos/microondas/variantes.js'),
  'hogar/electrodomesticos/lavadoras': () => import('./electrodomesticos/lavadoras/variantes.js'),
  'hogar/electrodomesticos/aspiradoras': () => import('./electrodomesticos/aspiradoras/variantes.js'),
  'hogar/electrodomesticos/aires-acondicionados': () => import('./electrodomesticos/aires-acondicionados/variantes.js'),
  'hogar/cocina/ollas': () => import('./cocina/ollas/variantes.js'),
  'hogar/cocina/utensilios': () => import('./cocina/utensilios/variantes.js'),
  'hogar/cocina/cafeteras': () => import('./cocina/cafeteras/variantes.js'),
  'hogar/cocina/licuadoras-batidoras': () => import('./cocina/licuadoras-batidoras/variantes.js'),
  'hogar/cocina/hornos-freidoras': () => import('./cocina/hornos-freidoras/variantes.js'),
  'hogar/muebles/camas': () => import('./muebles/camas/variantes.js'),
  'hogar/muebles/roperos': () => import('./muebles/roperos/variantes.js'),
  'hogar/muebles/sofas': () => import('./muebles/sofas/variantes.js'),
  'hogar/muebles/mesas': () => import('./muebles/mesas/variantes.js'),
  'hogar/muebles/escritorios': () => import('./muebles/escritorios/variantes.js'),
  'hogar/muebles/sillas': () => import('./muebles/sillas/variantes.js'),
  'hogar/decoracion/cuadros': () => import('./decoracion/cuadros/variantes.js'),
  'hogar/decoracion/iluminacion': () => import('./decoracion/iluminacion/variantes.js'),
  'hogar/decoracion/espejos': () => import('./decoracion/espejos/variantes.js'),
};

/**
 * Helper: obtener variantes por ruta
 * Uso: await getVariantesPorRuta('hogar/cocina/cafeteras')
 */
export async function getVariantesPorRuta(ruta) {
  const loader = MAPA[ruta];
  if (!loader) return null;
  const mod = await loader();
  return mod.variantes ?? null;
}
