# Base de datos

MongoDB con Mongoose ODM. Conexión via `server/config/connectDb.js` usando `MONGODB_URI`.

---

## Diagrama de relaciones principales

```
User ─┬── memberships[] ──► Store
      ├── orders[] ──────► Order ──┬── products[] (line items)
      ├── addresses[] ───► Address │── delivery_address ──► Address
      ├── cartProducts[] ► CartProduct   │── storeId ──► Store
      └── myList[] ──────► MyList        │── payment ──► Payment
                                         └── deliveryTask ──► DeliveryTask
Store ─┬── products[] ───► Product ──┬── variants[] ──► ProductVariant
       ├── orders[] ──────► Order    ├── category ──► Category
       ├── settlements[] ► Settlement├── reviews[] ──► Review
       ├── directSales[] ► DirectSale└── attributes ─► CategoryAttribute
       └── deliveryTasks ► DeliveryTask

Category ──► SubCategory ──► ThirdCategory
```

---

## Modelos detallados

### User (`user.model.js`)

```
name              String        Nombre completo
email             String        Email (único, indexado)
password          String        Hash bcrypt (opcional para Google)
avatar            String        URL de avatar
mobile            String        Teléfono
birthDate         Date          Fecha de nacimiento
gender            String        Género
verify_email      Boolean       Email verificado
signUpWithGoogle  Boolean       Registro via Google
otp               String        Código OTP temporal
otpExpires        Date          Expiración del OTP
role              String        Rol legacy
platformRole      String        Rol de plataforma
defaultStoreId    ObjectId→Store  Tienda por defecto
activeStoreId     ObjectId→Store  Tienda activa
access_token      String        JWT access token
refresh_token     String        JWT refresh token
memberships[]     Subdocumento  Membresías a tiendas
  ├── storeId     ObjectId→Store
  ├── role        String (STORE_OWNER, INVENTORY_MANAGER, etc.)
  ├── status      String (active, suspended)
  ├── assignedBy  ObjectId→User
  └── assignedAt  Date
```

### Store (`store.model.js`)

```
name              String        Nombre de la tienda
slug              String        URL-friendly (único)
categoryId        ObjectId→Cat  Categoría principal
ownerId           ObjectId→User Dueño
isPlatformStore   Boolean       Es tienda de la plataforma
status            String        active | suspended | archived
domain            String        Dominio personalizado
subdomain         String        Subdominio
currency          String        USD | BOB
settlementCurrency String       USD | BOB | USDT
email             String        Email de contacto
phone             String        Teléfono
address           Mixed         Dirección física
branding          Object        logo, banner
config            Object
  ├── storeType        String
  ├── wholesaleEnabled Boolean
  ├── taxRates         Object (IVA, IT)
  └── margins          Object
```

### Product (`product.model.js`)

```
name              String        Nombre del producto
description       String        Descripción
details           String        Detalles adicionales
brand             String        Marca
slug              String        URL-friendly
images[]          String        URLs de imágenes
bannerimages[]    String        Imágenes de banner
productType       String        SIMPLE | VARIANT
basePrice         Number        Precio base
wholesaleEnabled  Boolean       Habilitado para mayoreo
wholesalePrice    Number        Precio mayoreo
wholesaleTiers[]  Object        Niveles de precio por cantidad
oldBasePrice      Number        Precio anterior (tachado)
baseCurrency      String        USD | BOB
discount          Number        Porcentaje de descuento
sale              Boolean       En oferta
marginPct         Number        Margen de ganancia %
countInStock      Number        Stock disponible
warehouseStock    Number        Stock en almacén
status            String        draft | active | inactive
storeId           ObjectId→Store  Tienda propietaria
category          ObjectId→Cat    Categoría
subCat            ObjectId→SubCat Subcategoría
thirdCat          ObjectId→Third  Tercer nivel
importation       Object        Datos de importación
  ├── importCode     String
  ├── originCountry  String
  ├── supplierName   String
  ├── costUsd        Number
  └── marginPct      Number
salesConfig       Object        Config de ventas/costos
shipping          Object        Métodos de envío habilitados
  ├── mtzExpress     Boolean
  ├── mtzStandard    Boolean
  ├── storeExpress   Boolean
  ├── storeStandard  Boolean
  └── storeSelf      Boolean
dimensions        Object
  ├── weight    Number (kg)
  ├── length    Number (cm)
  ├── width     Number (cm)
  └── height    Number (cm)
```

### ProductVariant (`productVariant.model.js`)

```
productId         ObjectId→Product
attributes        Mixed         Atributos flexibles (color, talla, etc.)
sku               String        Código SKU
price             Number        Precio de la variante
wholesalePrice    Number        Precio mayoreo
stock             Number        Stock disponible
warehouseStock    Number        Stock en almacén
images[]          String        Imágenes de la variante
isActive          Boolean       Activa/inactiva
```

### Order (`order.model.js`)

