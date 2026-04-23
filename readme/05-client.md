# Client (Tienda pública)

App React del cliente/comprador. Permite navegar productos, agregar al carrito, realizar compras, y gestionar su cuenta.

---

## Estructura

```
client/src/
├── App.jsx                  # Routing principal + Context Provider
├── index.css                # Estilos globales
├── firebase.jsx             # Configuración Firebase Auth
├── Pages/                   # 17 páginas
├── components/              # 28 componentes reutilizables
└── utils/                   # Utilidades (API, formato, storage)
```

---

## Páginas

| Página | Ruta | Descripción |
|--------|------|-------------|
| Home | `/` | Landing con banners, categorías, productos destacados |
| ProductListing | `/products` | Catálogo con filtros por categoría, precio, marca |
| ProductDetails | `/product/:id` | Detalle de producto con zoom, reseñas, variantes |
| Search | `/search` | Resultados de búsqueda |
| StorePage | `/store/:id` | Página de la tienda/vendedor |
| Login | `/login` | Autenticación (email + Google) |
| Register | `/register` | Registro de cuenta |
| ForgotPassword | `/forgot-password` | Recuperación de contraseña |
| Verify | `/verify` | Verificación de email con OTP |
| Cart | `/cart` | Carrito de compras |
| Checkout | `/checkout` | Proceso de pago y envío (protegida) |
| MyAccount | `/my-account` | Perfil, preferencias, datos personales (protegida) |
| Address | `/address` | Gestión de direcciones de envío (protegida) |
| MyList | `/my-list` | Lista de deseos / favoritos (protegida) |
| Orders | `/my-orders` | Historial de pedidos (protegida) |
| OrderSuccess | `/order/success` | Confirmación de compra exitosa |
| OrderFailed | `/order/failed` | Fallo en el pago |

---

## Componentes principales

### Navegación y layout
- **Header** — Barra de navegación con logo, búsqueda, carrito, menú de usuario
- **Footer** — Pie de página
- **Navigation** — Menú de categorías (flyout desktop + drawer mobile)
- **Search** — Componente de búsqueda
- **AccountSidebar** — Sidebar de navegación en My Account
- **MobileNav** — Navegación para móviles

### Productos
- **ProductItem** — Tarjeta de producto (vista grid)
- **ProductItemListView** — Tarjeta de producto (vista lista)
- **ProductDetails** — Modal/componente de detalle
- **ProductZoom** — Zoom de imagen en detalle
- **ProductsSlider** — Carrusel de productos
- **QtyBox** — Selector de cantidad

### Homepage
- **HomeSlider** — Carrusel de banners principal
- **AdsBannerSlider** — Banners promocionales
- **HomeCatSlider** — Carrusel de categorías

### Compras
- **CartPanel** — Panel lateral del carrito (drawer)
- **CategoryCollapse** — Filtro de categorías colapsable

### Otros
- **OtpBox** — Input de código OTP
- **Badge** — Badges de notificación
- **LoadingSkeleton** — Placeholder de carga
- **ProductLoading** — Skeleton grid de productos
- **SellerApplicationModal** — Modal "Quiero vender"

---

## Estado (Context API)

El estado global se maneja con `MyContext` en `App.jsx`:

```javascript
// Datos del usuario
isLogin, userData, setUserData

// Catálogo
catData                    // Categorías cargadas

// Carrito
cartData, addToCart(), getCartItems()

// Wishlist
myListData, getMyListData()

// UI
openCartPanel              // Panel lateral del carrito
openAddressPanel           // Panel de direcciones
openFilter                 // Panel de filtros
openSearchPanel            // Panel de búsqueda
```

---

## Utilidades (`client/src/utils/`)

| Archivo | Descripción |
|---------|-------------|
| `api.js` | Instancia Axios + helpers: `fetchDataFromApi`, `postData`, `editData`, `deleteData`, `patchData`, `uploadImage`, `getFxLatest` |
| `formatPrice.js` | Formateo de precios con moneda (BOB/USD) |
| `storage.js` | Wrappers de localStorage |
| `boliviaData.js` | Datos de ciudades y departamentos de Bolivia |
| `categoryIcons.js` | Mapeo de iconos por categoría |

---

## Routing

React Router v7 con rutas públicas y protegidas:

```
Públicas:  /, /products, /product/:id, /login, /register, /search, /store/:id
Protegidas: /checkout, /my-account, /my-list, /my-orders, /address
Info:       /order/success, /order/failed, /verify, /forgot-password
```

Las rutas protegidas redirigen a `/login` si el usuario no está autenticado.

---

## Autenticación del cliente

1. Login con email/password → `POST /api/user/login`
2. Login con Google → Firebase OAuth → `POST /api/user/authWithGoogle`
3. Tokens almacenados en `localStorage` (`accessToken`, `refreshToken`)
4. Auto-refresh en respuestas 401
5. Verificación de sesión al iniciar la app
