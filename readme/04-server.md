# Server (Backend)

## Entry Point

`server/index.js` — Configura Express con:
- CORS (orígenes de admin y client)
- Helmet (seguridad HTTP)
- Rate limiting
- Sanitización de inputs
- Socket.IO
- Middleware stack de respuestas (`responseShape`)
- Seed de shipping rates al iniciar
- Sincronización de índices DB (opcional)

---

## Modelos (35 archivos en `server/models/`)

### Core

| Modelo | Archivo | Descripción |
|--------|---------|-------------|
| User | `user.model.js` | Usuarios con memberships multi-tienda, OTP, Google OAuth |
| Store | `store.model.js` | Tiendas multi-tenant con config, branding, moneda |
| Product | `product.model.js` | Productos con variantes, pricing dual, importación, SalesConfig |
| ProductVariant | `productVariant.model.js` | Variantes (talla, color, etc.) con stock propio |
| Order | `order.model.js` | Órdenes con lifecycle completo y snapshot FX |
| CartProduct | `cartProduct.model.js` | Items del carrito de compras |

### Pagos y finanzas

| Modelo | Archivo | Descripción |
|--------|---------|-------------|
| Payment | `payment.model.js` | Pagos (PayPal, Cryptomus) con estados y refunds |
| Settlement | `settlement.model.js` | Liquidaciones/payouts a tiendas |
| DirectSale | `directSale.model.js` | Ventas directas (POS) con impuestos |
| SalePayment | `salePayment.model.js` | Pagos de ventas directas (CASH/TRANSFER/QR/MIXED) |
| WebhookEvent | `webhookEvent.model.js` | Registro de webhooks de proveedores de pago |
| IdempotencyKey | `idempotencyKey.model.js` | Deduplicación de requests de pago |

### Logística

| Modelo | Archivo | Descripción |
|--------|---------|-------------|
| DeliveryTask | `deliveryTask.model.js` | Tareas de entrega con timeline y pruebas |
| DeliveryApplication | `deliveryApplication.model.js` | Postulaciones de repartidores |
| ShippingRate | `shippingRate.model.js` | Tarifas de envío por zona y método |
| WarehouseInbound | `warehouseInbound.model.js` | Envíos al almacén |
| InventoryMovement | `inventoryMovement.model.js` | Log de movimientos de inventario |
| Address | `address.model.js` | Direcciones de envío |

### Catálogo

| Modelo | Archivo | Descripción |
|--------|---------|-------------|
| Category | `category.model.js` | Categorías de productos |
| SubCategory | `subCategory.model.js` | Subcategorías (nivel 2) |
| ThirdCategory | `thirdCategory.model.js` | Tercer nivel de categorías |
| CategoryAttribute | `categoryAttribute.model.js` | Atributos específicos por categoría |
| Attribute | `attribute.model.js` | Definiciones de atributos |
| ProductAttributeValue | `productAttributeValue.model.js` | Valores de atributos por producto |
| Review | `reviews.model.js` | Reseñas de productos |
| MyList | `myList.model.js` | Wishlist del usuario |
| Promotion | `promotion.model.js` | Promociones y descuentos |

### CMS

| Modelo | Archivo | Descripción |
|--------|---------|-------------|
| Blog | `blog.model.js` | Posts del blog |
| HomeSlider | `homeSlider.model.js` | Sliders de la homepage |
| BannerV1 | `bannerV1.model.js` | Banners v1 |
| BannerList2 | `bannerList2.model.js` | Banners v2 |
| Logo | `logo.model.js` | Logos de tiendas |

### Admin y soporte

| Modelo | Archivo | Descripción |
|--------|---------|-------------|
| AuditLog | `auditLog.model.js` | Registro de auditoría |
| SupportTicket | `supportTicket.model.js` | Tickets de soporte |
| PermissionOverride | `permission.model.js` | Overrides de permisos por rol |
| SellerApplication | `sellerApplication.model.js` | Postulaciones de vendedores |
| Contact | `contact.model.js` | Contactos/clientes de ventas directas |

---

## Controllers (39 archivos en `server/controllers/`)

### Usuarios y autenticación
- `user.controller.js` — Registro, login, OTP, Google OAuth, perfil, roles
- `admin.users.controller.js` — Gestión de usuarios (super admin)

### Productos y catálogo
- `product.controller.js` — CRUD de productos
- `productFilter.controller.js` — Búsqueda y filtros
- `productVariant.controller.js` — Variantes
- `productMedia.controller.js` — Imágenes
- `productFx.controller.js` — Precios con FX
- `productRAM.controller.js` / `productSize.controller.js` / `productWeight.controller.js` — Atributos legacy
- `category.controller.js` — Categorías
- `categoryAttribute.controller.js` — Atributos por categoría

### Órdenes y pagos
- `order.controller.js` — Creación, estados, listados, reportes
- `payment.controller.js` — PayPal, Cryptomus, capturas, refunds
- `webhook.controller.js` — Webhooks de proveedores de pago
- `salePayments.controller.js` — Pagos de ventas directas
- `settlement.controller.js` — Liquidaciones a tiendas

