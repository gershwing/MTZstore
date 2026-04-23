# MTZ STORE

**Plataforma e-commerce multi-tenant para Bolivia**

MTZstore es una plataforma de comercio electrónico completa diseñada para el mercado boliviano, con soporte dual de monedas (USD/BOB), múltiples métodos de envío gestionados por la plataforma y por tiendas, sistema de roles granular (8 roles), y arquitectura multi-tenant que permite a múltiples vendedores operar tiendas independientes bajo una misma plataforma.

---

## Inicio rápido

```bash
# 1. Clonar el repositorio
git clone <repo-url> && cd MTZstore

# 2. Instalar dependencias (server, client, admin)
cd server && npm install
cd ../client && npm install
cd ../admin && npm install

# 3. Configurar variables de entorno
# Copiar y editar los .env en server/, client/ y admin/

# 4. Levantar los 3 servicios
cd server && npm run dev      # Puerto 8000
cd client && npm run dev      # Puerto 5174
cd admin && npm run dev       # Puerto 5173
```

---

## Documentación

| # | Documento | Descripción |
|---|-----------|-------------|
| 1 | [Arquitectura](01-arquitectura.md) | Estructura del monorepo, flujo de datos, patrones |
| 2 | [Tech Stack](02-tech-stack.md) | Tecnologías y dependencias por app |
| 3 | [Instalación](03-instalacion.md) | Setup local, variables de entorno, scripts |
| 4 | [Server](04-server.md) | Backend: modelos, controllers, rutas, middlewares, servicios |
| 5 | [Client](05-client.md) | App del cliente: páginas, componentes, hooks |
| 6 | [Admin](06-admin.md) | Panel admin: páginas, componentes, servicios, rutas |
| 7 | [Base de datos](07-base-de-datos.md) | Modelos MongoDB con campos y relaciones |
| 8 | [API Endpoints](08-api-endpoints.md) | Referencia de API REST completa |
| 9 | [Autenticación](09-autenticacion.md) | JWT, OTP, Google OAuth, refresh tokens |
| 10 | [Multi-tenancy](10-multi-tenancy.md) | Sistema de tenants, stores, memberships |
| 11 | [Roles y permisos](11-roles-permisos.md) | RBAC: 8 roles, permisos granulares |
| 12 | [Pagos](12-pagos.md) | PayPal, Cryptomus, settlements |
| 13 | [Envíos y delivery](13-envios-delivery.md) | Métodos de envío, delivery tasks, warehouse |
| 14 | [FX y monedas](14-fx-monedas.md) | Sistema de cambio USD/BOB |
| 15 | [Deployment](15-deployment.md) | Deploy en Vercel, producción |

---

## Estructura del proyecto

```
MTZstore/
├── server/          # API REST (Express.js + MongoDB)
├── client/          # Tienda del cliente (React + Vite)
├── admin/           # Panel de administración (React + Vite)
└── readme/          # Documentación del proyecto
```

---

## Características principales

- **Multi-tenant**: Múltiples tiendas independientes en una plataforma
- **Dual moneda**: Precios en USD y BOB con tasa de cambio en tiempo real
- **8 roles**: SUPER_ADMIN, STORE_OWNER, FINANCE_MANAGER, INVENTORY_MANAGER, ORDER_MANAGER, DELIVERY_AGENT, SUPPORT_AGENT, CUSTOMER
- **4 métodos de envío**: MTZstore Express/Estándar + Tienda Express/Estándar
- **Pagos**: PayPal, Cryptomus, contra entrega
- **Tiempo real**: Notificaciones via Socket.IO
- **CMS**: Blog, banners, sliders, logos personalizables
- **Ventas directas**: Sistema POS para ventas presenciales
- **Reportes**: P&L, inventario, ventas con exportación CSV/PDF
