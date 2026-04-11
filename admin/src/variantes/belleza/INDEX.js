/**
 * ÍNDICE — Belleza y Salud
 * Ruta base: admin/src/variantes/belleza/
 *
 * Los atributos tipo:"imagen" son seleccionados por el cliente
 * desde fotos subidas por el vendedor en el panel admin.
 */

export const MAPA = {
  // Cuidado Personal
  'belleza/cuidado-personal/afeitadoras':                   () => import('./cuidado-personal/afeitadoras/variantes.js'),
  'belleza/cuidado-personal/secadoras-cabello':             () => import('./cuidado-personal/secadoras-cabello/variantes.js'),
  'belleza/cuidado-personal/depiladoras':                   () => import('./cuidado-personal/depiladoras/variantes.js'),
  'belleza/cuidado-personal/cuidado-piel':                  () => import('./cuidado-personal/cuidado-piel/variantes.js'),
  // Maquillaje
  'belleza/maquillaje/bases':                               () => import('./maquillaje/bases/variantes.js'),
  'belleza/maquillaje/labiales':                            () => import('./maquillaje/labiales/variantes.js'),
  'belleza/maquillaje/ojos':                                () => import('./maquillaje/ojos/variantes.js'),
  'belleza/maquillaje/coloretes-bronzer':                   () => import('./maquillaje/coloretes-bronzer/variantes.js'),
  'belleza/maquillaje/kits-maquillaje':                     () => import('./maquillaje/kits-maquillaje/variantes.js'),
  // Cabello
  'belleza/cabello/tintes-coloracion':                      () => import('./cabello/tintes-coloracion/variantes.js'),
  'belleza/cabello/tratamientos-cabello':                   () => import('./cabello/tratamientos-cabello/variantes.js'),
  'belleza/cabello/estiladoras-rizadoras':                  () => import('./cabello/estiladoras-rizadoras/variantes.js'),
  // Salud
  'belleza/salud/tensiometros':                             () => import('./salud/tensiometros/variantes.js'),
  'belleza/salud/termometros':                              () => import('./salud/termometros/variantes.js'),
  'belleza/salud/vitaminas-suplementos':                    () => import('./salud/vitaminas-suplementos/variantes.js'),
  'belleza/salud/mascarillas-proteccion':                   () => import('./salud/mascarillas-proteccion/variantes.js'),
};

export async function getVariantesPorRuta(ruta) {
  const loader = MAPA[ruta];
  if (!loader) return null;
  const mod = await loader();
  return mod.variantes ?? null;
}
