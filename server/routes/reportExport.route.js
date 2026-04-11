import { Router } from "express";
import auth from "../middlewares/auth.js";
import withTenant from "../middlewares/withTenant.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import puppeteer from "puppeteer";

const router = Router();
router.get("/export.pdf", auth, withTenant({ required: false }), requirePermission("report:read"), async (req, res) => {
  try {
    const { storeId, from, to, group = "day", currency = "BOB" } = req.query;
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");

    const FRONT_BASE = process.env.FRONT_BASE_URL || "http://localhost:5173"; // ajusta a tu front
    const url = `${FRONT_BASE}/reports/print?storeId=${storeId || ""}&from=${from || ""}&to=${to || ""}&group=${group}&currency=${currency}`;

    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();

    // inyecta token en localStorage para que el front cargue datos autenticados
    await page.evaluateOnNewDocument((tkn) => {
      localStorage.setItem("accessToken", tkn);
    }, token);

    await page.goto(url, { waitUntil: "networkidle0", timeout: 120000 });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "14mm", right: "12mm", bottom: "14mm", left: "12mm" },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size:9px;width:100%;padding:0 12mm;display:flex;justify-content:space-between;">
          <span>MTZgroup — Reporte</span>
          <span class="date"></span>
        </div>`,
      footerTemplate: `
        <div style="font-size:9px;width:100%;padding:0 12mm;display:flex;justify-content:space-between;">
          <span>${storeId || "Todas las tiendas"}</span>
          <span class="pageNumber"></span>/<span class="totalPages"></span>
        </div>`
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=reporte.pdf");
    return res.send(pdf);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: true, message: "No se pudo generar el PDF" });
  }
});

export default router;
