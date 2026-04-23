# Admin (Panel de administración)

App React para vendedores, managers y super admins. Gestiona productos, órdenes, inventario, entregas, finanzas, CMS y configuración de la plataforma.

---

## Estructura

```
admin/src/
├── App.jsx                 # Routing + guards de autenticación
├── firebase.jsx            # Config Firebase Auth
├── Pages/                  # 41+ páginas organizadas por dominio
├── Components/             # 24 componentes reutilizables
├── hooks/                  # 10 hooks custom
├── services/               # 23 servicios API
├── routes/                 # Configuración de rutas
├── context/                # AppContext + UIContext
├── utils/                  # 17 utilidades
└── layout/                 # Layouts compartidos
```

---

## Páginas por dominio

### Autenticación (públicas)
| Página | Ruta | Descripción |
|--------|------|-------------|
| Login | `/login` | Inicio de sesión |
| SignUp | `/sign-up` | Registro |
| ForgotPassword | `/forgot-password` | Recuperar contraseña |
| VerifyAccount | `/verify-account` | Verificación email/OTP |
| ChangePassword | `/change-password` | Cambiar contraseña |

### Dashboard
| Página | Ruta | Descripción |
|--------|------|-------------|
| RoleRedirect | `/admin` | Redirige al dashboard del rol |
| Dashboard (super) | `/admin/dashboard/super` | Dashboard super admin |
| Dashboard (store) | `/admin/dashboard/store` | Dashboard dueño de tienda |
| Dashboard (inventory) | `/admin/dashboard/inventory` | Dashboard inventario |
| Dashboard (finance) | `/admin/dashboard/finance` | Dashboard finanzas |
| Dashboard (delivery) | `/admin/dashboard/delivery` | Dashboard delivery |
| Dashboard (support) | `/admin/dashboard/support` | Dashboard soporte |

### Tiendas
| Página | Ruta | Descripción |
|--------|------|-------------|
| MyStore | `/admin/my-store` | Detalles y config de mi tienda |
| ManageStoreBanner | `/admin/my-store/banner` | Banner de la tienda |
| SelectStore | `/admin/store/select` | Selector de tienda activa |
| StoreMembers | — | Miembros del equipo |
| AdminList (stores) | `/admin/stores` | Listado de tiendas (super admin) |

### Productos
| Página | Ruta | Descripción |
|--------|------|-------------|
| Products | `/admin/products` | Lista + CRUD de productos |
| ProductCreate | — | Crear nuevo producto |
| ProductEdit | — | Editar producto |
| ProductForm | — | Formulario reutilizable |
| VariantMatrix | — | Gestión de variantes |
| InventoryTab | — | Tab de inventario en producto |

### Órdenes en línea
| Página | Ruta | Descripción |
|--------|------|-------------|
| Orders | `/admin/orders` | Todas las órdenes |
| Orders (Express) | `/admin/orders/mtzstore-express` | Órdenes MTZstore Express |
| Orders (Estándar) | `/admin/orders/mtzstore-standard` | Órdenes MTZstore Estándar |
| Orders (Tienda Express) | `/admin/orders/store-express` | Órdenes Tienda Express |
| Orders (Tienda Estándar) | `/admin/orders/store-standard` | Órdenes Tienda Estándar |

### Ventas directas
| Página | Ruta | Descripción |
|--------|------|-------------|
| DirectSalesPage | `/admin/direct-sales` | Nueva venta (POS) |
| SalesPage | `/admin/sales-history` | Historial de ventas |
| AccountsReceivable | `/admin/accounts-receivable` | Cuentas por cobrar |

### Finanzas
| Página | Ruta | Descripción |
|--------|------|-------------|
| ProfitLossPage | `/admin/profit-loss` | Estado de resultados |
| SettlementsPage | `/admin/settlements` | Liquidaciones |
| PaymentsPage | `/admin/payments` | Pagos |
| ReportsPage | `/admin/reports` | Reportes |
| ReportsPrint | `/admin/reports/print` | Impresión de reportes |

### Inventario y almacén
| Página | Ruta | Descripción |
|--------|------|-------------|
| InventoryPage | `/admin/inventory` | Gestión de inventario |
| WarehouseInbound | `/admin/warehouse-inbound` | Envíos al almacén |
| CreateRequest | `/admin/warehouse-inbound/create` | Crear solicitud de envío |

### Delivery
| Página | Ruta | Descripción |
|--------|------|-------------|
| DeliveryList | `/admin/delivery` | Entregas activas |
| DeliveryDetail | `/admin/delivery/:id` | Detalle de entrega |
| AvailableDeliveries | `/admin/available-deliveries` | Entregas disponibles |
| MyDeliveries | `/admin/my-deliveries` | Mis entregas (repartidor) |
| DeliveryAgents | `/admin/delivery-agents` | Gestión de repartidores |

