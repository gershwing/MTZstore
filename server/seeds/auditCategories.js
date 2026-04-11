/**
 * AUDITORÍA COMPLETA — Categorías MongoDB vs Filesystem
 *
 * Uso:
 *   node server/seeds/auditCategories.js
 *   node server/seeds/auditCategories.js --dry-run
 *
 * Requiere: MONGODB_URI en server/.env
 *
 * Fases:
 *   A) Escanea filesystem (admin/src/variantes/) → árbol esperado 3 niveles
 *   B) Escanea MongoDB → categorías globales existentes
 *   C) Diff + Creación de categorías faltantes (Level 3)
 *   D) Auditoría de tiendas y acceso
 *   E) Genera reportes: Excel (.xlsx), JSON, changelog (.log)
 *
 * Salida: server/seeds/output/
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import mongoose from "mongoose";
import fs from "fs";
import ExcelJS from "exceljs";

import CategoryModel from "../models/category.model.js";
import StoreModel from "../models/store.model.js";
import ProductModel from "../models/product.model.js";
import UserModel from "../models/user.model.js";

/* ======================================================
   CONFIG
====================================================== */
const VARIANTES_DIR = path.resolve(__dirname, "../../admin/src/variantes");
const OUTPUT_DIR = path.resolve(__dirname, "output");
const DRY_RUN = process.argv.includes("--dry-run");
const NOW = new Date();
const DATE_STR = NOW.toISOString().slice(0, 10);
const TIMESTAMP = NOW.toISOString();

/* ======================================================
   CHANGELOG
====================================================== */
const changelogEntries = [];
function log(action, detail) {
  const entry = `[${new Date().toISOString()}] ${action}: ${detail}`;
  changelogEntries.push(entry);
  console.log(`  ${action}: ${detail}`);
}

