# Arquitectura

## Monorepo

MTZstore es un monorepo con 3 aplicaciones independientes:

```
MTZstore/
├── server/          # API REST — Express.js + Node.js
├── client/          # Tienda pública — React + Vite
├── admin/           # Panel admin — React + Vite
└── readme/          # Documentación
```

Las 3 apps se despliegan de forma independiente. El `server` expone la API REST que ambos frontends consumen.

---

## Flujo de datos

```
┌─────────────┐     HTTP/REST      ┌─────────────────┐     Mongoose     ┌───────────┐
│   Client    │ ──────────────────► │     Server      │ ───────────────► │  MongoDB  │
│  (React)    │ ◄────────────────── │   (Express)     │ ◄─────────────── │  Atlas    │
└─────────────┘     JSON            │                 │                  └───────────┘
                                    │  Socket.IO ──►  │
┌─────────────┐     HTTP/REST      │                 │     Cloudinary
│   Admin     │ ──────────────────► │  X-Store-Id ──► │ ───────────────► (imágenes)
│  (React)    │ ◄────────────────── │  JWT Auth       │
└─────────────┘     JSON            └─────────────────┘
                                         │
                                    ┌────┴────────┐
                                    │  PayPal     │
                                    │  Binance FX │
                                    │  Gmail SMTP │
                                    └─────────────┘
```

---

## Estructura del servidor

```
server/
├── index.js                 # Entry point: Express, CORS, Socket.IO, middleware stack
├── config/                  # Configuración
│   ├── connectDb.js         # Conexión MongoDB
│   ├── roles.js             # Definición de roles y jerarquía
│   ├── permissions.js       # Matriz de permisos por rol
│   ├── cookies.js           # Configuración de cookies
│   ├── emailService.js      # SMTP setup
│   └── superAdmins.js       # Lista de super admins
├── models/                  # 35 schemas de Mongoose
├── controllers/             # 39 controladores
├── routes/                  # 41 archivos de rutas
├── middlewares/             # 21 middlewares
├── services/                # 10 servicios de negocio
├── utils/                   # 18 utilidades
├── scripts/                 # Migraciones y seeds
└── uploads/                 # Almacenamiento local temporal
```

---

## Estructura del cliente

```
client/src/
├── App.jsx                  # Routing principal
├── Pages/                   # 17 páginas
├── components/              # 28 componentes reutilizables
├── utils/                   # API, formateo, storage
└── firebase.jsx             # Config Firebase Auth
```

---

## Estructura del admin

```
admin/src/
├── App.jsx                  # Routing + guards
├── Pages/                   # 41+ páginas por dominio
├── Components/              # 24 componentes
├── hooks/                   # 10 hooks custom
├── services/                # 23 servicios API
├── routes/                  # Configuración de rutas (public, protected, tenant, super)
├── context/                 # AppContext + UIContext
├── utils/                   # 17 utilidades
└── layout/                  # Layouts compartidos
```

---

## Patrones arquitectónicos

### Multi-tenancy
Cada tienda opera de forma aislada. El middleware `withTenant` resuelve el `storeId` desde el header `X-Store-Id` y filtra todos los datos por ese tenant. Ver [10-multi-tenancy.md](10-multi-tenancy.md).

### RBAC (Control de acceso basado en roles)
8 roles con permisos granulares. Los menús del sidebar se generan dinámicamente según el rol del usuario. Ver [11-roles-permisos.md](11-roles-permisos.md).

### Foreign Exchange (FX)
Tasa USD/BOB en tiempo real via Binance con cache de 60 segundos. Los precios se almacenan en la moneda base del producto y se convierten al momento de mostrar/liquidar. Ver [14-fx-monedas.md](14-fx-monedas.md).

### Respuestas estandarizadas
El middleware `responseShape` agrega helpers al objeto `res`:
- `res.ok(data)` — 200
- `res.created(data)` — 201
- `res.err(message, status)` — Error con código

### Real-time
Socket.IO para notificaciones en tiempo real. El servidor emite eventos a rooms de usuario (`user:<userId>`).
