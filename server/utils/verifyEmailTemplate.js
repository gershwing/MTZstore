const COPY = {
    register: {
        title: "Verificación de correo",
        body: "Gracias por registrarte en <strong>MTZstore</strong>. Utiliza el siguiente código para verificar tu correo electrónico:",
        ignore: "Si no creaste esta cuenta, puedes ignorar este mensaje con tranquilidad.",
    },
    password: {
        title: "Cambio de contraseña",
        body: "Recibimos una solicitud para cambiar tu contraseña en <strong>MTZstore</strong>. Utiliza el siguiente código para confirmar:",
        ignore: "Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña no se modificará.",
    },
};

const VerificationEmail = (username, otp, purpose = "register") => {
    const c = COPY[purpose] || COPY.register;
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Verificación de correo – MTZstore</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      color: #333333;
      font-family: Arial, Helvetica, sans-serif;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .title {
      color: #E53935; /* rojo MTZ */
      font-size: 22px;
      margin: 0;
      font-weight: 700;
    }
    .content {
      text-align: center;
    }
    .content p {
      font-size: 16px;
      line-height: 1.5;
      margin: 0 0 10px;
    }
    .otp {
      display: inline-block;
      font-size: 22px;
      font-weight: 700;
      color: #E53935;
      letter-spacing: 2px;
      padding: 10px 16px;
      border: 1px dashed #E53935;
      border-radius: 6px;
      margin: 16px 0;
      background: #fff7f7;
    }
    .footer {
      text-align: center;
      font-size: 13px;
      color: #777;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">MTZstore • ${c.title}</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${username || ""}</strong>,</p>
      <p>${c.body}</p>
      <div class="otp">${otp}</div>
      <p>${c.ignore}</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} MTZstore. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>`;
};

export default VerificationEmail;
