# API Endpoints

Base URL: `http://localhost:8000` (desarrollo)

Todas las respuestas siguen el formato:
```json
{
  "ok": true,
  "message": "descripción",
  "data": { ... }
}
```

Errores:
```json
{
  "error": true,
  "message": "descripción del error",
  "status": 400
}
```

---

## Autenticación

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/user/register` | No | Registro con email/password |
| POST | `/api/user/login` | No | Login (devuelve JWT) |
| POST | `/api/user/authWithGoogle` | No | Login/registro con Google |
| POST | `/api/user/verify-otp` | No | Verificar código OTP |
| POST | `/api/user/forgot-password` | No | Solicitar reset de contraseña |
| POST | `/api/user/reset-password` | No | Cambiar contraseña con token |
| POST | `/api/user/refresh-token` | Token | Renovar access token |
| GET | `/api/user/me` | JWT | Obtener usuario actual |

---

## Usuarios (Admin)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/admin/users` | Super | Listar usuarios |
| PATCH | `/api/admin/users/:id/role` | Super | Cambiar rol de usuario |
| DELETE | `/api/admin/users/:id` | Super | Eliminar usuario |

---

## Tiendas

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/store` | JWT | Crear tienda |
| GET | `/api/store/:id` | JWT | Obtener tienda |
| PUT | `/api/store/:id` | Owner | Actualizar tienda |
| GET | `/api/store` | Super | Listar tiendas |

---

## Productos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/product/:id` | Opcional | Detalle de producto |
| POST | `/api/product` | Tenant | Crear producto |
| PUT | `/api/product/:id` | Owner | Actualizar producto |
| DELETE | `/api/product/:id` | Owner | Eliminar producto |
| GET | `/api/productFilter/...` | No | Búsqueda con filtros |

---

## Variantes

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/productVariant` | Tenant | Crear variante |
| PUT | `/api/productVariant/:id` | Owner | Actualizar variante |
| DELETE | `/api/productVariant/:id` | Owner | Eliminar variante |
| GET | `/api/productVariant/product/:productId` | Opcional | Variantes de un producto |

---

## Categorías

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/category` | No | Listar categorías |
| POST | `/api/category` | Super | Crear categoría |
| PUT | `/api/category/:id` | Super | Actualizar categoría |
| DELETE | `/api/category/:id` | Super | Eliminar categoría |

*Mismos endpoints para subcategorías (`/api/subCategory`) y tercer nivel (`/api/thirdCategory`).*

---

## Órdenes

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/order` | JWT | Crear orden |
| GET | `/api/order/order-list` | Tenant | Listar órdenes (admin/seller) |
| GET | `/api/order/user-orders` | JWT | Historial del usuario |
| GET | `/api/order/:id` | JWT | Detalle de orden |
| PATCH | `/api/order/order-status/:id` | Tenant | Actualizar estado |
| DELETE | `/api/order/deleteOrder/:id` | Tenant | Eliminar orden |
| GET | `/api/order/count` | Tenant | Total de órdenes |

**Parámetros de filtro** (`order-list`):
- `page`, `limit` — Paginación
- `status` — Estado de la orden
- `payment_status` — Estado del pago
- `shippingMethod` — Método de envío (MTZSTORE_EXPRESS, etc.)
- `from`, `to` — Rango de fechas
- `userId` — Filtrar por usuario

---

## Carrito

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/cart` | JWT | Agregar al carrito |
| GET | `/api/cart` | JWT | Obtener carrito |
| PUT | `/api/cart/:id` | JWT | Actualizar cantidad |
| DELETE | `/api/cart/:itemId` | JWT | Eliminar item |

---

## Pagos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/payment` | JWT | Crear pago |
| POST | `/api/payment/capture` | JWT | Capturar pago |
| POST | `/api/payment/refund` | Tenant | Refund |
| GET | `/api/payment/:id` | JWT | Estado del pago |

---

