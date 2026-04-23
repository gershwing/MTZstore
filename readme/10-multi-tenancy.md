# Multi-tenancy

## Concepto

MTZstore es una plataforma multi-tenant donde múltiples tiendas operan de forma aislada. Cada tienda (tenant) tiene sus propios productos, órdenes, inventario, configuración y equipo.

---

## Cómo funciona

### 1. Resolución del tenant

El middleware `withTenant` (`server/middlewares/withTenant.js`) resuelve el `storeId` del request:

```
Prioridad de resolución:
1. Header X-Store-Id
2. Parámetro URL :storeId
3. Query string ?storeId=
4. Auto-detect: si el usuario tiene UNA sola membresía activa, usa esa tienda
```

Una vez resuelto, `req.tenant` contiene:
```javascript
req.tenant = {
  storeId: "64abc...",   // ObjectId de la tienda
  store: { ... }          // Documento completo de la tienda
}
```

### 2. Scoping de datos

Todos los queries de datos tenant-scoped filtran por `storeId`:
```javascript
// Ejemplo en controller de órdenes
const filter = tenantStoreId
  ? { $or: [{ storeId: tenantStoreId }, { "products.storeId": tenantStoreId }] }
  : {};
```

### 3. Validación de tienda

El middleware valida que:
- La tienda existe
- La tienda está activa (no `suspended` ni `archived`)
- El usuario tiene una membresía en esa tienda (para roles non-super)

---

## Membresías de usuario

Un usuario puede pertenecer a múltiples tiendas con diferentes roles:

```javascript
user.memberships = [
  {
    storeId: "tienda1",
    role: "STORE_OWNER",
    status: "active",
    assignedBy: "userId",
    assignedAt: "2024-01-15"
  },
  {
    storeId: "tienda2",
    role: "INVENTORY_MANAGER",
    status: "active",
    assignedBy: "userId",
    assignedAt: "2024-03-20"
  }
]
```

### Campos de tienda activa
- `user.defaultStoreId` — Tienda por defecto (se usa al loguearse)
- `user.activeStoreId` — Tienda activa actual (puede cambiar via store picker)

---

## Header X-Store-Id

El frontend admin envía el header `X-Store-Id` en cada request:

```javascript
// admin/src/utils/api.js — interceptor de Axios
const storeId = getTenantId(); // localStorage
if (storeId) {
  config.headers["X-Store-Id"] = storeId;
}
```

### Excepciones (sin tenant)
Algunos endpoints no requieren tenant:
- Login, registro, verificación
- Categorías públicas
- `/api/user/me`
- Endpoints con flag `__noTenant: true`

---

## Store Picker (Admin)

El componente `StorePicker` permite al usuario cambiar de tienda:

```javascript
// Cambiar tenant
setTenantId(newStoreId);  // localStorage
window.dispatchEvent(new CustomEvent("tenant:changed", { detail: { storeId } }));
```

El evento `tenant:changed` recarga datos del sidebar, dashboard y menús.

---

## Variante: withTenantOrSuper

El middleware `withTenantOrSuper` permite bypass para super admins:
- Si el usuario es SUPER_ADMIN: puede operar sin tenant o con cualquier tenant
- Si no es super: se comporta igual que `withTenant`

Esto permite al super admin ver datos cross-tenant (ej: todas las órdenes de la plataforma).

---

## Tenant en el frontend

### Prefijos de rutas tenant-scoped

```javascript
const STORE_TENANT_PREFIXES = [
  "/admin/my-store",
  "/admin/catalog",
  "/admin/orders",
  "/admin/products",
  "/admin/direct-sales",
  "/admin/inventory",
  "/admin/payments",
  // ...más rutas
];
```

Si el usuario no tiene un tenant activo, estas rutas se ocultan del sidebar y se bloquean via `RequireTenant` guard.

### Rutas permitidas sin tenant

```javascript
const ALLOW_WITHOUT_TENANT_PREFIXES = [
  "/admin/applications",
  "/admin/get-started",
  "/admin/sell",
  "/admin/store/select",
  "/admin/apply-delivery",
];
```

---

## Super Admin

Los super admins se identifican por:
1. Campo `user.isSuper === true`
2. Campo `user.isPlatformSuperAdmin === true`
3. Rol `SUPER_ADMIN` en `user.roles`
4. Email en la lista `PLATFORM_SUPER_ADMINS` del .env

Un super admin:
- Ve todas las tiendas y sus datos
- Puede operar sin header X-Store-Id (datos cross-tenant)
- Tiene permiso wildcard `"*"` (acceso a todo)
- Ve el `PLATFORM_MENU` en el sidebar (en vez del `BASE_STORE_MENU`)