```
userId            ObjectId→User   Comprador
storeId           ObjectId→Store  Tienda
products[]        Subdocumento    Line items
  ├── productId   ObjectId→Product
  ├── productTitle String
  ├── quantity    Number
  ├── price       Number
  ├── image       String
  ├── variant     Mixed
  └── storeId     ObjectId→Store
paymentId         String          ID del pago externo
payment_status    String          CAPTURED|PAID|PENDING|FAILED|CANCELED...
paymentMethod     String          PayPal|CashBOB|Cryptomus
delivery_address  ObjectId→Address
shippingMethod    String          MTZSTORE_EXPRESS|MTZSTORE_STANDARD|STORE_EXPRESS|STORE_STANDARD
order_status      String          created|confirm|processing|shipped|delivered|cancelled
subtotalAmt       Number
ivaTotal          Number          IVA total
itTotal           Number          IT total
totalAmt          Number          Total original
totalUsd          Number          Total en USD
totalBob          Number          Total en BOB
shippingSettle    Number          Monto de envío para liquidación
feesSettle        Number          Fees para liquidación
bobPerUsd         Number          Snapshot de tasa FX al crear orden
usedFallback      Boolean         Si usó tasa fallback
settleCurrency    String          Moneda de liquidación
```

### Payment (`payment.model.js`)

```
storeId           ObjectId→Store
orderId           ObjectId→Order
provider          String          PAYPAL | CRYPTIX
providerPaymentId String          ID del proveedor
intentId          String          Intent de pago
status            String          CREATED|APPROVED|AUTHORIZED|CAPTURED|FAILED|CANCELED|REFUNDED|PARTIALLY_REFUNDED
amount            Object          { currency, value }
capturedAmount    Object          { currency, value }
payer             Object          Datos del pagador
idempotencyKey    String          Clave de idempotencia
providerData      Mixed           Datos raw del proveedor
refunds[]         Object          Historial de refunds
  ├── amount      Object
  ├── refundId    String
  ├── reason      String
  └── timestamp   Date
```

### Settlement (`settlement.model.js`)

```
storeId           ObjectId→Store
periodFrom        Date            Inicio del período
periodTo          Date            Fin del período
amountUSD         Number          Monto en USD
amountBOB         Number          Monto en BOB
fxUsed            Number          Tasa FX usada
metrics           Object
  ├── grossUSD    Number
  ├── refundsUSD  Number
  ├── feesUSD     Number
  ├── netUSD      Number
  └── paymentsCount Number
status            String          PENDING | PAID | CANCELLED
proofUrl          String          Comprobante de pago
notes             String          Notas
createdBy         ObjectId→User
paidBy            ObjectId→User
paidAt            Date
```

### DeliveryTask (`deliveryTask.model.js`)

```
storeId           ObjectId→Store
orderId           ObjectId→Order
assigneeId        ObjectId→User   Repartidor asignado
shippingMethod    String          MTZSTORE_EXPRESS|MTZSTORE_STANDARD|STORE
status            String          PENDING|ASSIGNED|PICKED_UP|IN_TRANSIT|FAILED|DELIVERED|CANCELLED
address           Object          Datos de dirección completos
  ├── name, phone, lines, city, state, zip, country
  └── geo { lat, lng }
timeline[]        Object          Eventos del delivery
proofs[]          Object          Fotos/documentos de entrega
  ├── url         String
  └── publicId    String (Cloudinary)
```

### ShippingRate (`shippingRate.model.js`)

```
method            String          MTZSTORE_EXPRESS|MTZSTORE_STANDARD|STORE_EXPRESS|STORE_STANDARD|STORE
zone              String          Zona geográfica
baseRate          Number          Tarifa base
perKgRate         Number          Tarifa por kg adicional
freeAbove         Number          Envío gratis sobre este monto
estimatedDays     Object          { min, max }
active            Boolean
```

### AuditLog (`auditLog.model.js`)

```
at                Date            Timestamp
actorId           ObjectId→User   Quién realizó la acción
actorRole         String          Rol del actor
tenantStoreId     ObjectId→Store  Tienda contexto
action            String          Acción realizada
entity            String          Entidad afectada
entityId          String          ID de la entidad
status            String          OK | ERROR
ip                String          IP del request
ua                String          User agent
meta              Mixed           Datos adicionales
```

### DirectSale (`directSale.model.js`)

```
saleNumber        String          Número de venta (único)
type              String          Tipo de venta
saleMode          String          RETAIL | WHOLESALE
items[]           Object          Productos vendidos
customer          Object          Datos del cliente
  ├── name, phone, document, email
subtotal          Number
ivaEnabled        Boolean
ivaPct/ivaAmount  Number
itEnabled         Boolean
itPct/itAmount    Number
total             Number
currency          String
paymentMethod     String
paymentStatus     String          PAID | PARTIAL | CREDIT
amountPaid        Number
amountDue         Number
createdBy         ObjectId→User
storeId           ObjectId→Store
```

---

## Índices importantes

- `User.email` — Único
- `Store.slug` — Único
- `Product.storeId` + `status` — Consultas de catálogo por tienda
- `Order.storeId` + `createdAt` — Listados paginados
- `Order.userId` — Historial del usuario
- `Payment.orderId` — Lookup de pagos por orden
- `AuditLog.action` + `tenantStoreId` + `at` — Búsqueda de auditoría
- `DeliveryTask.storeId` + `status` — Entregas activas
- `DirectSale.saleNumber` — Único
- `SellerApplication.userId` + `status` — Parcial (status=PENDING)
