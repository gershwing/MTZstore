# Deployment

## Arquitectura de despliegue

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Client App    │     │   Admin App     │     │     Server      │
│   (Vercel)      │     │   (Vercel)      │     │   (Node.js)     │
│   Puerto: 443   │     │   Puerto: 443   │     │   Puerto: 8000  │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │     MongoDB Atlas       │
                    │     Cloudinary CDN      │
                    └─────────────────────────┘
```

---

## Frontend (Client + Admin)

### Vercel

Ambos frontends están configurados para deploy en Vercel.

#### Client (`client/vercel.json`)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

#### Admin (`admin/vercel.json`)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Build

```bash
# Client
cd client
npm run build    # Genera dist/

# Admin
cd admin
npm run build    # Genera dist/
```

### Variables de entorno en Vercel

#### Client
```
VITE_API_URL=https://tu-api.com
VITE_FIREBASE_APP_API_KEY=...
VITE_FIREBASE_APP_AUTH_DOMAIN=...
VITE_FIREBASE_APP_PROJECT_ID=...
VITE_FIREBASE_APP_STORAGE_BUCKET=...
VITE_FIREBASE_APP_MESSAGING_ID=...
VITE_FIREBASE_APP_ID=...
VITE_APP_PAYPAL_CLIENT_ID=...
```

#### Admin
```
VITE_API_URL=https://tu-api.com
VITE_FIREBASE_APP_API_KEY=...
VITE_FIREBASE_APP_AUTH_DOMAIN=...
VITE_FIREBASE_APP_PROJECT_ID=...
VITE_FIREBASE_APP_STORAGE_BUCKET=...
VITE_FIREBASE_APP_MESSAGING_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## Backend (Server)

### Opciones de hosting

El backend Express.js puede desplegarse en:
- **Railway** — Node.js con MongoDB integrado
- **Render** — Web service con auto-deploy
- **VPS** (DigitalOcean, AWS EC2) — Con PM2 para process management
- **Heroku** — Dyno con add-on MongoDB

### Variables de entorno de producción

```env
NODE_ENV=production
PORT=8000
TRUST_PROXY=true

# CORS — dominios de producción
ADMIN_ORIGIN=https://admin.tudominio.com
STORE_ORIGIN=https://tudominio.com
FRONT_URL=https://tudominio.com

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mtzstore?retryWrites=true&w=majority

# JWT (secretos fuertes en producción)
JWT_SECRET=<secreto-seguro-64-chars>
JWT_ACCESS_SECRET=<secreto-seguro-64-chars>
JWT_REFRESH_SECRET=<secreto-seguro-64-chars>
JWT_ACCESS_EXPIRES=1h
JWT_REFRESH_EXPIRES=30d

# Email
EMAIL=notificaciones@tudominio.com
EMAIL_PASS=<app_password>
SEND_EMAILS=true

# Cloudinary
cloudinary_Config_Cloud_Name=<cloud>
cloudinary_Config_api_key=<key>
cloudinary_Config_api_secret=<secret>

# PayPal (producción)
PAYPAL_MODE=live
PAYPAL_CLIENT_ID_LIVE=<client_id>
PAYPAL_SECRET_LIVE=<secret>

# FX
FX_USD_BOB=6.96
FX_FALLBACK_BOB_PER_USDT=6.90
FX_CACHE_TTL_MS=60000

# Rate Limiting (más estricto en prod)
RATE_LIMIT_AUTH_MAX=50
RATE_LIMIT_PAYMENT_MAX=10

# Super Admins
PLATFORM_SUPER_ADMINS=admin@tudominio.com

# Socket.IO
SOCKET_TRANSPORTS=websocket,polling
```

### Con PM2

```bash
# Instalar PM2
npm install -g pm2

# Iniciar
pm2 start server/index.js --name mtzstore-api

# Monitorear
pm2 monit

# Logs
pm2 logs mtzstore-api

# Restart automático
pm2 startup
pm2 save
```

---

## MongoDB Atlas

### Configuración recomendada

1. Crear cluster en [MongoDB Atlas](https://cloud.mongodb.com)
2. Configurar Network Access (IP whitelist o 0.0.0.0/0 para servicios cloud)
3. Crear usuario de base de datos
4. Obtener connection string
5. Configurar en `MONGODB_URI`

### Índices

Al iniciar con `SYNC_INDEXES=true`, el servidor sincroniza índices automáticamente:
```bash
SYNC_INDEXES=true npm start
```

Solo necesario en el primer deploy o después de cambios en schemas.

---

## Cloudinary

### Setup

1. Crear cuenta en [Cloudinary](https://cloudinary.com)
2. Obtener Cloud Name, API Key, API Secret
3. Configurar en variables de entorno
4. Las imágenes se suben automáticamente al crear/editar productos, banners, etc.

### Límites
- Upload máximo: 10MB (configurado en Multer)
- Formatos soportados: JPEG, PNG, WebP, GIF

---

## Checklist de producción

- [ ] Variables de entorno configuradas en todos los servicios
- [ ] `NODE_ENV=production` en el server
- [ ] `TRUST_PROXY=true` si hay reverse proxy (Nginx, Cloudflare)
- [ ] CORS configurado con dominios de producción
- [ ] PayPal en modo `live` con credenciales de producción
- [ ] Secretos JWT seguros (mínimo 64 caracteres)
- [ ] Rate limiting ajustado para producción
- [ ] MongoDB Atlas con IP whitelist configurada
- [ ] Cloudinary con límites adecuados
- [ ] SMTP con email de producción
- [ ] `SYNC_INDEXES=true` en primer deploy
- [ ] Firebase configurado con dominios autorizados
- [ ] SSL/HTTPS en todos los servicios
