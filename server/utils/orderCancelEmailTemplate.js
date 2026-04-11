const OrderCancelEmail = ({ customerName, orderIdShort, totalBob, products, reason }) => {
    const toNum = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    const fmtBob = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? `${n.toFixed(2)} Bs` : "0.00 Bs";
    };

    const items = products ?? [];

    const productRowsHtml = items.map((p) => {
        const qty = toNum(p?.quantity);
        const unitBob = toNum(p?.unitSettleAmount ?? p?.price ?? 0);
        const lineBob = toNum(p?.lineTotalSettle) || (unitBob * qty);

        const imgHtml = p?.image
            ? `<img src="${p.image}" alt="" width="40" height="40" style="border-radius:4px;object-fit:cover;display:block;" />`
            : `<div style="width:40px;height:40px;background:#eee;border-radius:4px;"></div>`;

        return `
        <tr>
          <td style="padding:8px;border:1px solid #eee;width:50px;">${imgHtml}</td>
          <td style="padding:8px;border:1px solid #eee;">${p?.productTitle ?? ""}</td>
          <td style="padding:8px;border:1px solid #eee;text-align:center;">${qty}</td>
          <td style="padding:8px;border:1px solid #eee;text-align:right;">${fmtBob(lineBob)}</td>
        </tr>`;
    }).join("");

    const reasonLine = reason
        ? `<p style="margin:12px 0 0;padding:10px;background:#fff3f3;border:1px solid #ffcdd2;border-radius:4px;color:#c62828;font-size:13px;"><strong>Motivo:</strong> ${reason}</p>`
        : "";

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Pedido cancelado – MTZstore</title>
</head>
<body style="font-family:Arial,sans-serif;background-color:#f5f5f5;margin:0;padding:0;">
  <div style="max-width:600px;margin:20px auto;background:#ffffff;border-radius:8px;box-shadow:0 0 10px rgba(0,0,0,0.1);overflow:hidden;">

    <div style="background:#E53935;color:white;padding:16px;text-align:center;font-size:20px;font-weight:700;">
      MTZstore &bull; Pedido cancelado
    </div>

    <div style="padding:24px;color:#222;">
      <p>Hola <strong>${customerName ?? ""}</strong>,</p>
      <p>Tu pedido <strong>#${orderIdShort ?? ""}</strong> ha sido cancelado.</p>

      ${reasonLine}

      ${items.length > 0 ? `
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:16px;">
        <thead>
          <tr style="background:#f8f8f8;">
            <th style="padding:8px;border:1px solid #eee;text-align:left;">Img</th>
            <th style="padding:8px;border:1px solid #eee;text-align:left;">Producto</th>
            <th style="padding:8px;border:1px solid #eee;text-align:center;">Cant.</th>
            <th style="padding:8px;border:1px solid #eee;text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${productRowsHtml}
        </tbody>
      </table>

      <p style="margin-top:12px;font-size:14px;"><strong>Total:</strong> <span style="color:#E53935;font-weight:700;">${fmtBob(toNum(totalBob))}</span></p>
      ` : ""}

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

export default OrderCancelEmail;
