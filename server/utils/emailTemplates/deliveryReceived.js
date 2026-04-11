export default function deliveryReceived({ name = "Postulante" } = {}) {
  return {
    subject: "Hemos recibido tu postulación como repartidor(a)",
    html: `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.5">
        <h2>¡Gracias, ${name}!</h2>
        <p>Recibimos tu postulación para Delivery. Nuestro equipo la revisará y te avisaremos por correo.</p>
        <p>— Equipo MTZstore</p>
      </div>
    `,
  };
}
