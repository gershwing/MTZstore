# Roles y permisos

## Jerarquía de roles

MTZstore tiene 8 roles organizados jerárquicamente:

```
SUPER_ADMIN          ── Administrador de la plataforma (acceso total)
  └── STORE_OWNER    ── Dueño de tienda (control total de su tienda)
      ├── FINANCE_MANAGER    ── Pagos, liquidaciones, reportes financieros
      ├── INVENTORY_MANAGER  ── Stock, variantes, almacén
      ├── ORDER_MANAGER      ── Órdenes, fulfillment, delivery
      ├── DELIVERY_AGENT     ── Solo entregas asignadas
      └── SUPPORT_AGENT      ── Tickets, moderación
CUSTOMER             ── Comprador (implícito, no requiere membresía)
```

---

## Permisos granulares

Definidos en `server/config/permissions.js`. Cada permiso sigue el formato `entidad:acción`:

```javascript
const MODULE_PERMS = {
  users:        { read: "user:read", invite: "user:invite" },
  stores:       { read: "store:read", create: "store:create", members: "store:members" },
  products:     { read: "product:read" },
  inventory:    { read: "inventory:read" },
  promos:       { read: "promotion:read" },
  orders:       { read: "order:read" },
  delivery:     { read: "delivery:read", take: "delivery:take", assign: "delivery:assign", selfUpdate: "delivery:updateStatus" },
  payments:     { read: "payment:read" },
  reports:      { read: "report:read" },
  support:      { read: "support:read", moderate: "review:moderate" },
  branding:     { logo: "logo:read", slider: "slider:read", banner: "banner:read", blog: "blog:read" },
  security:     { perm: "permission:read", audit: "audit:read" },
  categories:   { read: "category:read", create: "category:create", update: "category:update", delete: "category:delete" },
  applications: { deliveryAdmin: "deliveryApp:admin", adminAdmin: "adminApp:admin" },
  warehouse:    { read: "warehouse:read", create: "warehouse:create", update: "warehouse:update", moves: "warehouse:moves", audit: "warehouse:audit" },
};
```

### SUPER_ADMIN
- Permiso wildcard `"*"` — acceso a absolutamente todo

### STORE_OWNER
- Todos los permisos de su tienda: productos, órdenes, inventario, delivery, finanzas, CMS

### FINANCE_MANAGER
- `payment:read`, `report:read`, `product:read` (solo lectura de catálogo)

### INVENTORY_MANAGER
- `inventory:read`, `product:read`, `warehouse:read/create/update/moves`

### ORDER_MANAGER
- `order:read`, `delivery:read`, `report:read`

### DELIVERY_AGENT
- `delivery:take`, `delivery:updateStatus` (solo entregas asignadas)

### SUPPORT_AGENT
- `support:read`, `review:moderate`

### CUSTOMER
- Sin permisos de administración (solo puede comprar, ver su historial)

---

## Permission Overrides

El modelo `PermissionOverride` permite personalizar permisos por rol sin modificar código:

```javascript
{
  role: "ORDER_MANAGER",      // Rol a personalizar
  added: ["inventory:read"],   // Permisos adicionales
  removed: ["report:read"]     // Permisos removidos
}
```

Gestionado desde: `/admin/security/permissions`

---

## Middlewares de autorización

### `requirePermission(permission)`
Verifica que el usuario tenga un permiso específico:
```javascript
router.get("/orders", auth, withTenant, requirePermission("order:read"), getOrders);
```

### `requireRole(roles)`
Verifica que el usuario tenga uno de los roles especificados.

### `requireSuper`
Solo permite acceso a SUPER_ADMIN.

### `requireStoreOwnership`
Verifica que el usuario sea dueño de la tienda del request.

### `withEffectiveAccess`
Calcula el conjunto completo de permisos del usuario en el tenant actual, considerando:
- Permisos base del rol
- Permission overrides (added/removed)
- Si es super admin (wildcard `*`)

---

## Sidebar dinámico por rol

El sidebar del admin se genera dinámicamente en `admin/src/Components/Sidebar/menu.config.js`:

### Menú por rol

| Rol | Secciones visibles |
|-----|-------------------|
| SUPER_ADMIN | Panel, Usuarios, Tiendas, Categorías, Postulaciones, Productos, Ventas, Órdenes, Almacén, Delivery, Finanzas, CMS, Seguridad |
| STORE_OWNER | Empezar, Panel, Mi tienda, Productos, Ventas, Órdenes, Almacén, Delivery, Finanzas |
| INVENTORY_MANAGER | Panel, Mi tienda, Almacén, Productos |
| ORDER_MANAGER | Panel, Mi tienda, Órdenes, Delivery, Reportes |
| DELIVERY_AGENT | Panel, Mi tienda, Entregas disponibles, Mis entregas |
| FINANCE_MANAGER | Panel, Mi tienda, Finanzas (P&L, Liquidaciones, Pagos, Reportes) |
| SUPPORT_AGENT | Panel, Mi tienda |
| CUSTOMER | Empezar |

### Función builder

```javascript
buildSidebarMenuByRoles(user, hasPerm)
```

1. Si es super admin → usa `PLATFORM_MENU`
2. Si tiene roles → fusiona plantillas de cada rol (`mergeMenus`)
3. Filtra por permisos efectivos (`filterItems`)
4. Oculta rutas que requieren tenant si no hay tienda activa

---

## Política de roles operativos

- Un usuario puede tener máximo **2 roles operativos** simultáneos
- `CUSTOMER` es implícito (no cuenta como rol)
- Si un STORE_OWNER pierde su tienda, se degrada automáticamente
- Los roles se asignan via membresías a tiendas específicas