### CMS
| Página | Ruta | Descripción |
|--------|------|-------------|
| HomeSliderBanners | `/admin/homeSlider/list` | Sliders de homepage |
| BannerV1List | `/admin/bannerV1/list` | Banners v1 |
| BannerList2 | `/admin/bannerlist2/List` | Banners v2 |
| BlogList | `/admin/blog/List` | Blog |
| ManageLogo | `/admin/logo/manage` | Logos |
| CategoryList | `/admin/category/list` | Categorías |
| SubCategoryList | `/admin/subCategory/list` | Subcategorías |
| ThirdCatList | `/admin/thirdCategory/list` | Tercer nivel |

### Super Admin
| Página | Ruta | Descripción |
|--------|------|-------------|
| Users | `/admin/users` | Gestión de usuarios |
| Audit | `/admin/audit` | Logs de auditoría |
| Permissions | `/admin/security/permissions` | Panel de permisos |
| SellerApps | `/admin/seller-applications/admin` | Postulaciones de vendedores |
| DeliveryApps | `/admin/delivery-applications/admin` | Postulaciones de repartidores |

### Onboarding
| Página | Ruta | Descripción |
|--------|------|-------------|
| GetStarted | `/admin/get-started` | Primeros pasos |
| Applications (sell) | `/admin/sell` | Postularse como vendedor |
| ApplyDelivery | `/admin/apply-delivery` | Postularse como repartidor |

---

## Hooks custom (`admin/src/hooks/`)

| Hook | Descripción |
|------|-------------|
| `useAuth` | Autenticación, viewer, permisos, alertas |
| `usePermission` | Verificación de permisos granulares |
| `useSellerApp` | Estado de la postulación de vendedor |
| `useCurrentStore` | Tienda/tenant activo |
| `useCategoryAttributes` | Atributos por categoría |
| `useLogo` | Logo de la tienda |
| `useSalesConfig` | Configuración de ventas |
| `useFxRate` | Tasa de cambio actual |

---

## Servicios API (`admin/src/services/`)

23 archivos que encapsulan llamadas API por dominio:

`audit`, `adminUsers`, `bannerList2`, `bannersV1`, `blog`, `delivery`, `deliveryApps`, `inventory`, `payments`, `permissionsAdmin`, `promotions`, `reports`, `sellerApps`, `settlements`, `support`, `sliders`

---

## Utilidades (`admin/src/utils/`)

| Archivo | Descripción |
|---------|-------------|
| `api.js` | Axios con interceptores: auth, tenant (X-Store-Id), refresh |
| `session.js` | Persistencia de tokens |
| `tenant.js` | Gestión de storeId (`getTenantId`, `setTenantId`) |
| `buildListParams.js` | Constructor de query strings |
| `formatPrice.js` | Formateo de precios |
| `sku.js` | Generación de SKU |
| `exportPdf.js` | Exportación a PDF (jsPDF + html2canvas) |
| `exportCsv.js` | Exportación a CSV |
| `downloadBlob.js` | Descarga de archivos |
| `logoCache.js` | Cache de logos |
| `httpErrorClient.js` | Manejo de errores HTTP |
| `httpFlags.js` | Flags de configuración de requests |
| `goToMyStore.js` | Navegación helper |
| `categoryFeatures.js` | Features por categoría |

---

## Sistema de rutas

```
routes/
├── index.js              # Configuración general
├── publicRoutes.jsx      # Login, signup, verify (sin auth)
├── adminRoutes.jsx       # Profile, onboarding (auth requerida)
├── tenantRoutes.jsx      # Dashboard, productos, órdenes (auth + tenant)
├── superAdminRoutes.jsx  # Usuarios, tiendas, audit (super admin)
├── ProtectedRoute.jsx    # Guard de autenticación
├── RequireAdmin.jsx      # Guard de super admin
├── RoleRedirect.jsx      # Redirect basado en rol
└── withPerm.jsx          # HOC de permisos
```

---

## Sidebar dinámico

El sidebar se genera dinámicamente según el rol del usuario en `Components/Sidebar/menu.config.js`:

- **SUPER_ADMIN**: Menú completo de plataforma (PLATFORM_MENU)
- **STORE_OWNER**: Menú completo de tienda (BASE_STORE_MENU)
- **INVENTORY_MANAGER**: Panel, tienda, almacén, productos
- **ORDER_MANAGER**: Panel, tienda, órdenes, delivery, reportes
- **DELIVERY_AGENT**: Panel, entregas disponibles, mis entregas
- **FINANCE_MANAGER**: Panel, finanzas, pagos, reportes
- **SUPPORT_AGENT**: Panel, tienda
- **CUSTOMER**: Solo "Empezar"

La función `buildSidebarMenuByRoles()` fusiona menús de múltiples roles y filtra por permisos y estado del tenant.

---

## Estado

- **AppContext** — Auth, viewer, permisos, categorías, progress bars
- **UIContext** — Sidebar state, responsive breakpoints
- **TanStack React Query** — Cache y refetch de datos del servidor
- **Socket.IO** — Eventos en tiempo real (ej: `seller-app:status`)