/* ======================================================
   SLUG → NAME (reuse from seedCategories.js)
====================================================== */
const SLUG_TO_NAME = {
  electronica: "Electrónica",
  moda: "Moda",
  hogar: "Hogar y Cocina",
  automotriz: "Automotriz",
  gaming: "Gaming y Tecnología",
  belleza: "Belleza y Salud",
  deportes: "Deportes y Aire Libre",
  bebes: "Bebés y Niños",
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
   PHASE A — FILESYSTEM SCAN
   ✓ Correctamente detecta Level 3 (carpetas con variantes.js)
   ✓ Retorna paths como "electronica/computadoras/laptops"
====================================================== */
function buildExpectedTree() {
  const tree = [];
  const allExpected = []; // flat list of { path, slug, name, depth, parentPath }

  const nivel1Dirs = fs
    .readdirSync(VARIANTES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const n1Slug of nivel1Dirs) {
    const n1Path = path.join(VARIANTES_DIR, n1Slug);
    const cat1 = { slug: n1Slug, name: slugToName(n1Slug), path: n1Slug, depth: 0, children: [] };
    allExpected.push({ path: n1Slug, slug: n1Slug, name: cat1.name, depth: 0, parentPath: null });

    const nivel2Dirs = fs
      .readdirSync(n1Path, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    for (const n2Slug of nivel2Dirs) {
      const n2FullPath = path.join(n1Path, n2Slug);
      const cat2Path = `${n1Slug}/${n2Slug}`;
      const cat2 = { slug: n2Slug, name: slugToName(n2Slug), path: cat2Path, depth: 1, children: [] };
      allExpected.push({ path: cat2Path, slug: n2Slug, name: cat2.name, depth: 1, parentPath: n1Slug });

      // Level 3: carpetas que CONTIENEN variantes.js
      const nivel3Dirs = fs
        .readdirSync(n2FullPath, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort();

      for (const n3Slug of nivel3Dirs) {
        const n3FullPath = path.join(n2FullPath, n3Slug);
        const hasVariantes = fs.existsSync(path.join(n3FullPath, "variantes.js"));
        if (hasVariantes) {
          const cat3Path = `${cat2Path}/${n3Slug}`;
          cat2.children.push({ slug: n3Slug, name: slugToName(n3Slug), path: cat3Path, depth: 2 });
          allExpected.push({ path: cat3Path, slug: n3Slug, name: slugToName(n3Slug), depth: 2, parentPath: cat2Path });
        }
      }

      // Level 2 leaf: si tiene variantes.js directamente
      if (fs.existsSync(path.join(n2FullPath, "variantes.js")) && cat2.children.length === 0) {
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

  return { tree, allExpected };
}

/* ======================================================
   PHASE B — MONGODB SCAN
   ✓ Profundidades 0-indexed (L1=0, L2=1, L3=2)
   ✓ Usa path directamente del documento
====================================================== */
async function scanMongoDB() {
  const allGlobal = await CategoryModel.find({ storeId: null }).lean();
  const byPath = new Map();
  const byId = new Map();
  const byDepth = { 0: [], 1: [], 2: [] };

  for (const cat of allGlobal) {
    byPath.set(cat.path, cat);
    byId.set(cat._id.toString(), cat);
    if (byDepth[cat.depth] !== undefined) {
      byDepth[cat.depth].push(cat);
    }
  }

  return { allGlobal, byPath, byId, byDepth };
}

/* ======================================================
   PHASE C — DIFF + CREATE MISSING
   ✓ Crea categorías faltantes con parentId correcto
   ✓ Construye ancestors array correctamente
   ✓ Usa path en el filter del upsert (no slug)
   ✓ Detecta anomalías
====================================================== */
async function diffAndCreate(allExpected, db) {
  const results = []; // { path, name, depth, status: EXISTS|MISSING|CREATED, _id? }
  const created = [];
  const anomalies = [];

  // First pass: classify each expected category
  for (const exp of allExpected) {
    const dbCat = db.byPath.get(exp.path);
    if (dbCat) {
      results.push({
        path: exp.path,
        name: exp.name,
        depth: exp.depth,
        status: "EXISTS",
        _id: dbCat._id.toString(),
        existsInDB: true,
        existsInFS: true,
      });
    } else {
      results.push({
        path: exp.path,
        name: exp.name,
        depth: exp.depth,
        status: "MISSING",
        _id: null,
        existsInDB: false,
        existsInFS: true,
      });
    }
  }

  // Find EXTRA categories in DB (not in filesystem)
  const expectedPaths = new Set(allExpected.map((e) => e.path));
  for (const [catPath, cat] of db.byPath) {
    if (!expectedPaths.has(catPath)) {
      results.push({
        path: catPath,
        name: cat.name,
        depth: cat.depth,
        status: "EXTRA",
        _id: cat._id.toString(),
        existsInDB: true,
        existsInFS: false,
      });
      anomalies.push({
        type: "EXTRA_IN_DB",
        detail: `Category "${cat.name}" (path=${catPath}) exists in DB but not in filesystem`,
      });
    }
  }

  // Create missing categories (sorted by depth to ensure parents first)
  const missingByDepth = allExpected
    .filter((e) => !db.byPath.has(e.path))
    .sort((a, b) => a.depth - b.depth);

  for (const missing of missingByDepth) {
    if (DRY_RUN) {
      log("DRY_RUN", `Would create: ${missing.path} (depth ${missing.depth})`);
      continue;
    }

    // Find or create parent
    let parentDoc = null;
    if (missing.parentPath) {
      parentDoc = db.byPath.get(missing.parentPath);
      if (!parentDoc) {
        log("WARNING", `Parent not found for ${missing.path} — parent path: ${missing.parentPath}`);
        anomalies.push({
          type: "PARENT_NOT_FOUND",
          detail: `Cannot create "${missing.path}" — parent "${missing.parentPath}" not found`,
        });
        continue;
      }
    }

    // Build ancestors array
    let ancestors = [];
    if (parentDoc) {
      ancestors = [
        ...(parentDoc.ancestors || []),
        { _id: parentDoc._id, name: parentDoc.name, slug: parentDoc.slug },
      ];
    }

    const parentId = parentDoc ? parentDoc._id : null;
    const parentCatName = parentDoc ? parentDoc.name : "";

    // ✓ Upsert por PATH (no slug) — path es único
    const doc = await CategoryModel.findOneAndUpdate(
      { storeId: null, path: missing.path },
      {
        $setOnInsert: {
          storeId: null,
          name: missing.name,
          slug: missing.slug,
          parentId,
          parentCatName,
          ancestors,
          depth: missing.depth,
          path: missing.path,
          status: "active",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update our in-memory maps so subsequent children find their parent
    db.byPath.set(missing.path, doc);
    db.byId.set(doc._id.toString(), doc);

    const wasCreated = doc.__v === 0;
    if (wasCreated) {
      log("CREATED", `${missing.path} (${missing.name}, depth ${missing.depth})`);
      created.push({
        path: missing.path,
        name: missing.name,
        depth: missing.depth,
        parentId: parentId ? parentId.toString() : null,
        _id: doc._id.toString(),
        timestamp: new Date().toISOString(),
      });

      // Update result status
      const resItem = results.find((r) => r.path === missing.path);
      if (resItem) {
        resItem.status = "CREATED";
        resItem._id = doc._id.toString();
        resItem.existsInDB = true;
      }
    }
  }

  // Check for anomalies: broken parentId references, depth mismatches
  const refreshedCats = await CategoryModel.find({ storeId: null }).lean();
  const idSet = new Set(refreshedCats.map((c) => c._id.toString()));

  for (const cat of refreshedCats) {
    if (cat.parentId && !idSet.has(cat.parentId.toString())) {
      anomalies.push({
        type: "BROKEN_PARENT_REF",
        detail: `Category "${cat.name}" (path=${cat.path}) references parentId ${cat.parentId} which does not exist`,
      });
    }

    // Depth consistency check
    const expectedDepth = cat.path ? cat.path.split("/").length - 1 : 0;
    if (cat.depth !== expectedDepth) {
      anomalies.push({
        type: "DEPTH_MISMATCH",
        detail: `Category "${cat.name}" (path=${cat.path}) has depth=${cat.depth} but path implies depth=${expectedDepth}`,
      });
    }
  }

  // Check for duplicate paths
  const pathCounts = new Map();
  for (const cat of refreshedCats) {
    pathCounts.set(cat.path, (pathCounts.get(cat.path) || 0) + 1);
  }
  for (const [p, count] of pathCounts) {
    if (count > 1) {
      anomalies.push({
        type: "DUPLICATE_PATH",
        detail: `Path "${p}" appears ${count} times in global categories`,
      });
    }
  }

  return { results, created, anomalies };
}

/* ======================================================
   PHASE D — STORE ACCESS AUDIT
   ✓ Acceso correcto a miembros via User model
====================================================== */
async function auditStoreAccess() {
  const stores = await StoreModel.find().lean();
  const storeAudit = [];

  for (const store of stores) {
    const entry = {
      storeName: store.name,
      storeId: store._id.toString(),
      slug: store.slug || "",
      categoryId: store.categoryId ? store.categoryId.toString() : null,
      categoryExists: false,
      categoryName: "",
      productCount: 0,
      activeMembersCount: 0,
      status: store.status || "active",
      isPlatformStore: store.isPlatformStore || false,
    };

    // Check category reference
    if (store.categoryId) {
      const cat = await CategoryModel.findById(store.categoryId).lean();
      entry.categoryExists = !!cat;
      entry.categoryName = cat ? cat.name : "NOT FOUND";
    }

    // Product count
    entry.productCount = await ProductModel.countDocuments({ storeId: store._id });

    // Active members count (from User model memberships)
    const membersCount = await UserModel.countDocuments({
      "memberships.storeId": store._id,
      "memberships.status": "active",
    });
    entry.activeMembersCount = membersCount;

    storeAudit.push(entry);
  }

  return storeAudit;
}

/* ======================================================
   PHASE E — REPORT GENERATION
====================================================== */

async function generateExcelReport(stats, results, created, storeAudit, anomalies, tree) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "MTZstore Audit Script";
  wb.created = NOW;

  // --- Style helpers ---
  const headerStyle = {
    font: { bold: true, color: { argb: "FFFFFFFF" }, size: 11 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF2E4057" } },
    alignment: { horizontal: "center", vertical: "middle" },
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
  };

  function applyHeaderStyle(ws) {
    ws.getRow(1).eachCell((cell) => {
      cell.font = headerStyle.font;
      cell.fill = headerStyle.fill;
      cell.alignment = headerStyle.alignment;
      cell.border = headerStyle.border;
    });
    ws.getRow(1).height = 24;
  }

  // ========================
  // Sheet 1: Resumen Ejecutivo
  // ========================
  const ws1 = wb.addWorksheet("Resumen Ejecutivo");
  ws1.columns = [
    { header: "Métrica", key: "metric", width: 40 },
    { header: "Valor", key: "value", width: 20 },
  ];
  applyHeaderStyle(ws1);

  const summaryRows = [
    { metric: "Fecha de auditoría", value: TIMESTAMP },
    { metric: "Modo", value: DRY_RUN ? "DRY RUN" : "ESCRITURA" },
    { metric: "", value: "" },
    { metric: "--- FILESYSTEM (Fuente de verdad) ---", value: "" },
    { metric: "Categorías L1 esperadas", value: stats.fsL1 },
    { metric: "Categorías L2 esperadas", value: stats.fsL2 },
    { metric: "Categorías L3 esperadas", value: stats.fsL3 },
    { metric: "Total esperadas", value: stats.fsTotal },
    { metric: "", value: "" },
    { metric: "--- MONGODB (Estado actual) ---", value: "" },
    { metric: "Categorías L1 en DB", value: stats.dbL1 },
    { metric: "Categorías L2 en DB", value: stats.dbL2 },
    { metric: "Categorías L3 en DB", value: stats.dbL3 },
    { metric: "Total globales en DB", value: stats.dbTotal },
    { metric: "", value: "" },
    { metric: "--- RESULTADO ---", value: "" },
    { metric: "Categorías existentes (OK)", value: stats.existing },
    { metric: "Categorías faltantes (MISSING)", value: stats.missing },
    { metric: "Categorías creadas en esta ejecución", value: stats.created },
    { metric: "Categorías extras en DB (no en filesystem)", value: stats.extra },
    { metric: "Anomalías detectadas", value: stats.anomalies },
    { metric: "", value: "" },
    { metric: "--- TIENDAS ---", value: "" },
    { metric: "Total tiendas", value: stats.totalStores },
    { metric: "Tiendas con categoría asignada", value: stats.storesWithCategory },
    { metric: "Tiendas con categoría rota", value: stats.storesWithBrokenCategory },
  ];
  summaryRows.forEach((r) => ws1.addRow(r));

  // Highlight key metrics
  ws1.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const metric = row.getCell(1).value || "";
      if (metric.includes("faltantes") || metric.includes("Anomalías") || metric.includes("rota")) {
        const val = row.getCell(2).value;
        if (val > 0) {
          row.getCell(2).font = { bold: true, color: { argb: "FFCC0000" } };
        }
      }
      if (metric.includes("creadas")) {
        const val = row.getCell(2).value;
        if (val > 0) {
          row.getCell(2).font = { bold: true, color: { argb: "FF008800" } };
        }
      }
    }
  });

  // ========================
  // Sheet 2: Jerarquía Completa
  // ========================
  const ws2 = wb.addWorksheet("Jerarquía Completa");
  ws2.columns = [
    { header: "Path", key: "path", width: 45 },
    { header: "Nombre", key: "name", width: 30 },
    { header: "Depth", key: "depth", width: 8 },
    { header: "Status", key: "status", width: 12 },
    { header: "En DB", key: "existsInDB", width: 8 },
    { header: "En FS", key: "existsInFS", width: 8 },
    { header: "_id", key: "_id", width: 28 },
  ];
  applyHeaderStyle(ws2);

  const sortedResults = [...results].sort((a, b) => a.path.localeCompare(b.path));
  for (const r of sortedResults) {
    const row = ws2.addRow({
      path: "  ".repeat(r.depth) + r.path,
      name: r.name,
      depth: r.depth,
      status: r.status,
      existsInDB: r.existsInDB ? "Sí" : "No",
      existsInFS: r.existsInFS ? "Sí" : "No",
      _id: r._id || "",
    });

    // Color by status
    const statusCell = row.getCell(4);
    if (r.status === "MISSING") {
      statusCell.font = { color: { argb: "FFCC0000" }, bold: true };
    } else if (r.status === "CREATED") {
      statusCell.font = { color: { argb: "FF008800" }, bold: true };
    } else if (r.status === "EXTRA") {
      statusCell.font = { color: { argb: "FFDD8800" }, bold: true };
    }

    // Indent by depth
    if (r.depth > 0) {
      row.getCell(1).alignment = { indent: r.depth * 2 };
    }
  }

  ws2.autoFilter = { from: "A1", to: "G1" };

  // ========================
  // Sheet 3: Creaciones
  // ========================
  const ws3 = wb.addWorksheet("Creaciones");
  ws3.columns = [
    { header: "Path", key: "path", width: 45 },
    { header: "Nombre", key: "name", width: 30 },
    { header: "Depth", key: "depth", width: 8 },
    { header: "Parent ID", key: "parentId", width: 28 },
    { header: "_id", key: "_id", width: 28 },
    { header: "Timestamp", key: "timestamp", width: 24 },
  ];
  applyHeaderStyle(ws3);

  if (created.length === 0) {
    ws3.addRow({ path: "(Ninguna categoría creada en esta ejecución)", name: "", depth: "", parentId: "", _id: "", timestamp: "" });
  } else {
    created.forEach((c) => ws3.addRow(c));
  }

  // ========================
  // Sheet 4: Acceso Tiendas
  // ========================
  const ws4 = wb.addWorksheet("Acceso Tiendas");
  ws4.columns = [
    { header: "Tienda", key: "storeName", width: 30 },
    { header: "Slug", key: "slug", width: 20 },
    { header: "Status", key: "status", width: 12 },
    { header: "Plataforma", key: "isPlatformStore", width: 12 },
    { header: "Category ID", key: "categoryId", width: 28 },
    { header: "Categoría Existe", key: "categoryExists", width: 16 },
    { header: "Categoría Nombre", key: "categoryName", width: 25 },
    { header: "Productos", key: "productCount", width: 12 },
    { header: "Miembros Activos", key: "activeMembersCount", width: 16 },
  ];
  applyHeaderStyle(ws4);

  if (storeAudit.length === 0) {
    ws4.addRow({ storeName: "(Sin tiendas registradas)", slug: "", status: "", isPlatformStore: "", categoryId: "", categoryExists: "", categoryName: "", productCount: "", activeMembersCount: "" });
  } else {
    for (const s of storeAudit) {
      const row = ws4.addRow({
        storeName: s.storeName,
        slug: s.slug,
        status: s.status,
        isPlatformStore: s.isPlatformStore ? "Sí" : "No",
        categoryId: s.categoryId || "",
        categoryExists: s.categoryId ? (s.categoryExists ? "Sí" : "NO") : "N/A",
        categoryName: s.categoryName || "",
        productCount: s.productCount,
        activeMembersCount: s.activeMembersCount,
      });

      if (s.categoryId && !s.categoryExists) {
        row.getCell(6).font = { color: { argb: "FFCC0000" }, bold: true };
      }
    }
  }

  ws4.autoFilter = { from: "A1", to: "I1" };

  // ========================
  // Sheet 5: Anomalías
  // ========================
  const ws5 = wb.addWorksheet("Anomalías");
  ws5.columns = [
    { header: "Tipo", key: "type", width: 25 },
    { header: "Detalle", key: "detail", width: 80 },
  ];
  applyHeaderStyle(ws5);

  if (anomalies.length === 0) {
    ws5.addRow({ type: "NONE", detail: "No se detectaron anomalías" });
    ws5.getRow(2).getCell(1).font = { color: { argb: "FF008800" }, bold: true };
  } else {
    anomalies.forEach((a) => {
      const row = ws5.addRow(a);
      row.getCell(1).font = { color: { argb: "FFCC0000" }, bold: true };
    });
  }

  // ========================
  // Sheet 6: Recomendaciones
  // ========================
  const ws6 = wb.addWorksheet("Recomendaciones");
  ws6.columns = [
    { header: "#", key: "num", width: 5 },
    { header: "Prioridad", key: "priority", width: 12 },
    { header: "Recomendación", key: "recommendation", width: 80 },
  ];
  applyHeaderStyle(ws6);

  const recommendations = [];
  let recNum = 1;

  if (stats.missing > 0 && DRY_RUN) {
    recommendations.push({ num: recNum++, priority: "ALTA", recommendation: `Ejecutar sin --dry-run para crear las ${stats.missing} categorías faltantes` });
  }
  if (stats.created > 0) {
    recommendations.push({ num: recNum++, priority: "INFO", recommendation: `Se crearon ${stats.created} categorías. Ejecutar seedVariantes.js para poblar sus atributos` });
  }
  if (stats.extra > 0) {
    recommendations.push({ num: recNum++, priority: "MEDIA", recommendation: `${stats.extra} categorías en DB no tienen correspondencia en filesystem. Revisar si son legacy o deben eliminarse` });
  }
  if (stats.storesWithBrokenCategory > 0) {
    recommendations.push({ num: recNum++, priority: "ALTA", recommendation: `${stats.storesWithBrokenCategory} tiendas referencian categorías inexistentes. Corregir categoryId` });
  }
  const storesNoMembers = storeAudit.filter((s) => s.activeMembersCount === 0 && !s.isPlatformStore);
  if (storesNoMembers.length > 0) {
    recommendations.push({ num: recNum++, priority: "MEDIA", recommendation: `${storesNoMembers.length} tiendas sin miembros activos: ${storesNoMembers.map((s) => s.storeName).join(", ")}` });
  }
  const anomalyTypes = [...new Set(anomalies.map((a) => a.type))];
  if (anomalyTypes.includes("BROKEN_PARENT_REF")) {
    recommendations.push({ num: recNum++, priority: "ALTA", recommendation: "Existen categorías con parentId roto. Ejecutar repair script o re-seed" });
  }
  if (anomalyTypes.includes("DUPLICATE_PATH")) {
    recommendations.push({ num: recNum++, priority: "ALTA", recommendation: "Hay paths duplicados en categorías globales. Limpiar manualmente" });
  }
  if (anomalyTypes.includes("DEPTH_MISMATCH")) {
    recommendations.push({ num: recNum++, priority: "MEDIA", recommendation: "Categorías con depth inconsistente respecto a su path. Revisar y corregir" });
  }
  if (recommendations.length === 0) {
    recommendations.push({ num: 1, priority: "OK", recommendation: "Todo en orden. No se requieren acciones adicionales." });
  }

  recommendations.forEach((r) => {
    const row = ws6.addRow(r);
    const prioCell = row.getCell(2);
    if (r.priority === "ALTA") {
      prioCell.font = { color: { argb: "FFCC0000" }, bold: true };
    } else if (r.priority === "MEDIA") {
      prioCell.font = { color: { argb: "FFDD8800" }, bold: true };
    } else if (r.priority === "OK") {
      prioCell.font = { color: { argb: "FF008800" }, bold: true };
    }
  });

  // Write file
  const xlsxPath = path.join(OUTPUT_DIR, `audit-categorias-${DATE_STR}.xlsx`);
  await wb.xlsx.writeFile(xlsxPath);
  return xlsxPath;
}

function generateJsonHierarchy(tree, stats) {
  const jsonPath = path.join(OUTPUT_DIR, "category-hierarchy.json");
  const data = {
    generatedAt: TIMESTAMP,
    stats: {
      l1: stats.fsL1,
      l2: stats.fsL2,
      l3: stats.fsL3,
      missing: stats.missing,
      created: stats.created,
    },
    tree: tree.map((l1) => ({
      name: l1.name,
      slug: l1.slug,
      path: l1.path,
      children: l1.children.map((l2) => ({
        name: l2.name,
        slug: l2.slug,
        path: l2.path,
        isLeaf: l2.isLeaf || false,
        children: (l2.children || []).map((l3) => ({
          name: l3.name,
          slug: l3.slug,
          path: l3.path,
        })),
      })),
    })),
  };
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf-8");
  return jsonPath;
}

function generateChangelog() {
  const logPath = path.join(OUTPUT_DIR, "audit-changelog.log");
  const content =
    `# Audit Changelog — ${TIMESTAMP}\n` +
    `# Mode: ${DRY_RUN ? "DRY RUN" : "WRITE"}\n\n` +
    changelogEntries.join("\n") +
    "\n";
  fs.writeFileSync(logPath, content, "utf-8");
  return logPath;
}

/* ======================================================
   MAIN
====================================================== */
async function main() {
  console.log("========================================");
  console.log("  AUDITORÍA COMPLETA DE CATEGORÍAS");
  console.log(`  Modo: ${DRY_RUN ? "DRY RUN (no escribe)" : "ESCRITURA"}`);
  console.log(`  Fecha: ${DATE_STR}`);
  console.log("========================================\n");

  // Ensure output dir
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✓ Conectado a MongoDB\n");

  // ── Phase A: Filesystem Scan ──
  console.log("── FASE A: Escaneo Filesystem ──");
  const { tree, allExpected } = buildExpectedTree();
  const fsL1 = allExpected.filter((e) => e.depth === 0).length;
  const fsL2 = allExpected.filter((e) => e.depth === 1).length;
  const fsL3 = allExpected.filter((e) => e.depth === 2).length;
  console.log(`  L1: ${fsL1} | L2: ${fsL2} | L3: ${fsL3} | Total: ${allExpected.length}`);
  log("FILESYSTEM_SCAN", `${allExpected.length} categorías esperadas (${fsL1} L1, ${fsL2} L2, ${fsL3} L3)`);

  // ── Phase B: MongoDB Scan ──
  console.log("\n── FASE B: Escaneo MongoDB ──");
  const db = await scanMongoDB();
  const dbL1 = db.byDepth[0].length;
  const dbL2 = db.byDepth[1].length;
  const dbL3 = db.byDepth[2].length;
  console.log(`  L1: ${dbL1} | L2: ${dbL2} | L3: ${dbL3} | Total: ${db.allGlobal.length}`);
  log("MONGODB_SCAN", `${db.allGlobal.length} categorías globales en DB (${dbL1} L1, ${dbL2} L2, ${dbL3} L3)`);

  // ── Phase C: Diff + Create ──
  console.log("\n── FASE C: Diff y Creación ──");
  const { results, created, anomalies } = await diffAndCreate(allExpected, db);
  const existing = results.filter((r) => r.status === "EXISTS").length;
  const missing = results.filter((r) => r.status === "MISSING").length;
  const createdCount = created.length;
  const extra = results.filter((r) => r.status === "EXTRA").length;
  console.log(`  Existentes: ${existing} | Faltantes: ${missing} | Creadas: ${createdCount} | Extras: ${extra}`);
  console.log(`  Anomalías: ${anomalies.length}`);

  // ── Phase D: Store Access Audit ──
  console.log("\n── FASE D: Auditoría de Tiendas ──");
  const storeAudit = await auditStoreAccess();
  const storesWithCategory = storeAudit.filter((s) => s.categoryId).length;
  const storesWithBrokenCategory = storeAudit.filter((s) => s.categoryId && !s.categoryExists).length;
  console.log(`  Tiendas: ${storeAudit.length} | Con categoría: ${storesWithCategory} | Categoría rota: ${storesWithBrokenCategory}`);
  log("STORE_AUDIT", `${storeAudit.length} tiendas auditadas, ${storesWithBrokenCategory} con referencia rota`);

  // ── Phase E: Report Generation ──
  console.log("\n── FASE E: Generación de Reportes ──");

  const stats = {
    fsL1, fsL2, fsL3, fsTotal: allExpected.length,
    dbL1, dbL2, dbL3, dbTotal: db.allGlobal.length,
    existing, missing, created: createdCount, extra,
    anomalies: anomalies.length,
    totalStores: storeAudit.length,
    storesWithCategory,
    storesWithBrokenCategory,
  };

  const xlsxPath = await generateExcelReport(stats, results, created, storeAudit, anomalies, tree);
  console.log(`  ✓ Excel: ${xlsxPath}`);

  const jsonPath = generateJsonHierarchy(tree, stats);
  console.log(`  ✓ JSON:  ${jsonPath}`);

  const logPath = generateChangelog();
  console.log(`  ✓ Log:   ${logPath}`);

  // ── Final Summary ──
  console.log("\n========================================");
  console.log("  RESUMEN FINAL");
  console.log("========================================");
  console.log(`  Filesystem:  ${allExpected.length} categorías esperadas`);
  console.log(`  MongoDB:     ${db.allGlobal.length} categorías globales`);
  console.log(`  Existentes:  ${existing}`);
  console.log(`  Faltantes:   ${missing}`);
  console.log(`  Creadas:     ${createdCount}`);
  console.log(`  Extras (DB): ${extra}`);
  console.log(`  Anomalías:   ${anomalies.length}`);
  console.log(`  Tiendas:     ${storeAudit.length}`);
  console.log("========================================\n");

  await mongoose.disconnect();
  console.log("✓ Desconectado de MongoDB");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});