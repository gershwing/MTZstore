export default function sellerRejectedTemplate({ userName, reason }) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5">
    <h2>🚫 Solicitud rechazada</h2>
    <p>Hola ${userName || "vendedor/a"},</p>
    <p>
      Lamentamos informarte que tu solicitud para vender en <strong>MTZstore</strong> fue
      <strong>rechazada</strong>.
    </p>
    ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ""}
    <p>Puedes volver a aplicar cuando tengas la documentación completa.</p>
    <hr/>
    <p style="font-size:12px;color:#666">MTZstore • Plataforma de tiendas</p>
  </div>`;
}
