/**
 * SEED — Crear categorías globales de 3 niveles desde la estructura de variantes
 *
 * Uso:
 *   node server/seeds/seedCategories.js
 *   node server/seeds/seedCategories.js --dry-run
 *
 * Requiere: MONGODB_URI en .env
 *
 * Lee la estructura de carpetas de admin/src/variantes/ y crea
 * las categorías en MongoDB con ancestors, depth y path correctos.
 * storeId: null (categorías globales, gestionadas por SUPER_ADMIN).
 *
 * Idempotente: usa findOneAndUpdate con upsert.
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import CategoryModel from "../models/category.model.js";

const VARIANTES_DIR = path.resolve(__dirname, "../../admin/src/variantes");
const DRY_RUN = process.argv.includes("--dry-run");

/* ======================================================
   HELPERS
====================================================== */

/**
 * Convierte slug a nombre legible.
 * "arte-manualidades" → "Arte y Manualidades"
 * "software-oficina"  → "Software Oficina"
 */
const SLUG_TO_NAME = {
  "electronica": "Electrónica",
  "moda": "Moda",
  "hogar": "Hogar y Cocina",
  "automotriz": "Automotriz",
  "gaming": "Gaming y Tecnología",
  "belleza": "Belleza y Salud",
  "deportes": "Deportes y Aire Libre",
  "ninos-bebes": "Niños y Bebés",
  "oficina": "Oficina y Papelería",
  "herramientas": "Herramientas y Construcción",
  "supermercado": "Supermercado y Alimentos",
  "gastronomia": "Gastronomía y Delivery",
  "mascotas": "Mascotas",
  "instrumentos": "Instrumentos Musicales",
  "libros-cine-musica": "Libros, Cine y Música",
  "farmacia": "Farmacia OTC",
  "arte-manualidades": "Arte y Manualidades",
  "servicios-digitales": "Servicios Digitales",
};

