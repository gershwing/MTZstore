# Instalación y configuración

## Prerrequisitos

- **Node.js** v18 o superior
- **MongoDB** (local o MongoDB Atlas)
- **Cuentas de servicio**:
  - Cloudinary (imágenes)
  - Firebase (Google Auth)
  - PayPal Developer (pagos)
  - Gmail (emails transaccionales con App Password)

---

## 1. Clonar e instalar

```bash
git clone <repo-url>
cd MTZstore

# Instalar dependencias de cada app
cd server && npm install
cd ../client && npm install
cd ../admin && npm install
```

---

## 2. Variables de entorno

### Server (`server/.env`)

```env
# Base de datos
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<db>

# Servidor
NODE_ENV=development
PORT=8000
TRUST_PROXY=false

# CORS — orígenes permitidos
ADMIN_ORIGIN=http://localhost:5173
STORE_ORIGIN=http://localhost:5174
FRONT_URL=http://localhost:5174

# JWT
JWT_SECRET=<tu_secreto>
JWT_ACCESS_SECRET=<tu_secreto_access>
JWT_REFRESH_SECRET=<tu_secreto_refresh>
JWT_ACCESS_EXPIRES=1h
JWT_REFRESH_EXPIRES=30d

# Email (Gmail SMTP con App Password)
EMAIL=tu-email@gmail.com
EMAIL_PASS=<app_password_de_gmail>
SEND_EMAILS=true

# Cloudinary
cloudinary_Config_Cloud_Name=<cloud_name>
cloudinary_Config_api_key=<api_key>
cloudinary_Config_api_secret=<api_secret>

# PayPal (sandbox)
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID_TEST=<client_id>
PAYPAL_SECRET_TEST=<secret>

# Foreign Exchange
FX_USD_BOB=6.96
FX_FALLBACK_BOB_PER_USDT=6.90
FX_CACHE_TTL_MS=60000

# Rate Limiting
RATE_LIMIT_AUTH_MAX=100
RATE_LIMIT_PAYMENT_MAX=20

# Super Admins (emails separados por coma)
PLATFORM_SUPER_ADMINS=admin@ejemplo.com

# Socket.IO
SOCKET_TRANSPORTS=websocket,polling
```

### Client (`client/.env`)

```env
# Firebase Auth
VITE_FIREBASE_APP_API_KEY=<api_key>
VITE_FIREBASE_APP_AUTH_DOMAIN=<proyecto>.firebaseapp.com
VITE_FIREBASE_APP_PROJECT_ID=<proyecto>
VITE_FIREBASE_APP_STORAGE_BUCKET=<proyecto>.appspot.com
VITE_FIREBASE_APP_MESSAGING_ID=<messaging_id>
VITE_FIREBASE_APP_ID=<app_id>

# API
VITE_API_URL=http://localhost:8000

# PayPal
VITE_APP_PAYPAL_CLIENT_ID=<paypal_client_id>
```

### Admin (`admin/.env`)

```env
# Firebase Auth (mismas credenciales que client)
VITE_FIREBASE_APP_API_KEY=<api_key>
VITE_FIREBASE_APP_AUTH_DOMAIN=<proyecto>.firebaseapp.com
VITE_FIREBASE_APP_PROJECT_ID=<proyecto>
VITE_FIREBASE_APP_STORAGE_BUCKET=<proyecto>.appspot.com
VITE_FIREBASE_APP_MESSAGING_ID=<messaging_id>
VITE_FIREBASE_APP_ID=<app_id>

# API (también configurable via .env.local)
VITE_API_URL=http://localhost:8000
```

---

## 3. Levantar el proyecto

```bash
# Terminal 1 — Server
cd server
npm run dev          # nodemon, hot reload

# Terminal 2 — Client
cd client
npm run dev          # Vite en puerto 5174

# Terminal 3 — Admin
cd admin
npm run dev          # Vite en puerto 5173
```

---

## Scripts disponibles

### Server

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `npm run dev` | Desarrollo con nodemon |
| `start` | `npm start` | Producción |
| `migrate:storeId` | `npm run migrate:storeId` | Migración de storeId |

### Client

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `npm run dev` | Vite dev server (5174) |
| `build` | `npm run build` | Build de producción |
| `preview` | `npm run preview` | Preview del build |
| `lint` | `npm run lint` | ESLint |

### Admin

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `npm run dev` | Vite dev server (5173) |
| `build` | `npm run build` | Build de producción |
| `preview` | `npm run preview` | Preview del build |
| `lint` | `npm run lint` | ESLint |

---

## Proxy en desarrollo

Ambos frontends configuran proxy en Vite para evitar CORS en desarrollo:
- `/api` → `http://localhost:8000`
- `/socket.io` → `http://localhost:8000`
- `/uploads` → `http://localhost:8000`

El admin tiene configuración avanzada en `admin/vite.config.js` con soporte para HMR y SSL.
