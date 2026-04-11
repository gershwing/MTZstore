export default function deliveryApproved({ userName = "repartidor/a" } = {}) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5">
    <h2>🎉 ¡Postulación aprobada!</h2>
    <p>Hola ${userName},</p>
    <p>Tu postulación para operar como <strong>Delivery</strong> ha sido <strong>aprobada</strong>.
    Ya puedes ingresar al panel y ver <b>Mis entregas</b>.</p>
    <hr/><p style="font-size:12px;color:#666">MTZstore • Plataforma de tiendas</p>
  </div>`;
}
