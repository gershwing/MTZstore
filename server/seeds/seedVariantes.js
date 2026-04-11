/**
 * SEED — Poblar Attribute + CategoryAttribute desde los variantes.js
 *
 * Uso:
 *   node server/seeds/seedVariantes.js
 *   node server/seeds/seedVariantes.js --dry-run
 *
 * Requiere: MONGODB_URI en .env
 *
 * Para cada variantes.js:
 * 1. Parsear el archivo (regex, sin eval)
 * 2. Buscar la Category por path
 * 3. Upsert Attribute (por code)
 * 4. Upsert CategoryAttribute
 *
 * Al final crea la tienda oficial de plataforma si no existe.
 *
 * Idempotente: ejecutar múltiples veces es seguro (upsert).
 * Genera SKIPPED.log con rutas que no encontraron categoría.
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import AttributeModel from "../models/attribute.model.js";
import CategoryAttributeModel from "../models/categoryAttribute.model.js";
import CategoryModel from "../models/category.model.js";
import StoreModel from "../models/store.model.js";
import UserModel from "../models/user.model.js";

/* ======================================================
   CONFIG
====================================================== */
const VARIANTES_DIR = path.resolve(__dirname, "../../admin/src/variantes");
const SKIPPED_LOG = path.resolve(__dirname, "SKIPPED.log");
const DRY_RUN = process.argv.includes("--dry-run");

/* ======================================================
   HELPERS
====================================================== */

function findVariantesFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findVariantesFiles(full));
    } else if (entry.name === "variantes.js") {
      results.push(full);
    }
  }
  return results;
}

function filePathToCategoryPath(filePath) {
  const rel = path.relative(VARIANTES_DIR, filePath);
  return path.dirname(rel).split(path.sep).join("/");
}

/**
 * Parsea un variantes.js y extrae los atributos planos.
 * Retorna: [{ key, tipo, requerido, opciones, guia_vendedor, nota }]
 * Ignora estructuras anidadas complejas (getVariantesModelo, etc.)
 */
function parseVariantesFile(filePath) {
  const src = fs.readFileSync(filePath, "utf-8");
  const attributes = [];

  const variantesMatch = src.match(
    /export\s+const\s+variantes\s*=\s*\{([\s\S]*?)\};\s*\/\/\s*fin variantes/
  );
  if (!variantesMatch) {
    return { attributes, skipped: true, reason: "no bloque variantes" };
  }

  const body = variantesMatch[1];
  const lines = body.split("\n");
  let currentKey = null;
  let braceDepth = 0;
  let blockLines = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (braceDepth === 0) {
      const keyMatch = trimmed.match(/^(\w+)\s*:\s*\{/);
      if (keyMatch) {
        currentKey = keyMatch[1];
        braceDepth = 0;
        blockLines = [line];
        for (const ch of line) {
          if (ch === "{") braceDepth++;
          if (ch === "}") braceDepth--;
        }
        if (braceDepth === 0) {
          attributes.push(parseAttributeBlock(currentKey, blockLines.join("\n")));
          currentKey = null;
          blockLines = [];
        }
        continue;
      }
    }

    if (currentKey && braceDepth > 0) {
      blockLines.push(line);
      for (const ch of line) {
        if (ch === "{") braceDepth++;
        if (ch === "}") braceDepth--;
      }
      if (braceDepth === 0) {
        attributes.push(parseAttributeBlock(currentKey, blockLines.join("\n")));
        currentKey = null;
        blockLines = [];
      }
    }
  }

  // Post-process: expand "modelos" into individual sub-attributes
  const modelosIdx = attributes.findIndex((a) => a.key === "modelos");
  if (modelosIdx !== -1) {
    const modelosAttr = attributes[modelosIdx];
    const { modelNames, subAttributes } = parseModelosBlock(modelosAttr._rawBlock);

    const expanded = [];

    // modelos itself becomes a select with model names as options
    // Sanitize model names: Mongoose Maps don't allow "." in keys
    const safeModelNames = modelNames.map((n) => n.replace(/\./g, "_"));
    expanded.push({
      key: "modelos",
      tipo: "texto",
      requerido: false,
      opciones: safeModelNames,
      allowedOptions: safeModelNames,
    });

    // Each merged sub-attribute — mark as variant and carry perModel
    for (const [subKey, data] of Object.entries(subAttributes)) {
      // Build perModel mapping using option values (not labels)
      // Sanitize model keys: Mongoose Maps don't allow "." in keys
      const perModelValues = {};
      for (const [model, labels] of Object.entries(data.perModel || {})) {
        const safeKey = model.replace(/\./g, "_");
        perModelValues[safeKey] = labels.map((label) =>
          label
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9\-áéíóúñü\/\.\+]/g, "")
        ).filter(Boolean);
      }

      expanded.push({
        key: subKey,
        tipo: data.tipo,
        requerido: false,
        variante: true,
        opciones: [...data.opciones],
        perModel: Object.keys(perModelValues).length > 0 ? perModelValues : undefined,
      });
    }

    attributes.splice(modelosIdx, 1, ...expanded);
  }

  return { attributes, skipped: false };
}

