/**
 * LIMPIEZA + RE-SEED — Elimina TODAS las categorías globales y las recrea desde filesystem
 *
 * Uso:
 *   node server/seeds/cleanAndReseed.js
 *   node server/seeds/cleanAndReseed.js --dry-run
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import mongoose from "mongoose";
import fs from "fs";
import CategoryModel from "../models/category.model.js";

const VARIANTES_DIR = path.resolve(__dirname, "../../admin/src/variantes");
const DRY_RUN = process.argv.includes("--dry-run");

/* ======================================================
   SLUG → NAME (del seedCategories.js original)
====================================================== */
const SLUG_TO_NAME = {
  electronica: "Electrónica",
  moda: "Moda",
  hogar: "Hogar y Cocina",
  automotriz: "Automotriz",
  gaming: "Gaming y Tecnología",
  belleza: "Belleza y Salud",
  deportes: "Deportes y Aire Libre",
  "ninos-bebes": "Niños y Bebés",
  oficina: "Oficina y Papelería",
  herramientas: "Herramientas y Construcción",
  supermercado: "Supermercado y Alimentos",
  gastronomia: "Gastronomía y Delivery",
  mascotas: "Mascotas",
  instrumentos: "Instrumentos Musicales",
  "libros-cine-musica": "Libros, Cine y Música",
  farmacia: "Farmacia OTC",
  "arte-manualidades": "Arte y Manualidades",
  "servicios-digitales": "Servicios Digitales",
};

