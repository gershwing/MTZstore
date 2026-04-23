# Autenticación

## Resumen

MTZstore usa JWT (JSON Web Tokens) para autenticación stateless, con soporte para login con email/password y Google OAuth via Firebase.

---

## Flujo de registro

```
1. Usuario envía email + password
   POST /api/user/register

2. Server crea usuario con verify_email=false
   Genera OTP de 6 dígitos con expiración de 10 minutos
   Envía email con código OTP (template VerificationEmail)

3. Usuario ingresa OTP
   POST /api/user/verify-otp { email, otp }

4. Server valida OTP y marca verify_email=true
   Genera access_token + refresh_token
   Retorna tokens al cliente
```

---

## Flujo de login

```
1. Usuario envía email + password
   POST /api/user/login

2. Server busca usuario por email
   Compara password con bcrypt
   Si el usuario tiene signUpWithGoogle=true y password="null":
     → Error: "Esta cuenta fue creada con Google"

3. Si credenciales válidas:
   Genera access_token (1h) + refresh_token (30d)
   Retorna tokens + datos del usuario
```

---

## Google OAuth

```
1. Client/Admin usa Firebase Auth para obtener Google token
   firebase.auth().signInWithPopup(googleProvider)

2. Frontend envía datos de Google al backend
   POST /api/user/authWithGoogle { name, email, avatar }

3. Server busca o crea usuario:
   - Si existe: actualiza avatar, retorna tokens
   - Si no existe: crea con signUpWithGoogle=true, password=null

4. Retorna access_token + refresh_token
```

---

## Tokens JWT

### Access Token
- **Duración**: 1 hora (`JWT_ACCESS_EXPIRES`)
- **Payload**: `{ id, email }`
- **Secreto**: `JWT_ACCESS_SECRET` (fallback: `JWT_SECRET`)
- **Envío**: Header `Authorization: Bearer <token>`

### Refresh Token
- **Duración**: 30 días (`JWT_REFRESH_EXPIRES`)
- **Payload**: `{ id }`
- **Secreto**: `JWT_REFRESH_SECRET`
- **Renovación**: `POST /api/user/refresh-token`

### Auto-refresh (Frontend)

Ambos frontends implementan auto-refresh en el interceptor de Axios:

```
1. Request falla con 401
2. Interceptor intenta refresh:
   - POST /api/user/refresh (cookies httpOnly)
   - Fallback: POST /api/auth/refresh (body)
   - Fallback: POST /api/user/refresh-token (Bearer)
3. Si refresh exitoso: reintenta request original
4. Si refresh falla: logout y redirect a /login
```

---

## Sistema OTP

- Código de 6 dígitos generado aleatoriamente
- Almacenado en `User.otp` con expiración en `User.otpExpires` (10 minutos)
- Enviado por email via SMTP (Gmail)
- Se usa para:
  - Verificación de email al registrarse
  - Cambio de contraseña
  - Agregar contraseña a cuenta Google

---

## Middleware de autenticación

### `auth.js` (obligatorio)
```javascript
// Extrae JWT de:
// 1. Header: Authorization: Bearer <token>
// 2. Cookie: accessToken
// Decodifica y carga req.user con datos del usuario
// Claims soportados: id, _id, sub, userId (flexibilidad)
// Secretos: JWT_ACCESS_SECRET → JWT_SECRET → SECRET_KEY_ACCESS_TOKEN
```

### `authOptional.js` (opcional)
```javascript
// Mismo proceso que auth.js pero NO falla si no hay token
// Útil para endpoints que funcionan diferente con/sin auth
// Ejemplo: producto público que muestra precio personalizado si hay sesión
```

---

## Detección de cuentas Google

Al hacer login con email/password, si el usuario fue creado con Google (`signUpWithGoogle=true`) y tiene `password="null"`:
- Se retorna error indicando que debe usar Google
- El usuario puede agregar una contraseña desde su perfil

---

## Almacenamiento de tokens (Frontend)

### Client
```javascript
localStorage.setItem("accessToken", token);
localStorage.setItem("refreshToken", refreshToken);
```

### Admin
```javascript
// session.js
setAccessToken(token)   // localStorage
setRefreshToken(token)  // localStorage
getAccessToken()
getRefreshToken()
clearSession()          // Limpia tokens + tenant
```

---

## Rate limiting

- **Auth endpoints**: Máximo `RATE_LIMIT_AUTH_MAX` (100) requests por ventana
- **Payment endpoints**: Máximo `RATE_LIMIT_PAYMENT_MAX` (20) requests por ventana
- Configurado en `server/middlewares/rateLimit.js`
