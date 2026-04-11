// server/emails/templates/sellerTemplates.js

/** Aviso: recibimos la solicitud del vendedor */
export function sellerReceived({ name = "Postulante", storeName = "" } = {}) {
  return {
    subject: "Hemos recibido tu solicitud para vender en MTZstore",
    html: `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
        <h2>¡Gracias, ${name}!</h2>
        <p>Recibimos tu solicitud para la tienda <b>${storeName || "—"}</b>.
        Nuestro equipo la revisará y te avisaremos por correo.</p>
        <p>— Equipo MTZstore</p>
      </div>
    `,
  };
}

/** Aviso: solicitud aprobada */
export default function sellerApprovedTemplate({ userName, storeName } = {}) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5">
    <h2>🎉 ¡Solicitud aprobada!</h2>
    <p>Hola ${userName || "vendedor/a"},</p>
    <p>
      Tu solicitud para vender en <strong>MTZstore</strong> ha sido <strong>aprobada</strong>.
      Ya creamos tu tienda: <strong>${storeName || "—"}</strong>.
    </p>
    <p>Puedes ingresar al panel y seleccionar tu tienda para empezar a publicar productos.</p>
    <hr/>
    <p style="font-size:12px;color:#666">MTZstore • Plataforma de tiendas</p>
  </div>`;
}
