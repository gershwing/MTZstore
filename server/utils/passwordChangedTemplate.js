const PasswordChangedEmail = (username) => {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Contrasena actualizada – MTZstore</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      color: #333333;
      font-family: Arial, Helvetica, sans-serif;
    }
    .container {
      max-width: 520px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .header {
      background: #1976d2;
      padding: 24px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 22px;
    }
    .body {
      padding: 32px 24px;
      text-align: center;
    }
    .body p {
      font-size: 15px;
      line-height: 1.6;
      margin: 0 0 16px;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    .warning {
      background: #fff3e0;
      border-left: 4px solid #ff9800;
      padding: 12px 16px;
      margin: 20px 0;
      text-align: left;
      font-size: 13px;
      color: #e65100;
      border-radius: 4px;
    }
    .footer {
      padding: 16px;
      text-align: center;
      font-size: 12px;
      color: #999999;
      border-top: 1px solid #eeeeee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MTZstore</h1>
    </div>
    <div class="body">
      <div class="icon">&#128274;</div>
      <p>Hola <strong>${username || "usuario"}</strong>,</p>
      <p>Tu contrasena ha sido actualizada exitosamente.</p>
      <p>Ya puedes iniciar sesion con tu nueva contrasena.</p>
      <div class="warning">
        <strong>Si no realizaste este cambio</strong>, tu cuenta podria estar comprometida.
        Por favor contacta a nuestro equipo de soporte inmediatamente.
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} MTZstore. Todos los derechos reservados.
    </div>
  </div>
</body>
</html>`;
};

export default PasswordChangedEmail;
