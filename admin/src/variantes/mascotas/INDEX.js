/**
 * ÍNDICE — Mascotas
 * Ruta base: admin/src/variantes/mascotas/
 *
 * Los atributos tipo:"imagen" son seleccionados por el cliente
 * desde fotos reales subidas por el vendedor en el panel admin.
 */

export const MAPA = {
  // Perros
  'mascotas/perros/alimento-perros':            () => import('./perros/alimento-perros/variantes.js'),
  'mascotas/perros/snacks-premios':             () => import('./perros/snacks-premios/variantes.js'),
  'mascotas/perros/accesorios-perros':          () => import('./perros/accesorios-perros/variantes.js'),
  'mascotas/perros/ropa-perros':                () => import('./perros/ropa-perros/variantes.js'),
  'mascotas/perros/salud-higiene-perros':       () => import('./perros/salud-higiene-perros/variantes.js'),
  // Gatos
  'mascotas/gatos/alimento-gatos':              () => import('./gatos/alimento-gatos/variantes.js'),
  'mascotas/gatos/accesorios-gatos':            () => import('./gatos/accesorios-gatos/variantes.js'),
  'mascotas/gatos/salud-higiene-gatos':         () => import('./gatos/salud-higiene-gatos/variantes.js'),
  // Otras mascotas
  'mascotas/otras-mascotas/aves':               () => import('./otras-mascotas/aves/variantes.js'),
  'mascotas/otras-mascotas/roedores':           () => import('./otras-mascotas/roedores/variantes.js'),
  'mascotas/otras-mascotas/reptiles':           () => import('./otras-mascotas/reptiles/variantes.js'),
  // Acuarios
  'mascotas/acuarios/peces-acuarios':           () => import('./acuarios/peces-acuarios/variantes.js'),
  'mascotas/acuarios/equipamiento-acuario':     () => import('./acuarios/equipamiento-acuario/variantes.js'),
};

export async function getVariantesPorRuta(ruta) {
  const loader = MAPA[ruta];
  if (!loader) return null;
  const mod = await loader();
  return mod.variantes ?? null;
}
