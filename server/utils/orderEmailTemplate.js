const OrderConfirmationEmail = (username, orders) => {
    const toNum = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    const fmtMoney = (value, currency) => {
        if (value === null || value === undefined || value === "") return "—";
        const n = Number(value);
        if (!Number.isFinite(n)) return value ?? "";
        const c = (currency || "").toUpperCase();
        switch (c) {
            case "USD": return `$${n.toFixed(2)}`;
            case "BOB": return `${n.toFixed(2)} Bs`;
            default: return `${n.toFixed(2)} ${currency || ""}`;
        }
    };

    const R = toNum(orders?.fx?.bobPerUsd);
    const hasR = R > 0;

    // --- Shipping ---
    const shippingLabel = {
        MTZSTORE_STANDARD: "Envio Estandar",
        MTZSTORE_EXPRESS: "Envio Express",
        STORE: "Envio por la tienda",
    }[orders?.shippingMethod] || "Envio";
    const shippingBob = toNum(orders?.shippingSettle);

    // --- Calcular totales ---
    const products = orders?.products ?? [];
    let subtotalBob = 0;
    let totalIva = 0;
    let totalIt = 0;

    const productRowsHtml = products.map((p) => {
        const qty = toNum(p?.quantity);
        const unitBob = toNum(p?.unitSettleAmount ?? p?.price ?? 0);
        const lineBob = toNum(p?.lineTotalSettle) || (unitBob * qty);
        subtotalBob += lineBob;

        // Impuestos por linea
        if (p?.ivaEnabled && p?.ivaPct > 0) totalIva += lineBob * (p.ivaPct / 100);
        if (p?.itEnabled && p?.itPct > 0) totalIt += lineBob * (p.itPct / 100);

        // Variantes
        const variants = [];
        if (p?.size) variants.push(p.size);
        if (p?.ram) variants.push(p.ram);
        if (p?.weight) variants.push(p.weight);
        if (p?.variantAttrs && typeof p.variantAttrs === "object") {
            Object.values(p.variantAttrs).forEach((v) => { if (v) variants.push(String(v)); });
        }
        const variantText = variants.length
            ? `<br/><small style="color:#666;">${variants.join(" / ")}</small>`
            : "";

        // Imagen
        const imgHtml = p?.image
            ? `<img src="${p.image}" alt="" width="50" height="50" style="border-radius:4px;object-fit:cover;display:block;" />`
            : `<div style="width:50px;height:50px;background:#eee;border-radius:4px;"></div>`;

        return `
        <tr>
          <td style="padding:10px;border:1px solid #eee;width:60px;">${imgHtml}</td>
          <td style="padding:10px;border:1px solid #eee;">
            ${p?.productTitle ?? ""}${variantText}
          </td>
          <td style="padding:10px;border:1px solid #eee;text-align:center;">${qty}</td>
          <td style="padding:10px;border:1px solid #eee;text-align:right;">${fmtMoney(unitBob, "BOB")}</td>
          <td style="padding:10px;border:1px solid #eee;text-align:right;">${fmtMoney(lineBob, "BOB")}</td>
        </tr>`;
    }).join("");

    // Total general — usar totalBob almacenado como autoritativo
    const calculatedTotal = subtotalBob + totalIva + totalIt + shippingBob;
    const grandTotal = toNum(orders?.totalBob) > 0 ? toNum(orders?.totalBob) : calculatedTotal;

    // Total USD si disponible
    let totalUsd = toNum(orders?.totalUsd);
    let showTotalUsd = Number.isFinite(totalUsd) && totalUsd > 0;
    if (!showTotalUsd && hasR) {
        totalUsd = grandTotal / R;
        showTotalUsd = true;
    }

    // Estado de pago
    const payMethod = orders?.paymentMethod || "";
    const payLabel = payMethod === "PayPal" ? "PayPal"
        : payMethod === "Cryptomus" ? "Cryptomus"
        : "Pago contra entrega";

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Confirmacion de pedido – MTZstore</title>
</head>
<body style="font-family:Arial,sans-serif;background-color:#f5f5f5;margin:0;padding:0;">
  <div style="max-width:600px;margin:20px auto;background:#ffffff;border-radius:8px;box-shadow:0 0 10px rgba(0,0,0,0.1);overflow:hidden;">

    <div style="background:#E53935;color:white;padding:16px;text-align:center;font-size:20px;font-weight:700;">
      MTZstore &bull; Confirmacion de pedido
    </div>

    <div style="padding:24px;color:#222;">
      <p>Hola <strong>${username ?? ""}</strong>,</p>
      <p>Gracias por tu compra en <strong>MTZstore</strong>. Aqui tienes el resumen de tu pedido:</p>

      <p style="margin:0 0 4px;"><strong>ID del pedido:</strong> #${orders?._id ?? ""}</p>
      <p style="margin:0 0 4px;"><strong>Metodo de pago:</strong> ${payLabel}</p>
      <p style="margin:0 0 4px;"><strong>Metodo de envio:</strong> ${shippingLabel}</p>
      <p style="margin:0 0 16px;"><strong>Entrega estimada:</strong> 3–5 dias habiles</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#f8f8f8;">
            <th style="padding:10px;border:1px solid #eee;text-align:left;">Imagen</th>
            <th style="padding:10px;border:1px solid #eee;text-align:left;">Producto</th>
            <th style="padding:10px;border:1px solid #eee;text-align:center;">Cant.</th>
            <th style="padding:10px;border:1px solid #eee;text-align:right;">Precio</th>
            <th style="padding:10px;border:1px solid #eee;text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${productRowsHtml}
        </tbody>
      </table>

      <!-- Desglose -->
      <table style="width:100%;font-size:14px;margin-top:12px;">
        <tr>
          <td style="padding:6px 10px;color:#555;">Subtotal</td>
          <td style="padding:6px 10px;text-align:right;">${fmtMoney(subtotalBob, "BOB")}</td>
        </tr>
        <tr>
          <td style="padding:4px 10px;color:#888;font-size:13px;">IVA (13%)</td>
          <td style="padding:4px 10px;text-align:right;font-size:13px;">${fmtMoney(totalIva, "BOB")}</td>
        </tr>
        <tr>
          <td style="padding:4px 10px;color:#888;font-size:13px;">IT (3%)</td>
          <td style="padding:4px 10px;text-align:right;font-size:13px;">${fmtMoney(totalIt, "BOB")}</td>
        </tr>
        <tr>
          <td style="padding:4px 10px;color:#888;font-size:13px;">${shippingLabel}</td>
          <td style="padding:4px 10px;text-align:right;font-size:13px;">${fmtMoney(shippingBob, "BOB")}</td>
        </tr>
        <tr style="border-top:2px solid #E53935;">
          <td style="padding:10px;font-weight:700;font-size:16px;">Total</td>
          <td style="padding:10px;text-align:right;font-weight:700;font-size:16px;color:#E53935;">
            ${fmtMoney(grandTotal, "BOB")}
            ${showTotalUsd ? `<br/><small style="color:#666;font-weight:400;">(~ ${fmtMoney(totalUsd, "USD")})</small>` : ""}
          </td>
        </tr>
      </table>

      <p style="margin-top:20px;">Si tienes alguna consulta, responde a este correo y con gusto te ayudaremos.</p>
      <p style="margin:0;">Gracias por elegir <strong>MTZstore</strong>.</p>
    </div>

    <div style="text-align:center;padding:12px;font-size:12px;color:#999;border-top:1px solid #eee;">
      &copy; ${new Date().getFullYear()} MTZstore. Todos los derechos reservados.
    </div>
  </div>
</body>
</html>`;
};

export default OrderConfirmationEmail;
