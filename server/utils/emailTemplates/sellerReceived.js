// server/utils/emailTemplates/sellerReceived.js
export default function sellerReceived({ name = "Postulante", storeName = "" } = {}) {
  return {
    subject: "Hemos recibido tu solicitud para vender en MTZstore",
    html: `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.5">
        <h2>¡Gracias, ${name}!</h2>
        <p>Recibimos tu solicitud para la tienda <b>${storeName || "—"}</b>.
        Nuestro equipo la revisará y te avisaremos por correo.</p>
        <p>— Equipo MTZstore</p>
      </div>
    `,
  };
}