function slugToName(slug) {
  if (SLUG_TO_NAME[slug]) return SLUG_TO_NAME[slug];
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* ======================================================
   MAIN
====================================================== */
async function main() {
  console.log("========================================");
  console.log("  LIMPIEZA + RE-SEED CATEGORÍAS");
  console.log(`  Modo: ${DRY_RUN ? "DRY RUN" : "ESCRITURA"}`);
  console.log("========================================\n");

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✓ Conectado a MongoDB\n");

  // ── PASO 1: Eliminar TODAS las categorías globales ──
  const beforeCount = await CategoryModel.countDocuments({ storeId: null });
  console.log(`── PASO 1: Eliminar categorías globales ──`);
  console.log(`  Categorías globales actuales: ${beforeCount}`);

  if (!DRY_RUN) {
    const result = await CategoryModel.deleteMany({ storeId: null });
    console.log(`  ✓ Eliminadas: ${result.deletedCount} categorías\n`);
  } else {
    console.log(`  [DRY] Se eliminarían ${beforeCount} categorías\n`);
  }

  // ── PASO 2: Leer filesystem y crear L1 → L2 → L3 ──
  console.log(`── PASO 2: Crear categorías desde filesystem ──`);

  const nivel1Dirs = fs
    .readdirSync(VARIANTES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  let created = 0;
  let totalExpected = 0;

  for (const n1Slug of nivel1Dirs) {
    const n1Path = path.join(VARIANTES_DIR, n1Slug);
    const n1Name = slugToName(n1Slug);
    totalExpected++;

    // Crear L1
    let cat1Doc;
    if (!DRY_RUN) {
      cat1Doc = await CategoryModel.findOneAndUpdate(
        { storeId: null, path: n1Slug },
        {
          $setOnInsert: {
            storeId: null,
            name: n1Name,
            slug: n1Slug,
            parentId: null,
            parentCatName: "",
            ancestors: [],
            depth: 0,
            path: n1Slug,
            status: "active",
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      created++;
      console.log(`\n  [L1] ${n1Name} (${n1Slug})`);
    } else {
      console.log(`\n  [DRY][L1] ${n1Name} (${n1Slug})`);
    }

    // Leer subdirectorios L2
    const nivel2Dirs = fs
      .readdirSync(n1Path, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    for (const n2Slug of nivel2Dirs) {
      const n2FullPath = path.join(n1Path, n2Slug);
      const n2CatPath = `${n1Slug}/${n2Slug}`;
      const n2Name = slugToName(n2Slug);

      // Verificar que L2 tiene contenido útil (subdirectorios con variantes.js o variantes.js propio)
      const n3Dirs = fs
        .readdirSync(n2FullPath, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

      const hasL3Children = n3Dirs.some((d) =>
        fs.existsSync(path.join(n2FullPath, d, "variantes.js"))
      );
      const isLeaf = fs.existsSync(path.join(n2FullPath, "variantes.js"));

      if (!hasL3Children && !isLeaf) continue;

      totalExpected++;

      let cat2Doc;
      if (!DRY_RUN) {
        cat2Doc = await CategoryModel.findOneAndUpdate(
          { storeId: null, path: n2CatPath },
          {
            $setOnInsert: {
              storeId: null,
              name: n2Name,
              slug: n2Slug,
              parentId: cat1Doc._id,
              parentCatName: n1Name,
              ancestors: [{ _id: cat1Doc._id, name: cat1Doc.name, slug: cat1Doc.slug }],
              depth: 1,
              path: n2CatPath,
              status: "active",
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        created++;
        console.log(`    [L2] ${n2Name} (${n2CatPath})`);
      } else {
        console.log(`    [DRY][L2] ${n2Name} (${n2CatPath})`);
      }

      // Crear L3: subdirectorios que contienen variantes.js
      for (const n3Slug of n3Dirs.sort()) {
        const n3FullPath = path.join(n2FullPath, n3Slug);
        if (!fs.existsSync(path.join(n3FullPath, "variantes.js"))) continue;

        const n3CatPath = `${n2CatPath}/${n3Slug}`;
        const n3Name = slugToName(n3Slug);
        totalExpected++;

        if (!DRY_RUN) {
          await CategoryModel.findOneAndUpdate(
            { storeId: null, path: n3CatPath },
            {
              $setOnInsert: {
                storeId: null,
                name: n3Name,
                slug: n3Slug,
                parentId: cat2Doc._id,
                parentCatName: n2Name,
                ancestors: [
                  { _id: cat1Doc._id, name: cat1Doc.name, slug: cat1Doc.slug },
                  { _id: cat2Doc._id, name: cat2Doc.name, slug: cat2Doc.slug },
                ],
                depth: 2,
                path: n3CatPath,
                status: "active",
              },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          created++;
          console.log(`      [L3] ${n3Name} (${n3CatPath})`);
        } else {
          console.log(`      [DRY][L3] ${n3Name} (${n3CatPath})`);
        }
      }
    }
  }

  // ── PASO 3: Verificación ──
  console.log(`\n── PASO 3: Verificación ──`);
  const afterCount = await CategoryModel.countDocuments({ storeId: null });
  const l1Count = await CategoryModel.countDocuments({ storeId: null, depth: 0 });
  const l2Count = await CategoryModel.countDocuments({ storeId: null, depth: 1 });
  const l3Count = await CategoryModel.countDocuments({ storeId: null, depth: 2 });

  console.log(`  En DB ahora: ${afterCount} categorías globales`);
  console.log(`    L1: ${l1Count}`);
  console.log(`    L2: ${l2Count}`);
  console.log(`    L3: ${l3Count}`);

  console.log("\n========================================");
  console.log("  RESUMEN");
  console.log("========================================");
  console.log(`  Eliminadas:   ${beforeCount}`);
  console.log(`  Creadas:      ${DRY_RUN ? "(dry run)" : created}`);
  console.log(`  Total en DB:  ${afterCount}`);
  console.log(`  Esperadas:    ${totalExpected}`);
  console.log(`  Match:        ${afterCount === totalExpected ? "✓ PERFECTO" : "✗ DISCREPANCIA"}`);
  console.log("========================================\n");

  await mongoose.disconnect();
  console.log("✓ Desconectado de MongoDB");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