function parseAttributeBlock(key, block) {
  const attr = { key };

  const tipoMatch = block.match(/tipo\s*:\s*"([^"]+)"/);
  attr.tipo = tipoMatch ? tipoMatch[1] : "texto";

  attr.requerido = /requerido\s*:\s*true/.test(block);
  attr.variante = /variante\s*:\s*true/.test(block);

  const opcionesMatch = block.match(/opciones\s*:\s*\[([\s\S]*?)\]/);
  if (opcionesMatch) {
    attr.opciones = extractStrings(opcionesMatch[1]);
  }

  const guiaMatch = block.match(/guia_vendedor\s*:\s*\[([\s\S]*?)\]/);
  if (guiaMatch) {
    attr.guia_vendedor = extractStrings(guiaMatch[1]);
  }

  const notaMatch = block.match(/nota\s*:\s*"([^"]+)"/);
  if (notaMatch) attr.nota = notaMatch[1];

  attr._rawBlock = block;
  return attr;
}

/**
 * Extrae sub-atributos de un bloque de modelo individual
 * y los mergea en el acumulador subAttributes.
 */
function processModelBlock(modelName, block, subAttributes) {
  const subAttrRegex = /(\w+)\s*:\s*\{[^}]*tipo\s*:\s*"([^"]+)"[^}]*\}/g;
  let match;

  while ((match = subAttrRegex.exec(block)) !== null) {
    const key = match[1];
    const tipo = match[2];
    const fullMatch = match[0];

    const opcionesMatch = fullMatch.match(/opciones\s*:\s*\[([\s\S]*?)\]/);
    const opciones = opcionesMatch ? extractStrings(opcionesMatch[1]) : [];

    if (!subAttributes[key]) {
      subAttributes[key] = { tipo, opciones: new Set(), perModel: {} };
    }
    for (const opt of opciones) {
      subAttributes[key].opciones.add(opt);
    }

    // Track options per model for filtering
    subAttributes[key].perModel[modelName] = opciones;
  }
}

/**
 * Parsea un bloque `modelos` anidado y extrae:
 * - modelNames: nombres de los modelos (para select)
 * - subAttributes: atributos mergeados de todos los modelos
 */
function parseModelosBlock(block) {
  const modelNames = [];
  const subAttributes = {};

  const lines = block.split("\n");
  let currentModel = null;
  let modelBraceDepth = 0;
  let modelLines = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (modelBraceDepth === 0) {
      const modelKeyMatch = trimmed.match(/^[""\u201C\u201D]([^""\u201C\u201D]+)[""\u201C\u201D]\s*:\s*\{/);
      if (modelKeyMatch) {
        currentModel = modelKeyMatch[1];
        modelNames.push(currentModel);
        modelBraceDepth = 0;
        modelLines = [line];
        for (const ch of line) {
          if (ch === "{") modelBraceDepth++;
          if (ch === "}") modelBraceDepth--;
        }
        if (modelBraceDepth === 0) {
          processModelBlock(currentModel, modelLines.join("\n"), subAttributes);
          currentModel = null;
          modelLines = [];
        }
        continue;
      }
    }

    if (currentModel && modelBraceDepth > 0) {
      modelLines.push(line);
      for (const ch of line) {
        if (ch === "{") modelBraceDepth++;
        if (ch === "}") modelBraceDepth--;
      }
      if (modelBraceDepth === 0) {
        processModelBlock(currentModel, modelLines.join("\n"), subAttributes);
        currentModel = null;
        modelLines = [];
      }
    }
  }

  return { modelNames, subAttributes };
}

