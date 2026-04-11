/**
 * ÍNDICE — Gastronomía y Delivery
 * Ruta base: admin/src/variantes/gastronomia/
 *
 * Todos los atributos tipo:"imagen" permiten al cliente elegir
 * platos, variedades y presentaciones viendo la foto real
 * subida por el vendedor en el panel admin.
 *
 * condicion: siempre "Listo para entregar" en toda esta categoría.
 */

export const MAPA = {
  // Comida rápida
  'gastronomia/comida-rapida/hamburguesas':           () => import('./comida-rapida/hamburguesas/variantes.js'),
  'gastronomia/comida-rapida/pizzas':                 () => import('./comida-rapida/pizzas/variantes.js'),
  'gastronomia/comida-rapida/hot-dogs':               () => import('./comida-rapida/hot-dogs/variantes.js'),
  'gastronomia/comida-rapida/empanadas':              () => import('./comida-rapida/empanadas/variantes.js'),
  // Cocina del mundo
  'gastronomia/cocina-del-mundo/sushi':               () => import('./cocina-del-mundo/sushi/variantes.js'),
  'gastronomia/cocina-del-mundo/comida-china':        () => import('./cocina-del-mundo/comida-china/variantes.js'),
  'gastronomia/cocina-del-mundo/comida-italiana':     () => import('./cocina-del-mundo/comida-italiana/variantes.js'),
  'gastronomia/cocina-del-mundo/comida-mexicana':     () => import('./cocina-del-mundo/comida-mexicana/variantes.js'),
  // Cocina local
  'gastronomia/cocina-local/platos-tipicos':          () => import('./cocina-local/platos-tipicos/variantes.js'),
  'gastronomia/cocina-local/parrilla-asados':         () => import('./cocina-local/parrilla-asados/variantes.js'),
  'gastronomia/cocina-local/mariscos-ceviche':        () => import('./cocina-local/mariscos-ceviche/variantes.js'),
  // Cafetería y postres
  'gastronomia/cafeteria-postres/cafeteria':          () => import('./cafeteria-postres/cafeteria/variantes.js'),
  'gastronomia/cafeteria-postres/postres':            () => import('./cafeteria-postres/postres/variantes.js'),
  'gastronomia/cafeteria-postres/tortas-pedido':      () => import('./cafeteria-postres/tortas-pedido/variantes.js'),
  // Bebidas delivery
  'gastronomia/bebidas-delivery/jugos-smoothies':     () => import('./bebidas-delivery/jugos-smoothies/variantes.js'),
  'gastronomia/bebidas-delivery/bebidas-calientes':   () => import('./bebidas-delivery/bebidas-calientes/variantes.js'),
};

export async function getVariantesPorRuta(ruta) {
  const loader = MAPA[ruta];
  if (!loader) return null;
  const mod = await loader();
  return mod.variantes ?? null;
}
