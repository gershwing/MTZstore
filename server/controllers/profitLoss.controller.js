import DirectSale from "../models/directSale.model.js";

/**
 * GET /api/profit-loss
 * Query: period (day|week|month|year), date (YYYY-MM-DD o YYYY), storeId ("all" o ObjectId)
 */
export async function getProfitLoss(req, res, next) {
  try {
    const { period = "month", date, storeId = "all" } = req.query;

    // Calcular rango de fechas
    const { startDate, endDate, periodLabel } = getDateRange(period, date);

    // Filtro base: solo ventas completamente pagadas (Opción A)
    // Incluye ventas antiguas sin campo paymentStatus (se asumen pagadas)
    const conditions = [
      { createdAt: { $gte: startDate, $lte: endDate } },
      { $or: [{ paymentStatus: "PAID" }, { paymentStatus: { $exists: false } }] },
    ];
    if (storeId === "platform") {
      conditions.push({ $or: [{ storeId: null }, { storeId: { $exists: false } }] });
    } else if (storeId && storeId !== "all") {
      const mongoose = (await import("mongoose")).default;
      conditions.push({ storeId: new mongoose.Types.ObjectId(storeId) });
    }
    const match = { $and: conditions };

    // Aggregate
    const [result] = await DirectSale.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          grossSales: { $sum: "$subtotal" },
          ivaTotal: { $sum: "$ivaAmount" },
          itTotal: { $sum: "$itAmount" },
          totalRevenue: { $sum: "$total" },
          totalCostUsd: { $sum: "$totalCostUsd" },
          totalEstimatedProfit: { $sum: "$totalEstimatedProfit" },
          salesCount: { $sum: 1 },
          totalItems: { $sum: { $size: "$items" } },
        },
      },
    ]);

    // Si no hay datos
    if (!result) {
      return res.json({
        success: true,
        pnlData: emptyPnL(periodLabel),
      });
    }

    // Obtener tipo de cambio promedio de las ventas del período
    const fxSample = await DirectSale.findOne(match).select("currency").lean();
    // Por ahora usamos un valor fijo o lo calculamos desde las ventas
    // totalCostUsd ya está en USD, necesitamos convertirlo a BOB
    // Usamos el ratio subtotal/totalEstimatedProfit para derivar COGS en BOB
    const grossSales = round(result.grossSales);
    const cogsBob = round(grossSales - result.totalEstimatedProfit);
    const grossProfit = round(result.totalEstimatedProfit);
    const ivaTotal = round(result.ivaTotal);
    const itTotal = round(result.itTotal);
    const totalTaxes = round(ivaTotal + itTotal);
    const netIncome = round(grossProfit - totalTaxes);

    const pnlData = {
      // Ingresos
      grossSales,
      returnsDiscounts: 0,
      netSales: grossSales,

      // Costos
      cogs: cogsBob,
      grossProfit,

      // Operacionales (sin datos aún)
      operatingExpenses: 0,
      expenseDetails: [],
      operatingIncome: grossProfit,

      // Otros
      otherIncomeExpense: 0,
      incomeBeforeTax: grossProfit,

      // Impuestos
      ivaAmount: ivaTotal,
      itAmount: itTotal,
      totalTaxes,

      // Resultado
      netIncome,

      // Métricas
      grossMarginPct: grossSales > 0 ? round((grossProfit / grossSales) * 100) : 0,
      operatingMarginPct: grossSales > 0 ? round((grossProfit / grossSales) * 100) : 0,
      netMarginPct: grossSales > 0 ? round((netIncome / grossSales) * 100) : 0,

      // Meta
      periodLabel,
      salesCount: result.salesCount,
      totalItems: result.totalItems,
      totalRevenue: round(result.totalRevenue),
      totalCostUsd: round(result.totalCostUsd),
      currency: "BOB",
    };

    return res.json({ success: true, pnlData });
  } catch (e) {
    next(e);
  }
}

function round(n, d = 2) {
  return Math.round(Number(n || 0) * 10 ** d) / 10 ** d;
}

function getDateRange(period, dateStr) {
  const now = new Date();
  let startDate, endDate, periodLabel;

  switch (period) {
    case "day": {
      const d = dateStr ? new Date(dateStr + "T00:00:00Z") : now;
      startDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
      endDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
      periodLabel = d.toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" });
      break;
    }
    case "week": {
      const d = dateStr ? new Date(dateStr + "T00:00:00Z") : now;
      const day = d.getUTCDay();
      startDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day, 0, 0, 0));
      endDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate() + 6, 23, 59, 59, 999));
      periodLabel = `Semana del ${startDate.toLocaleDateString("es-BO")} al ${endDate.toLocaleDateString("es-BO")}`;
      break;
    }
    case "month": {
      const d = dateStr ? new Date(dateStr + "T00:00:00Z") : now;
      startDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0));
      endDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999));
      periodLabel = d.toLocaleDateString("es-BO", { month: "long", year: "numeric" });
      break;
    }
    case "year": {
      const year = dateStr ? parseInt(dateStr) || now.getUTCFullYear() : now.getUTCFullYear();
      startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
      endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
      periodLabel = String(year);
      break;
    }
    default: {
      startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
      endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
      periodLabel = now.toLocaleDateString("es-BO", { month: "long", year: "numeric" });
    }
  }

  return { startDate, endDate, periodLabel };
}

function emptyPnL(periodLabel) {
  return {
    grossSales: 0, returnsDiscounts: 0, netSales: 0,
    cogs: 0, grossProfit: 0,
    operatingExpenses: 0, expenseDetails: [], operatingIncome: 0,
    otherIncomeExpense: 0, incomeBeforeTax: 0,
    ivaAmount: 0, itAmount: 0, totalTaxes: 0,
    netIncome: 0,
    grossMarginPct: 0, operatingMarginPct: 0, netMarginPct: 0,
    periodLabel, salesCount: 0, totalItems: 0, totalRevenue: 0, totalCostUsd: 0,
    currency: "BOB",
  };
}
