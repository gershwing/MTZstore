# Pagos

## Proveedores soportados

| Proveedor | Tipo | Estado |
|-----------|------|--------|
| PayPal | Tarjetas, PayPal wallet | Sandbox |
| Cryptomus | Criptomonedas | Integrado |
| Contra entrega (CashBOB) | Efectivo al recibir | Activo |

---

## Flujo de pago

### PayPal

```
1. Cliente selecciona PayPal en checkout
   Frontend: botón PayPal SDK

2. Crear orden de pago
   POST /api/payment → paypalCreateOrder()
   Crea Payment con status: CREATED

3. Cliente aprueba en ventana PayPal
   PayPal redirige con approveLink

4. Capturar pago
   POST /api/payment/capture → paypalCaptureOrder()
   Actualiza Payment status: CAPTURED
   Actualiza Order payment_status: CAPTURED

5. Webhook de confirmación (asíncrono)
   POST /api/webhook/paypal
   Valida firma y actualiza estado
```

### Cryptomus

```
1. Crear pago crypto
   POST /api/payment (provider: CRYPTIX)
   Genera link de pago Cryptomus

2. Cliente paga en ventana externa

3. Webhook de confirmación
   POST /api/webhook/cryptomus
   Valida y actualiza Payment + Order
```

### Contra entrega

```
1. Cliente selecciona "Contra entrega" en checkout
   POST /api/order (paymentMethod: "CashBOB")

2. Orden se crea con payment_status: "CASH ON DELIVERY"
   No se procesa pago electrónico

3. Al entregar, el repartidor confirma el cobro
   PATCH /api/delivery/:id (status: DELIVERED)
```

---

## Modelo Payment

```
provider          PAYPAL | CRYPTIX
status            CREATED → APPROVED → AUTHORIZED → CAPTURED
                  (o FAILED / CANCELED / REFUNDED / PARTIALLY_REFUNDED)
amount            { currency: "USD", value: 100.00 }
capturedAmount    { currency: "USD", value: 100.00 }
idempotencyKey    Previene pagos duplicados
refunds[]         Historial de devoluciones
```

### Estados del pago

| Estado | Descripción |
|--------|-------------|
| CREATED | Pago iniciado, pendiente de acción del cliente |
| APPROVED | Cliente aprobó (PayPal) |
| AUTHORIZED | Pago autorizado, pendiente de captura |
| CAPTURED | Pago capturado exitosamente |
| FAILED | Pago fallido |
| CANCELED | Pago cancelado |
| REFUNDED | Pago devuelto completamente |
| PARTIALLY_REFUNDED | Pago devuelto parcialmente |

---

## Idempotencia

Para prevenir cobros duplicados, el sistema usa `IdempotencyKey`:

```javascript
// Middleware idempotency.js
1. Request incluye header/body con idempotencyKey
2. Si la key ya existe y fue exitosa → retorna respuesta anterior
3. Si la key no existe → procesa normalmente
4. Al completar → guarda resultado con la key
```

---

## Webhooks

Los proveedores de pago envían notificaciones asíncronas:

```
POST /api/webhook/paypal    — Eventos de PayPal
POST /api/webhook/cryptomus — Eventos de Cryptomus
```

Cada webhook se registra en el modelo `WebhookEvent`:
```
provider          PAYPAL | CRYPTIX
eventId           ID único del evento
payloadHash       Hash del payload (deduplicación)
eventType         Tipo de evento
processedAt       Timestamp de procesamiento
attempts          Intentos de procesamiento
lastError         Último error
```

---

## Reconciliación

El servicio `orderPayment.service.js` reconcilia pagos con órdenes:
1. Busca pagos con status CAPTURED para una orden
2. Actualiza `order.payment_status` al último estado
3. Vincula `order.latestPaymentId`

---

## Settlements (Liquidaciones)

Las liquidaciones son pagos de la plataforma a las tiendas por sus ventas:

```
Período:     periodFrom → periodTo
Métricas:    grossUSD, refundsUSD, feesUSD, netUSD, paymentsCount
Tasa FX:     fxUsed (USD/BOB al momento de liquidar)
Montos:      amountUSD, amountBOB
Estado:      PENDING → PAID (o CANCELLED)
Prueba:      proofUrl (comprobante de transferencia)
```

### Flujo de liquidación

```
1. Super admin genera liquidación para una tienda
   POST /api/settlement

2. Sistema calcula métricas del período:
   - Gross (ventas brutas)
   - Refunds (devoluciones)
   - Fees (comisiones de plataforma)
   - Net = Gross - Refunds - Fees

3. Convierte a moneda de liquidación de la tienda (settlementCurrency)

4. Super admin marca como pagado con comprobante
   PATCH /api/settlement/:id { status: "PAID", proofUrl }
```

---

## Ventas directas (POS)

Para ventas presenciales fuera del flujo online:

```
Métodos:     CASH | TRANSFER | QR | MIXED
Estados:     PAID | PARTIAL | CREDIT
Impuestos:   IVA (configurable), IT (configurable)
Facturación: saleNumber auto-generado
```

El modelo `SalePayment` registra cada pago parcial para ventas a crédito.