## Webhooks

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/webhook/paypal` | No | Webhook PayPal |
| POST | `/api/webhook/cryptomus` | No | Webhook Cryptomus |

---

## Delivery

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/delivery` | Tenant | Listar entregas |
| GET | `/api/delivery/:id` | Tenant | Detalle de entrega |
| POST | `/api/delivery` | Tenant | Crear entrega |
| PATCH | `/api/delivery/:id` | Tenant | Actualizar estado |
| POST | `/api/delivery/:id/proof` | Tenant | Subir prueba de entrega |
| GET | `/api/delivery/available` | JWT | Entregas disponibles |
| GET | `/api/delivery/my` | JWT | Mis entregas (repartidor) |

---

## Postulaciones de vendedores

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/seller-applications` | JWT | Crear postulación |
| GET | `/api/seller-applications/me` | JWT | Mi postulación |
| GET | `/api/seller-applications/admin` | Super | Listar postulaciones |
| PATCH | `/api/seller-applications/:id/review` | Super | Aprobar/rechazar |

---

## Postulaciones de repartidores

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/delivery-applications` | JWT | Crear postulación |
| GET | `/api/delivery-applications/me` | JWT | Mi postulación |
| GET | `/api/delivery-applications/admin` | Super | Listar postulaciones |
| PATCH | `/api/delivery-applications/:id/review` | Super | Aprobar/rechazar |

---

## Inventario

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/inventory` | Tenant | Listar stock |
| POST | `/api/inventory/movement` | Tenant | Registrar movimiento |
| GET | `/api/inventory/movements` | Tenant | Historial de movimientos |

---

## Warehouse Inbound

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/warehouse-inbound` | Tenant | Crear solicitud |
| GET | `/api/warehouse-inbound` | Tenant | Listar solicitudes |
| PATCH | `/api/warehouse-inbound/:id/review` | Super | Aprobar/rechazar |

---

## Settlements (Liquidaciones)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/settlement` | Tenant | Listar liquidaciones |
| POST | `/api/settlement` | Super | Crear liquidación |
| PATCH | `/api/settlement/:id` | Super | Actualizar estado |

---

## Shipping (Envíos)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/shipping/rates` | No | Tarifas disponibles por zona |
| POST | `/api/shipping/calculate` | No | Calcular costo de envío |

---

## CMS (Contenido)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET/POST/PUT/DELETE | `/api/blog` | Super | Blog CRUD |
| GET/POST/PUT/DELETE | `/api/homeSlider` | Super | Sliders CRUD |
| GET/POST/PUT/DELETE | `/api/bannerV1` | Super | Banners v1 CRUD |
| GET/POST/PUT/DELETE | `/api/bannerList2` | Super | Banners v2 CRUD |
| GET/POST/PUT/DELETE | `/api/logo` | Super | Logos CRUD |
| GET/POST/PUT/DELETE | `/api/promotion` | Tenant | Promociones CRUD |

---

## Soporte

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/support` | JWT | Crear ticket |
| GET | `/api/support` | Tenant | Listar tickets |
| PATCH | `/api/support/:id` | Tenant | Actualizar ticket |

---

## Auditoría

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/audit` | Super | Listar logs de auditoría |

---

## Permisos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/permissions` | Super | Listar permisos por rol |
| PUT | `/api/permissions/:role` | Super | Actualizar overrides |

---

## FX (Tipo de cambio)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/fx/latest` | No | Tasa USD/BOB actual |

---

## Uploads

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/upload` | JWT | Subir imagen a Cloudinary |
| DELETE | `/api/upload/:publicId` | JWT | Eliminar imagen |

---

## Headers importantes

| Header | Valor | Uso |
|--------|-------|-----|
| `Authorization` | `Bearer <jwt>` | Autenticación |
| `X-Store-Id` | `<storeId>` | Identificar tenant/tienda |
| `Content-Type` | `application/json` | Body JSON |
| `Content-Type` | `multipart/form-data` | Upload de archivos |
