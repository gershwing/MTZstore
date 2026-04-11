const STATUS_CONFIG = {
    ASSIGNED: {
        header: "Orden tomada",
        message: "Un repartidor ha tomado tu pedido y pronto lo tendras en tus manos.",
        subject: "Orden tomada",
    },
    PICKED_UP: {
        header: "Orden recogida",
        message: "Tu pedido ha sido recogido y sera enviado pronto.",
        subject: "Orden recogida",
    },
    IN_TRANSIT: {
        header: "Orden en ruta",
        message: "Tu pedido esta en camino hacia ti.",
        subject: "Orden en ruta",
    },
    DELIVERED: {
        header: "Orden entregada",
        message: "Tu pedido ha sido entregado exitosamente.",
        subject: "Orden entregada",
    },
    FAILED: {
        header: "Entrega fallida",
        message: "No fue posible entregar tu pedido.",
        subject: "Entrega fallida",
    },
    DISPATCHED_TO_WAREHOUSE: {
        header: "Producto despachado",
        message: "La tienda ha despachado tu producto hacia nuestro almacen. Pronto lo recibiras.",
        subject: "Producto despachado por la tienda",
    },
    RECEIVED_AT_WAREHOUSE: {
        header: "Producto recibido en almacen",
        message: "Tu producto ha llegado a nuestro almacen y sera despachado pronto.",
        subject: "Producto recibido en almacen",
    },
};

const DeliveryStatusEmail = ({ status, customerName, driverName, driverPhone, orderIdShort, totalBob,
    products, shippingMethod, shippingSettle, ivaTotal, itTotal, note }) => {

    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.ASSIGNED;

    const toNum = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    const fmtBob = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? `${n.toFixed(2)} Bs` : "0.00 Bs";
    };

    const phoneLine = driverPhone
        ? `<p style="margin:0 0 4px;"><strong>Tel. del repartidor:</strong> ${driverPhone}</p>`
        : "";

    const noteLine = (status === "FAILED" && note)
        ? `<p style="margin:12px 0 0;padding:10px;background:#fff3f3;border:1px solid #ffcdd2;border-radius:4px;color:#c62828;font-size:13px;"><strong>Motivo:</strong> ${note}</p>`
        : "";

    // --- Shipping label ---
    const shippingLabel = {
        MTZSTORE_STANDARD: "Envio Estandar",
        MTZSTORE_EXPRESS: "Envio Express",
        STORE: "Envio por la tienda",
    }[shippingMethod] || "Envio";
    const shippingBob = toNum(shippingSettle);

    // --- Product rows ---
    const items = products ?? [];
    let subtotal = 0;

    const productRowsHtml = items.map((p) => {
        const qty = toNum(p?.quantity);
        const unitBob = toNum(p?.unitSettleAmount ?? p?.price ?? 0);
        const lineBob = toNum(p?.lineTotalSettle) || (unitBob * qty);
        subtotal += lineBob;

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

        const imgHtml = p?.image
            ? `<img src="${p.image}" alt="" width="40" height="40" style="border-radius:4px;object-fit:cover;display:block;" />`
            : `<div style="width:40px;height:40px;background:#eee;border-radius:4px;"></div>`;

        return `
        <tr>
          <td style="padding:8px;border:1px solid #eee;width:50px;">${imgHtml}</td>
          <td style="padding:8px;border:1px solid #eee;">
            ${p?.productTitle ?? ""}${variantText}
          </td>
          <td style="padding:8px;border:1px solid #eee;text-align:center;">${qty}</td>
          <td style="padding:8px;border:1px solid #eee;text-align:right;">${fmtBob(lineBob)}</td>
        </tr>`;
    }).join("");

    const ivaNum = toNum(ivaTotal);
    const itNum = toNum(itTotal);
    const grandTotal = toNum(totalBob) || (subtotal + ivaNum + itNum + shippingBob);

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${cfg.header} – MTZstore</title>
</head>
<body style="font-family:Arial,sans-serif;background-color:#f5f5f5;margin:0;padding:0;">
  <div style="max-width:600px;margin:20px auto;background:#ffffff;border-radius:8px;box-shadow:0 0 10px rgba(0,0,0,0.1);overflow:hidden;">

    <div style="background:#E53935;color:white;padding:16px;text-align:center;font-size:20px;font-weight:700;">
      MTZstore &bull; ${cfg.header}
    </div>

    <div style="padding:24px;color:#222;">
      <p>Hola <strong>${customerName ?? ""}</strong>,</p>
      <p>${cfg.message}</p>

      <div style="background:#fafafa;border:1px solid #eee;border-radius:6px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 4px;"><strong>Repartidor:</strong> ${driverName ?? "—"}</p>
        ${phoneLine}
        <p style="margin:0;"><strong>Pedido:</strong> #${orderIdShort ?? ""}</p>
      </div>

      ${noteLine}

      ${items.length > 0 ? `
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:12px;">
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

      <table style="width:100%;font-size:13px;margin-top:10px;">
        <tr>
          <td style="padding:4px 10px;color:#555;">Subtotal</td>
          <td style="padding:4px 10px;text-align:right;">${fmtBob(subtotal)}</td>
        </tr>
        <tr>
          <td style="padding:4px 10px;color:#888;">IVA (13%)</td>
          <td style="padding:4px 10px;text-align:right;">${fmtBob(ivaNum)}</td>
        </tr>
        <tr>
          <td style="padding:4px 10px;color:#888;">IT (3%)</td>
          <td style="padding:4px 10px;text-align:right;">${fmtBob(itNum)}</td>
        </tr>
        <tr>
          <td style="padding:4px 10px;color:#888;">${shippingLabel}</td>
          <td style="padding:4px 10px;text-align:right;">${fmtBob(shippingBob)}</td>
        </tr>
        <tr style="border-top:2px solid #E53935;">
          <td style="padding:10px;font-weight:700;font-size:15px;">Total</td>
          <td style="padding:10px;text-align:right;font-weight:700;font-size:15px;color:#E53935;">${fmtBob(grandTotal)}</td>
        </tr>
      </table>
      ` : `
      <p style="margin:16px 0;"><strong>Total:</strong> <span style="color:#E53935;font-weight:700;">${fmtBob(grandTotal)}</span></p>
      `}

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

export { STATUS_CONFIG };
export default DeliveryStatusEmail;