### Logística
- `delivery.controller.js` — Asignación, tracking, pruebas de entrega
- `deliveryApplication.controller.js` — Onboarding de repartidores
- `inventory.controller.js` — Movimientos de stock
- `warehouseInbound.controller.js` — Envíos al almacén

### Negocio
- `directSales.controller.js` — Ventas directas (POS)
- `contact.controller.js` — Gestión de contactos
- `profitLoss.controller.js` — Estado de resultados
- `sellerApplication.controller.js` — Postulaciones de vendedores
- `report.controller.js` — Reportes

### CMS
- `blog.controller.js` — Blog
- `logo.controller.js` — Logos
- `homeSlider.controller.js` — Sliders
- `bannerV1.controller.js` / `bannerList2.controller.js` — Banners
- `promotion.controller.js` — Promociones

### Otros
- `cart.controller.js` — Carrito
- `mylist.controller.js` — Wishlist
- `address.controller.js` — Direcciones
- `support.controller.js` — Tickets de soporte
- `audit.controller.js` — Auditoría
- `permissionAdmin.controller.js` — Gestión de permisos
- `upload.controller.js` — Subida de archivos
- `store.controller.js` — Tiendas

---

## Rutas (41 archivos en `server/routes/`)

Las rutas siguen el patrón RESTful y están protegidas por middlewares de auth, permisos y tenant. Cada controller tiene su archivo de rutas correspondiente. Punto de montaje principal: `/api/`.

Ejemplo:
- `/api/user` — Autenticación y perfil
- `/api/product` — Productos
- `/api/order` — Órdenes
- `/api/store` — Tiendas
- `/api/delivery` — Entregas
- `/api/payment` — Pagos

Ver [08-api-endpoints.md](08-api-endpoints.md) para la referencia completa.

---

## Middlewares (21 archivos en `server/middlewares/`)

### Autenticación y autorización

| Middleware | Descripción |
|-----------|-------------|
| `auth.js` | Verifica JWT (Bearer o cookie), carga `req.user` |
| `authOptional.js` | Auth opcional (no falla si no hay token) |
| `requireRole.js` | Requiere rol específico |
| `requireSuper.js` | Requiere SUPER_ADMIN |
| `onlySuperAdmin.js` | Solo super admin de plataforma |
| `requirePermission.js` | Verifica permiso granular |
| `requireStoreOwnership.js` | Valida propiedad de la tienda |
| `requireProductOwnership.js` | Valida propiedad del producto |
| `withEffectiveAccess.js` | Calcula permisos efectivos |

### Multi-tenancy

| Middleware | Descripción |
|-----------|-------------|
| `withTenant.js` | Resuelve storeId del header/params/query |
| `withTenantOrSuper.js` | Tenant o bypass para super admin |

### Funcionalidad

| Middleware | Descripción |
|-----------|-------------|
| `withViewerCurrency.js` | Inyecta moneda del viewer (USD/BOB) |
| `idempotency.js` | Deduplicación de requests |
| `multer.js` | Manejo de uploads (10MB max) |

### Seguridad y respuesta

| Middleware | Descripción |
|-----------|-------------|
| `sanitize.js` | Sanitización de inputs (XSS) |
| `responseShape.js` | `res.ok()`, `res.created()`, `res.err()` |
| `errorHandler.js` | Manejo global de errores |
| `rateLimit.js` | Límite de requests |
| `nocache.js` | Previene caching |
| `cacheHeaders.js` | Headers de cache inteligentes |
| `previewGuard.js` | Acceso a contenido draft/preview |

---

## Servicios (10 archivos en `server/services/`)

| Servicio | Descripción |
|---------|-------------|
| `fx.service.js` | Snapshots de tasa USD/BOB, conversión, enriquecimiento de productos |
| `shipping.service.js` | Cálculo de costo de envío (peso, volumen, zona) |
| `paypal.service.js` | Integración PayPal (crear orden, capturar, refund) |
| `binanceService.js` | Tasa de cambio en tiempo real desde Binance |
| `orderPayment.service.js` | Reconciliación de pagos con órdenes |
| `audit.service.js` | Logging de auditoría seguro |
| `permissions.service.js` | Verificación de permisos |
| `permissionOverlay.service.js` | Gestión de overrides de permisos |
| `categoryValidation.service.js` | Validación de categorías |
| `categoryAttributes.service.js` | Gestión de atributos por categoría |

---

## Scripts y migraciones (`server/scripts/`)

| Script | Descripción |
|--------|-------------|
| `seedShippingRates.js` | Poblar tarifas de envío iniciales |
| `migrate-add-storeId.js` | Agregar storeId a documentos existentes |
| `migrate-banners-v1.js` | Migración de schema de banners |
| `migrate-add-stock-minimo.js` | Agregar campo de stock mínimo |
| `fixDeliveryAgentRoles.js` | Asignar roles DELIVERY_AGENT |
| `backfillExpressDeliveryTasks.js` | Crear delivery tasks express retroactivas |
| `check-perms.js` | Verificar configuración de permisos |
| `sync-indexes.js` | Sincronizar índices de DB |
