/**
 * ÍNDICE — Supermercado y Alimentos
 * Ruta base: admin/src/variantes/supermercado/
 *
 * Los atributos tipo:"imagen" permiten al cliente elegir
 * variedades, cortes y presentaciones viendo la foto real
 * subida por el vendedor en el panel admin.
 *
 * NOTA condicion:
 *   Perecederos (frutas, verduras, carnes, pescados, pan, huevos)
 *   → condicion: ["Nuevo / Fresco"]
 *   No perecederos (abarrotes, conservas, bebidas envasadas, embutidos)
 *   → condicion: ["Nuevo", "Caja Abierta"] o array completo
 */

export const MAPA = {
  // Abarrotes
  'supermercado/abarrotes/arroz-cereales':           () => import('./abarrotes/arroz-cereales/variantes.js'),
  'supermercado/abarrotes/fideos-pastas':            () => import('./abarrotes/fideos-pastas/variantes.js'),
  'supermercado/abarrotes/enlatados-conservas':      () => import('./abarrotes/enlatados-conservas/variantes.js'),
  'supermercado/abarrotes/aceites-condimentos':      () => import('./abarrotes/aceites-condimentos/variantes.js'),
  'supermercado/abarrotes/snacks-golosinas':         () => import('./abarrotes/snacks-golosinas/variantes.js'),
  // Frescos
  'supermercado/frescos/frutas':                     () => import('./frescos/frutas/variantes.js'),
  'supermercado/frescos/verduras':                   () => import('./frescos/verduras/variantes.js'),
  'supermercado/frescos/panaderia':                  () => import('./frescos/panaderia/variantes.js'),
  // Carnes y pescados
  'supermercado/carnes-pescados/carne-res':          () => import('./carnes-pescados/carne-res/variantes.js'),
  'supermercado/carnes-pescados/pollo':              () => import('./carnes-pescados/pollo/variantes.js'),
  'supermercado/carnes-pescados/cerdo':              () => import('./carnes-pescados/cerdo/variantes.js'),
  'supermercado/carnes-pescados/pescados-mariscos':  () => import('./carnes-pescados/pescados-mariscos/variantes.js'),
  'supermercado/carnes-pescados/embutidos':          () => import('./carnes-pescados/embutidos/variantes.js'),
  // Lácteos y refrigerados
  'supermercado/lacteos-refrigerados/lacteos':       () => import('./lacteos-refrigerados/lacteos/variantes.js'),
  'supermercado/lacteos-refrigerados/huevos':        () => import('./lacteos-refrigerados/huevos/variantes.js'),
  'supermercado/lacteos-refrigerados/bebidas':       () => import('./lacteos-refrigerados/bebidas/variantes.js'),
};

export async function getVariantesPorRuta(ruta) {
  const loader = MAPA[ruta];
  if (!loader) return null;
  const mod = await loader();
  return mod.variantes ?? null;
}