function extractStrings(raw) {
  const results = [];
  const re = /"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const cleaned = m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    if (cleaned.trim()) results.push(cleaned);
  }
  return results;
}

function keyToName(key) {
  return key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Mapeo de tipo variantes.js → Attribute.type en DB.
 *   "texto"  → "select"
 *   "imagen" → "image_upload"
 */
function mapTipo(tipo) {
  if (tipo === "imagen") return "image_upload";
  return "select";
}

function buildOptions(attr) {
  const source =
    attr.tipo === "imagen"
      ? attr.guia_vendedor || attr.opciones || []
      : attr.opciones || [];

  return source
    .map((label) => ({
      label,
      value: label
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-áéíóúñü\/\.\+]/g, ""),
    }))
    .filter((o) => o.value);
}

/* ======================================================
   MAIN
====================================================== */
async function main() {
  console.log("========================================");
  console.log("  SEED VARIANTES → MongoDB");
  console.log(`  Modo: ${DRY_RUN ? "DRY RUN (no escribe)" : "ESCRITURA"}`);
  console.log("========================================\n");

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✓ Conectado a MongoDB\n");

  const files = findVariantesFiles(VARIANTES_DIR);
  console.log(`Encontrados: ${files.length} archivos variantes.js\n`);

  // Stats
  let attrsCreated = 0;
  let attrsExisted = 0;
  let relationsCreated = 0;
  let relationsExisted = 0;
  let categoriesNotFound = 0;
  let filesSkipped = 0;
  const skippedLines = [];

  // Cache: code → { _id, type }
  const attrCache = new Map();

  // Track valid options per attribute for stale cleanup
  const validOptions = new Map(); // Map<code, Set<value>>

  // Track valid relations per category for cleanup phase
  const validRelations = new Map(); // Map<categoryId, Set<attributeId>>

  for (const filePath of files) {
    const catPath = filePathToCategoryPath(filePath);
    console.log(`\n─── ${catPath} ───`);

    // Buscar categoría por path
    const category = await CategoryModel.findOne({
      path: catPath,
      storeId: null,
    }).lean();

    if (!category) {
      console.warn(`  ⚠ Categoría NO encontrada: path="${catPath}"`);
      categoriesNotFound++;
      skippedLines.push(`[CATEGORY_NOT_FOUND] ${catPath}`);
      continue;
    }

    // Parsear atributos
    const { attributes: attrs, skipped, reason } = parseVariantesFile(filePath);

    if (skipped) {
      console.warn(`  ⚠ Archivo con estructura no estándar: ${reason}`);
      filesSkipped++;
      skippedLines.push(`[PARSE_FAILED] ${catPath} — ${reason}`);
      continue;
    }

    console.log(`  ${attrs.length} atributos encontrados`);

    for (let sortOrder = 0; sortOrder < attrs.length; sortOrder++) {
      const attr = attrs[sortOrder];
      const code = attr.key;
      const type = mapTipo(attr.tipo);
      const options = buildOptions(attr);
      const name = keyToName(code);

      // Track valid options for stale cleanup
      if (!validOptions.has(code)) {
        validOptions.set(code, new Set());
      }
      for (const opt of options) {
        validOptions.get(code).add(opt.value);
      }

      // 1. Upsert Attribute
      let attrId = attrCache.get(code);

      if (!attrId) {
        if (DRY_RUN) {
          console.log(`    [DRY] Attribute: ${code} (${type}, ${options.length} opts)`);
          attrId = new mongoose.Types.ObjectId();
        } else {
          const existing = await AttributeModel.findOne({ code });
          if (existing) {
            attrId = existing._id;
            attrsExisted++;

            // Merge new options into existing
            const existingValues = new Set(existing.options.map((o) => o.value));
            const newOpts = options.filter((o) => !existingValues.has(o.value));
            if (newOpts.length > 0) {
              await AttributeModel.updateOne(
                { _id: attrId },
                { $addToSet: { options: { $each: newOpts } } }
              );
              console.log(`    ↻ Attribute "${code}": +${newOpts.length} opciones`);
            }
          } else {
            const created = await AttributeModel.create({
              code,
              name,
              type,
              options,
              isActive: true,
            });
            attrId = created._id;
            attrsCreated++;
            console.log(`    ✓ Attribute: ${code} (${type}, ${options.length} opts)`);
          }
        }
        attrCache.set(code, attrId);
      } else if (!DRY_RUN) {
        // Attribute already cached — still merge any new options from this category
        const existing = await AttributeModel.findById(attrId).lean();
        if (existing) {
          const existingValues = new Set(existing.options.map((o) => o.value));
          const newOpts = options.filter((o) => !existingValues.has(o.value));
          if (newOpts.length > 0) {
            await AttributeModel.updateOne(
              { _id: attrId },
              { $addToSet: { options: { $each: newOpts } } }
            );
            console.log(`    ↻ Attribute "${code}": +${newOpts.length} opciones (merge)`);
          }
        }
      }

      // 2. Upsert CategoryAttribute
      const isVariant = type === "image_upload" || attr.variante === true;
      const isRequired = attr.requerido;

      if (DRY_RUN) {
        console.log(
          `    [DRY] CategoryAttr: ${code} → ${catPath} (req=${isRequired}, var=${isVariant}, sort=${sortOrder})`
        );
        relationsCreated++;
      } else {
        const filter = {
          storeId: null,
          categoryId: category._id,
          attributeId: attrId,
        };

        const updateFields = {
          required: isRequired,
          variant: isVariant,
          affectsPrice: false,
          affectsStock: isVariant,
          sortOrder,
          isActive: true,
        };

        // Include modelOptions if the attribute has per-model data
        if (attr.perModel) {
          updateFields.modelOptions = attr.perModel;
        }

        // Include allowedOptions scoped per category
        if (attr.allowedOptions) {
          updateFields.allowedOptions = attr.allowedOptions.map((name) => ({
            value: name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9\-áéíóúñü\/\.\+]/g, ""),
            label: name,
          }));
        } else if (options.length > 0) {
          // For flat-structure attributes, scope options to this category
          updateFields.allowedOptions = options;
        }

        const existing = await CategoryAttributeModel.findOne(filter);
        if (existing) {
          // Update variant flag and modelOptions on existing relations
          await CategoryAttributeModel.updateOne(filter, { $set: updateFields });
          relationsExisted++;
        } else {
          await CategoryAttributeModel.create({
            ...filter,
            ...updateFields,
          });
          relationsCreated++;
        }

        // Track valid relation for cleanup
        const catIdStr = category._id.toString();
        if (!validRelations.has(catIdStr)) {
          validRelations.set(catIdStr, new Set());
        }
        validRelations.get(catIdStr).add(attrId.toString());
      }
    }
  }

  // ======================================================
  // LIMPIEZA DE CategoryAttributes HUÉRFANOS
  // ======================================================
  let relationsDeleted = 0;

  if (!DRY_RUN) {
    console.log("\n─── Limpieza de relaciones huérfanas ───");

    for (const [catId, validAttrIds] of validRelations) {
      const allRelations = await CategoryAttributeModel.find({
        storeId: null,
        categoryId: catId,
      }).lean();

      for (const rel of allRelations) {
        if (!validAttrIds.has(rel.attributeId.toString())) {
          await CategoryAttributeModel.deleteOne({ _id: rel._id });
          relationsDeleted++;
          console.log(`  🗑 Eliminada relación huérfana: catId=${catId}, attrId=${rel.attributeId}`);
        }
      }
    }

    if (relationsDeleted === 0) {
      console.log("  ✓ No se encontraron relaciones huérfanas");
    }
  }

  // ======================================================
  // LIMPIEZA DE OPCIONES STALE EN ATTRIBUTES
  // ======================================================
  let optionsRemoved = 0;

  if (!DRY_RUN) {
    console.log("\n─── Limpieza de opciones stale en Attributes ───");

    for (const [code, attrId] of attrCache) {
      const validVals = validOptions.get(code);
      if (!validVals) continue;

      const attr = await AttributeModel.findById(attrId).lean();
      if (!attr || !attr.options) continue;

      const staleOpts = attr.options.filter(o => !validVals.has(o.value));
      if (staleOpts.length > 0) {
        await AttributeModel.updateOne(
          { _id: attrId },
          { $pull: { options: { value: { $in: staleOpts.map(o => o.value) } } } }
        );
        optionsRemoved += staleOpts.length;
        console.log(`  🗑 Attribute "${code}": eliminadas ${staleOpts.length} opciones stale`);
      }
    }

    if (optionsRemoved === 0) {
      console.log("  ✓ No se encontraron opciones stale");
    }
  }

  // ======================================================
  // SEED TIENDA PLATAFORMA
  // ======================================================
  console.log("\n─── Tienda oficial de plataforma ───");

  if (DRY_RUN) {
    console.log("  [DRY] Se crearía tienda oficial con isPlatformStore: true");
  } else {
    const superAdmin = await UserModel.findOne({
      $or: [
        { role: "SUPER_ADMIN" },
        { platformRole: "SUPER_ADMIN" },
      ],
    }).lean();

    if (superAdmin) {
      const store = await StoreModel.findOneAndUpdate(
        { isPlatformStore: true },
        {
          $setOnInsert: {
            name: "Tienda Oficial",
            slug: "oficial",
            isPlatformStore: true,
            ownerId: superAdmin._id,
            currency: "BOB",
            status: "active",
          },
        },
        { upsert: true, new: true }
      );
      console.log(
        store.__v === 0
          ? "  ✓ Tienda oficial CREADA"
          : "  ∃ Tienda oficial ya existe"
      );
    } else {
      console.warn("  ⚠ No se encontró SUPER_ADMIN — crear tienda manualmente");
      skippedLines.push("[PLATFORM_STORE] No se encontró usuario SUPER_ADMIN");
    }
  }

  // ======================================================
  // SKIPPED.LOG
  // ======================================================
  if (skippedLines.length > 0) {
    const logContent =
      `# SKIPPED.log — ${new Date().toISOString()}\n` +
      `# Rutas/archivos que no se pudieron procesar\n\n` +
      skippedLines.join("\n") +
      "\n";

    if (!DRY_RUN) {
      fs.writeFileSync(SKIPPED_LOG, logContent, "utf-8");
      console.log(`\n  SKIPPED.log escrito: ${skippedLines.length} entradas`);
    } else {
      console.log(`\n  [DRY] SKIPPED.log tendría ${skippedLines.length} entradas`);
    }
  }

  // ======================================================
  // RESUMEN
  // ======================================================
  console.log("\n========================================");
  console.log("  RESUMEN");
  console.log("========================================");
  console.log(`  Archivos procesados:       ${files.length}`);
  console.log(`  Archivos skipped (parse):  ${filesSkipped}`);
  console.log(`  Attributes creados:        ${attrsCreated}`);
  console.log(`  Attributes existentes:     ${attrsExisted}`);
  console.log(`  CategoryAttr creados:      ${relationsCreated}`);
  console.log(`  CategoryAttr existentes:   ${relationsExisted}`);
  console.log(`  CategoryAttr eliminados:   ${relationsDeleted}`);
  console.log(`  Opciones stale eliminadas: ${optionsRemoved}`);
  console.log(`  Categorías no encontradas: ${categoriesNotFound}`);
  console.log("========================================\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
