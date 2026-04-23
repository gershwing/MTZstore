# FX y monedas

## Resumen

MTZstore opera con dos monedas principales:
- **USD** (Dólar estadounidense) — Moneda base de referencia
- **BOB** (Boliviano) — Moneda local de Bolivia

La tasa de cambio se obtiene en tiempo real desde Binance y se cachea por 60 segundos.

---

## Fuentes de tasa de cambio

### Prioridad de resolución

```
1. Binance API (real-time)    → Tasa USDT/BOB actual
2. .env FX_USD_BOB            → Tasa configurada manualmente (6.96)
3. .env FX_FALLBACK_BOB_PER_USDT → Tasa fallback (6.90)
4. Hardcoded 1.0              → Sin conversión (desarrollo)
```

### Servicio Binance (`server/services/binanceService.js`)

Consulta la API pública de Binance para obtener la tasa BOB/USDT:
```javascript
// Endpoint: https://api.binance.com/api/v3/ticker/price
// Par: USDTBOB (o similar)
// Cache: 60 segundos (FX_CACHE_TTL_MS)
```

---

## Servicio FX (`server/services/fx.service.js`)

### Snapshot de tasa

Cada snapshot incluye:
```javascript
{
  usdBob: 6.96,       // 1 USD = X BOB
  bobUsd: 0.1437,     // 1 BOB = X USD
  asOf: "2024-04-20T12:00:00Z",  // Timestamp
  source: "binance"    // Fuente: "binance" | "env" | "fallback"
}
```

### Funciones principales

```javascript
getFxSnapshot()
// Retorna el snapshot actual (cacheado o fresco)

convertToUsd(amountBob, snapshot)
// Convierte BOB a USD

convertToBob(amountUsd, snapshot)
// Convierte USD a BOB

enrichProductWithFx(product, snapshot)
// Agrega precios en ambas monedas al producto
// Aplica marginPct si existe
```

### Enriquecimiento de productos

Cuando se muestra un producto, el servicio calcula precios en ambas monedas:

```javascript
// Producto con baseCurrency: "USD", basePrice: 100, marginPct: 10
{
  basePrice: 100,           // Precio base USD
  priceUsd: 110,            // Con margen (100 * 1.10)
  priceBob: 765.60,         // 110 * 6.96
  baseCurrency: "USD"
}
```

---

## FX en órdenes

Al crear una orden, se captura un snapshot de la tasa actual:

```javascript
order.bobPerUsd = 6.96      // Tasa al momento de la orden
order.usedFallback = false   // Si se usó tasa fallback
order.totalUsd = 100.00      // Total en USD
order.totalBob = 696.00      // Total en BOB
```

Esto asegura que la liquidación use la tasa del momento de la compra, no la tasa actual.

---

## Monedas por entidad

| Entidad | Campo | Opciones | Descripción |
|---------|-------|----------|-------------|
| Product | `baseCurrency` | USD, BOB | Moneda en la que se define el precio |
| Store | `currency` | USD, BOB | Moneda de catálogo de la tienda |
| Store | `settlementCurrency` | USD, BOB, USDT | Moneda de liquidación |
| Order | `totalUsd`, `totalBob` | - | Totales en ambas monedas |
| Order | `settleCurrency` | USD, BOB | Moneda de liquidación de la orden |
| Settlement | `amountUSD`, `amountBOB` | - | Montos de liquidación |
| Settlement | `fxUsed` | - | Tasa usada para la conversión |

---

## Middleware de moneda del viewer

`withViewerCurrency` inyecta la moneda preferida del usuario en el request:

```javascript
req.viewerCurrency = "BOB"  // o "USD"
```

Usado para mostrar precios en la moneda preferida del comprador.

---

## Cache

| Parámetro | Valor por defecto | Variable de entorno |
|-----------|------------------|---------------------|
| TTL del cache | 60,000 ms (1 min) | `FX_CACHE_TTL_MS` |
| Tasa manual | 6.96 | `FX_USD_BOB` |
| Tasa fallback | 6.90 | `FX_FALLBACK_BOB_PER_USDT` |

El cache es in-memory (no Redis). Se renueva automáticamente al expirar.

---

## Frontend

El hook `useFxRate` (admin) obtiene la tasa actual:

```javascript
const { rate, loading } = useFxRate();
// rate = { usdBob: 6.96, bobUsd: 0.1437, asOf: "...", source: "binance" }
```

Y `formatPrice(amount, currency)` formatea precios:
```javascript
formatPrice(696, "BOB")  // "696.00 Bs"
formatPrice(100, "USD")  // "$100.00"
```