function slugToName(slug) {
  if (SLUG_TO_NAME[slug]) return SLUG_TO_NAME[slug];
  return slug
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Lee la estructura de carpetas y devuelve un árbol de rutas.
 * Solo incluye carpetas que contienen variantes.js en sus hojas.
 */
function buildCategoryTree() {
  const tree = [];

  // Nivel 1: carpetas raíz (electronica, moda, etc.)
  const nivel1Dirs = fs.readdirSync(VARIANTES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  for (const n1Slug of nivel1Dirs) {
    const n1Path = path.join(VARIANTES_DIR, n1Slug);
    const cat1 = { slug: n1Slug, name: slugToName(n1Slug), children: [] };

    // Nivel 2: subcarpetas
    const nivel2Dirs = fs.readdirSync(n1Path, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .sort();

    for (const n2Slug of nivel2Dirs) {
      const n2Path = path.join(n1Path, n2Slug);
      const cat2 = { slug: n2Slug, name: slugToName(n2Slug), children: [] };

      // Nivel 3: subcarpetas que contienen variantes.js
      const nivel3Dirs = fs.readdirSync(n2Path, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name)
        .sort();

      for (const n3Slug of nivel3Dirs) {
        const n3Path = path.join(n2Path, n3Slug);
        const hasVariantes = fs.existsSync(path.join(n3Path, "variantes.js"));
        if (hasVariantes) {
          cat2.children.push({ slug: n3Slug, name: slugToName(n3Slug) });
        }
      }

      // Si nivel 2 tiene variantes.js directamente (sin nivel 3)
      if (fs.existsSync(path.join(n2Path, "variantes.js")) && cat2.children.length === 0) {
        // Este nivel 2 ES la hoja
        cat2.isLeaf = true;
      }

      if (cat2.children.length > 0 || cat2.isLeaf) {
        cat1.children.push(cat2);
      }
    }

    if (cat1.children.length > 0) {
      tree.push(cat1);
    }
  }

  return tree;
}

/* ======================================================
   MAIN
====================================================== */
async function main() {
  console.log("========================================");
  console.log("  SEED CATEGORÍAS GLOBALES");
  console.log(`  Modo: ${DRY_RUN ? "DRY RUN" : "ESCRITURA"}`);
  console.log("========================================\n");

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✓ Conectado a MongoDB\n");

  const tree = buildCategoryTree();

  let created = 0;
  let existed = 0;
  let total = 0;

  for (const cat1 of tree) {
    total++;
    console.log(`\nNivel 1: ${cat1.name} (${cat1.slug})`);

    // Crear/encontrar nivel 1
    let cat1Doc;
    if (DRY_RUN) {
      console.log(`  [DRY] Crear nivel 1: ${cat1.slug}`);
      cat1Doc = { _id: new mongoose.Types.ObjectId(), name: cat1.name, slug: cat1.slug };
    } else {
      cat1Doc = await CategoryModel.findOneAndUpdate(
        { storeId: null, parentId: null, slug: cat1.slug },
        {
          $setOnInsert: {
            storeId: null,
            name: cat1.name,
            slug: cat1.slug,
            parentId: null,
            ancestors: [],
            depth: 0,
            path: cat1.slug,
            status: "active",
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (cat1Doc.__v === 0) {
        created++;
        console.log(`  ✓ Creada: ${cat1.name}`);
      } else {
        existed++;
        console.log(`  ∃ Existe: ${cat1.name}`);
      }
    }

    for (const cat2 of cat1.children) {
      total++;
      const cat2Path = `${cat1.slug}/${cat2.slug}`;
      console.log(`  Nivel 2: ${cat2.name} (${cat2Path})`);

      let cat2Doc;
      if (DRY_RUN) {
        console.log(`    [DRY] Crear nivel 2: ${cat2Path}`);
        cat2Doc = { _id: new mongoose.Types.ObjectId(), name: cat2.name, slug: cat2.slug };
      } else {
        cat2Doc = await CategoryModel.findOneAndUpdate(
          { storeId: null, parentId: cat1Doc._id, slug: cat2.slug },
          {
            $setOnInsert: {
              storeId: null,
              name: cat2.name,
              slug: cat2.slug,
              parentId: cat1Doc._id,
              parentCatName: cat1.name,
              ancestors: [{ _id: cat1Doc._id, name: cat1Doc.name, slug: cat1Doc.slug }],
              depth: 1,
              path: cat2Path,
              status: "active",
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        if (cat2Doc.__v === 0) {
          created++;
          console.log(`    ✓ Creada: ${cat2.name}`);
        } else {
          existed++;
          console.log(`    ∃ Existe: ${cat2.name}`);
        }
      }

      for (const cat3 of cat2.children) {
        total++;
        const cat3Path = `${cat2Path}/${cat3.slug}`;

        if (DRY_RUN) {
          console.log(`      [DRY] Crear nivel 3: ${cat3Path}`);
        } else {
          const cat3Doc = await CategoryModel.findOneAndUpdate(
            { storeId: null, parentId: cat2Doc._id, slug: cat3.slug },
            {
              $setOnInsert: {
                storeId: null,
                name: cat3.name,
                slug: cat3.slug,
                parentId: cat2Doc._id,
                parentCatName: cat2.name,
                ancestors: [
                  { _id: cat1Doc._id, name: cat1Doc.name, slug: cat1Doc.slug },
                  { _id: cat2Doc._id, name: cat2Doc.name, slug: cat2Doc.slug },
                ],
                depth: 2,
                path: cat3Path,
                status: "active",
              },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          if (cat3Doc.__v === 0) {
            created++;
            console.log(`      ✓ Creada: ${cat3.name} (${cat3Path})`);
          } else {
            existed++;
            console.log(`      ∃ Existe: ${cat3.name}`);
          }
        }
      }
    }
  }

  console.log("\n========================================");
  console.log("  RESUMEN");
  console.log("========================================");
  console.log(`  Total procesadas: ${total}`);
  console.log(`  Creadas:          ${created}`);
  console.log(`  Ya existían:      ${existed}`);
  console.log("========================================\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error("Error fatal:", err);
  process.exit(1);
});
