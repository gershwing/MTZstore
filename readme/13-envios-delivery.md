# Envíos y delivery

## Métodos de envío

MTZstore ofrece 4 métodos de envío, divididos en dos categorías:

### Envíos de plataforma (gestionados por MTZstore)
| Método | Clave | Descripción | Tiempo estimado |
|--------|-------|-------------|-----------------|
| MTZstore Express | `MTZSTORE_EXPRESS` | Envío rápido gestionado por la plataforma | 1-2 días |
| MTZstore Estándar | `MTZSTORE_STANDARD` | Envío estándar gestionado por la plataforma | 3-5 días |

### Envíos de tienda (gestionados por el vendedor)
| Método | Clave | Descripción | Tiempo estimado |
|--------|-------|-------------|-----------------|
| Mi tienda Express | `STORE_EXPRESS` | Envío rápido por el vendedor | 1-2 días |
| Mi tienda Estándar | `STORE_STANDARD` | Envío estándar por el vendedor | 3-5 días |

---

## Cálculo de costos de envío

### Servicio: `server/services/shipping.service.js`

#### Peso facturable
```
pesoFacturable = max(pesoReal, pesoVolumetrico)
pesoVolumetrico = (largo × ancho × alto) / 5000  (estándar DHL/FedEx)
pesoMínimo = 0.1 kg
```

#### Costo
```
costo = tarifaBase + (tarifaPorKg × pesoFacturable)
```

#### Envío gratis
Los métodos de tienda (`STORE_*`) pueden tener envío gratis si el subtotal supera `freeAbove`:
```javascript
if (method.startsWith("STORE") && rate.freeAbove && subtotal >= rate.freeAbove) {
  return 0;
}
```

Los métodos de plataforma (`MTZSTORE_*`) siempre cobran.

---

## Modelo ShippingRate

Tarifas configurables por zona y método en `server/models/shippingRate.model.js`:

```
method          MTZSTORE_EXPRESS | MTZSTORE_STANDARD | STORE_EXPRESS | STORE_STANDARD | STORE
zone            Nombre de la zona (ej: "Cochabamba", "Default")
baseRate        Tarifa base (Bs.)
perKgRate       Tarifa por kg adicional (Bs.)
freeAbove       Envío gratis sobre este monto (solo STORE_*)
estimatedDays   { min: 1, max: 2 }
active          Boolean
```

Si no se encuentra tarifa para la zona específica, se usa la zona `"Default"`.

### Seed inicial
Al iniciar el servidor, `scripts/seedShippingRates.js` pobla las tarifas por defecto si no existen.

---

## Delivery Tasks

Cada orden con envío genera una `DeliveryTask` en `server/models/deliveryTask.model.js`:

### Workflow de estados

```
PENDING ──► ASSIGNED ──► PICKED_UP ──► IN_TRANSIT ──► DELIVERED
   │            │            │              │
   └────────────┴────────────┴──────────────┴──► FAILED
                                                   │
                                                   └──► CANCELLED
```

| Estado | Descripción |
|--------|-------------|
| PENDING | Orden creada, esperando asignación de repartidor |
| ASSIGNED | Repartidor asignado a la entrega |
| PICKED_UP | Repartidor recogió el paquete |
| IN_TRANSIT | Paquete en camino |
| DELIVERED | Entrega completada |
| FAILED | Entrega fallida |
| CANCELLED | Entrega cancelada |

### Datos de la tarea

```
storeId          Tienda propietaria
orderId          Orden asociada
assigneeId       Repartidor asignado
shippingMethod   Método de envío
status           Estado actual
address          Dirección completa
  ├── name       Nombre del destinatario
  ├── phone      Teléfono
  ├── lines      Dirección (calle, número)
  ├── city       Ciudad
  ├── state      Departamento
  ├── zip        Código postal
  ├── country    País
  └── geo        { lat, lng }
timeline[]       Eventos cronológicos
proofs[]         Fotos/documentos de entrega
  ├── url        URL (Cloudinary)
  └── publicId   ID público (Cloudinary)
```

---

## Repartidores

### Postulación

Los usuarios pueden postularse como repartidores via `DeliveryApplication`:

```
Datos requeridos:
- Nombre completo, teléfono, ciudad
- Tipo de vehículo: Moto | Auto | Camioneta | Bicicleta | Otro
- Documento de identidad (foto frontal + trasera)
- Selfie con documento
- Licencia de conducir (si es motorizado)
- Número de placa (si es motorizado)
```

### Workflow de aprobación

```
1. Usuario aplica
   POST /api/delivery-applications

2. Super admin revisa
   GET /api/delivery-applications/admin

3. Super admin aprueba o rechaza
   PATCH /api/delivery-applications/:id/review

4. Si aprobado:
   - Se asigna rol DELIVERY_AGENT al usuario
   - Puede ver entregas disponibles y tomar entregas
```

### Vistas del repartidor

- **Entregas disponibles** (`/admin/available-deliveries`) — Entregas sin asignar que puede tomar
- **Mis entregas** (`/admin/my-deliveries`) — Entregas asignadas al repartidor

---

## Warehouse Inbound (Envíos al almacén)

Sistema para que las tiendas envíen stock al almacén de la plataforma:

```
Modelo: WarehouseInbound

storeId          Tienda que envía
userId           Usuario que crea la solicitud
status           PENDING → APPROVED → RECEIVED (o REJECTED)
lineItems[]      Productos y cantidades
notes            Notas del vendedor
shipmentImages[] Fotos del envío
reviewImages[]   Fotos de revisión (almacén)
reviewNotes      Notas del revisor
reviewedBy       Quién revisó
reviewedAt       Cuándo se revisó
```

### Flujo

```
1. Vendedor crea solicitud de envío
   POST /api/warehouse-inbound

2. Super admin revisa la solicitud
   GET /api/warehouse-inbound

3. Super admin aprueba/rechaza
   PATCH /api/warehouse-inbound/:id/review

4. Si aprobado y recibido:
   - Se actualiza inventario (warehouseStock)
   - Se registra InventoryMovement
```

---

## Inventario

### Movimientos de stock

El modelo `InventoryMovement` registra cada cambio de stock:

```
productId        Producto afectado
variantId        Variante (si aplica)
storeId          Tienda
type             INBOUND | OUTBOUND | ADJUSTMENT | TRANSFER
quantity          Cantidad (positiva o negativa)
reason           Razón del movimiento
reference        Referencia (orderId, warehouseInboundId, etc.)
createdBy        Quién realizó el movimiento
```

### Tipos de stock

- **countInStock** — Stock disponible para venta
- **warehouseStock** — Stock en el almacén de la plataforma

---

## Páginas de órdenes por método de envío

En el admin, las órdenes se pueden ver filtradas por método de envío:

| Ruta | Filtro |
|------|--------|
| `/admin/orders` | Todas las órdenes |
| `/admin/orders/mtzstore-express` | Solo MTZstore Express |
| `/admin/orders/mtzstore-standard` | Solo MTZstore Estándar |
| `/admin/orders/store-express` | Solo Tienda Express |
| `/admin/orders/store-standard` | Solo Tienda Estándar |

Cada vista es un clon de "Todas las órdenes" con el mismo buscador, filtros, exportación CSV y secciones colapsables (plataforma + tiendas), pero filtrada por `shippingMethod`.
