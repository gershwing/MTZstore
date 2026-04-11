import SalePayment from "../models/salePayment.model.js";
import DirectSale from "../models/directSale.model.js";
import { ERR } from "../utils/httpError.js";

const r = (n) => Math.round(Number(n || 0) * 100) / 100;

/**
 * POST /api/sale-payments — Registrar abono
 */
export async function createSalePayment(req, res, next) {
  try {
    const userId = req.userId || req.user?._id;
    const userName = req.user?.name || "";
    const { directSaleId, amount, paymentMethod, note } = req.body;

    if (!directSaleId) throw ERR.VALIDATION("Seleccione una venta");
    if (!amount || amount <= 0) throw ERR.VALIDATION("El monto debe ser mayor a 0");

    const sale = await DirectSale.findById(directSaleId);
    if (!sale) throw ERR.VALIDATION("Venta no encontrada");
    if (sale.paymentStatus === "PAID") throw ERR.VALIDATION("Esta venta ya está pagada");

    const maxPayable = r(sale.amountDue);
    if (amount > maxPayable + 0.01) {
      throw ERR.VALIDATION(`El monto excede la deuda pendiente de Bs. ${maxPayable}`);
    }

    const payment = await SalePayment.create({
      directSaleId,
      contactId: sale.contactId || null,
      storeId: sale.storeId || null,
      amount: r(amount),
      paymentMethod: paymentMethod || "CASH",
      note: note || "",
      createdBy: userId,
      createdByName: userName,
    });

    // Actualizar la venta
    const newAmountPaid = r(sale.amountPaid + amount);
    const newAmountDue = r(sale.total - newAmountPaid);
    const newStatus = newAmountDue <= 0.01 ? "PAID" : "PARTIAL";

    await DirectSale.updateOne(
      { _id: directSaleId },
      { $set: { amountPaid: newAmountPaid, amountDue: Math.max(0, newAmountDue), paymentStatus: newStatus } }
    );

    return res.status(201).json({
      success: true,
      payment,
      saleUpdate: { amountPaid: newAmountPaid, amountDue: Math.max(0, newAmountDue), paymentStatus: newStatus },
      message: newStatus === "PAID" ? "Deuda completada" : `Abono de Bs. ${r(amount)} registrado`,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/sale-payments/:directSaleId — Historial de abonos de una venta
 */
export async function getPaymentsBySale(req, res, next) {
  try {
    const { directSaleId } = req.params;
    const payments = await SalePayment.find({ directSaleId }).sort({ createdAt: 1 }).lean();
    return res.json({ success: true, payments });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/sale-payments/pending — Ventas con deuda pendiente
 */
export async function getPendingSales(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    const { search, page = 1, pageSize = 50 } = req.query;

    const query = { paymentStatus: { $in: ["CREDIT", "PARTIAL"] } };
    if (storeId) query.storeId = storeId;
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [
        { "customer.name": regex },
        { saleNumber: regex },
        { "customer.phone": regex },
      ];
    }

    const skip = (Number(page) - 1) * Number(pageSize);
    const [items, total] = await Promise.all([
      DirectSale.find(query)
        .select("saleNumber customer contactId total amountPaid amountDue paymentStatus creditNote createdAt paymentMethod")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(pageSize))
        .lean(),
      DirectSale.countDocuments(query),
    ]);

    // Totales globales
    const [totals] = await DirectSale.aggregate([
      { $match: { ...query } },
      { $group: { _id: null, totalDue: { $sum: "$amountDue" }, totalSales: { $sum: "$total" }, count: { $sum: 1 } } },
    ]);

    return res.json({
      success: true,
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      summary: totals || { totalDue: 0, totalSales: 0, count: 0 },
    });
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /api/sale-payments/:id — Eliminar un abono (reversa)
 */
export async function deleteSalePayment(req, res, next) {
  try {
    const payment = await SalePayment.findById(req.params.id);
    if (!payment) throw ERR.VALIDATION("Abono no encontrado");

    const sale = await DirectSale.findById(payment.directSaleId);
    if (!sale) throw ERR.VALIDATION("Venta asociada no encontrada");

    // Revertir montos
    const newAmountPaid = r(sale.amountPaid - payment.amount);
    const newAmountDue = r(sale.total - newAmountPaid);
    const newStatus = newAmountPaid <= 0.01 ? "CREDIT" : "PARTIAL";

    await DirectSale.updateOne(
      { _id: payment.directSaleId },
      { $set: { amountPaid: Math.max(0, newAmountPaid), amountDue: newAmountDue, paymentStatus: newStatus } }
    );

    await SalePayment.findByIdAndDelete(req.params.id);

    return res.json({ success: true, message: "Abono eliminado y deuda actualizada" });
  } catch (e) {
    next(e);
  }
}
