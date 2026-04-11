/**
 * ÍNDICE — Niños y Bebés
 * Ruta base: admin/src/variantes/ninos-bebes/
 */

export const MAPA = {
  // Ropa bebé / niños
  'ninos-bebes/ropa-bebe/bodies':                       () => import('./ropa-bebe/bodies/variantes.js'),
  'ninos-bebes/ropa-bebe/conjuntos':                    () => import('./ropa-bebe/conjuntos/variantes.js'),
  'ninos-bebes/ropa-bebe/pijamas':                      () => import('./ropa-bebe/pijamas/variantes.js'),
  'ninos-bebes/ropa-bebe/zapatos-bebe':                 () => import('./ropa-bebe/zapatos-bebe/variantes.js'),
  'ninos-bebes/ropa-bebe/vestidos':                     () => import('./ropa-bebe/vestidos/variantes.js'),
  'ninos-bebes/ropa-bebe/abrigos':                      () => import('./ropa-bebe/abrigos/variantes.js'),
  'ninos-bebes/ropa-bebe/pantalones':                   () => import('./ropa-bebe/pantalones/variantes.js'),
  'ninos-bebes/ropa-bebe/sandalias':                    () => import('./ropa-bebe/sandalias/variantes.js'),
  // Alimentación
  'ninos-bebes/alimentacion/lactancia':                 () => import('./alimentacion/lactancia/variantes.js'),
  'ninos-bebes/alimentacion/papillas-comida':           () => import('./alimentacion/papillas-comida/variantes.js'),
  'ninos-bebes/alimentacion/utensilios-alimentacion':   () => import('./alimentacion/utensilios-alimentacion/variantes.js'),
  // Juguetes
  'ninos-bebes/juguetes/educativos':                    () => import('./juguetes/educativos/variantes.js'),
  'ninos-bebes/juguetes/electronicos':                  () => import('./juguetes/electronicos/variantes.js'),
  'ninos-bebes/juguetes/munecas':                       () => import('./juguetes/munecas/variantes.js'),
  'ninos-bebes/juguetes/coches-juguete':                () => import('./juguetes/coches-juguete/variantes.js'),
  // Accesorios bebé
  'ninos-bebes/accesorios-bebe/coches-cochecitos':      () => import('./accesorios-bebe/coches-cochecitos/variantes.js'),
  'ninos-bebes/accesorios-bebe/sillas-auto':            () => import('./accesorios-bebe/sillas-auto/variantes.js'),
  'ninos-bebes/accesorios-bebe/cunas-moises':           () => import('./accesorios-bebe/cunas-moises/variantes.js'),
  'ninos-bebes/accesorios-bebe/panialeras':             () => import('./accesorios-bebe/panialeras/variantes.js'),
  'ninos-bebes/accesorios-bebe/baneras':                () => import('./accesorios-bebe/baneras/variantes.js'),
  'ninos-bebes/accesorios-bebe/andadores':              () => import('./accesorios-bebe/andadores/variantes.js'),
  'ninos-bebes/accesorios-bebe/monitores':              () => import('./accesorios-bebe/monitores/variantes.js'),
  'ninos-bebes/accesorios-bebe/cambiadores':            () => import('./accesorios-bebe/cambiadores/variantes.js'),
};

export async function getVariantesPorRuta(ruta) {
  const loader = MAPA[ruta];
  if (!loader) return null;
  const mod = await loader();
  return mod.variantes ?? null;
}
