// server/index.js
import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import connectDB from './config/connectDb.js';

import { applySanitizers, xssTrim } from './middlewares/sanitize.js';

/* Routers */
import userRouter from './routes/user.route.js';
import categoryRouter from './routes/category.route.js';
import productRouter from './routes/product.route.js';
import cartRouter from './routes/cart.route.js';
import myListRouter from './routes/mylist.route.js';
import addressRouter from './routes/address.route.js';
import homeSlidesRouter from './routes/homeSlides.route.js';
import bannerV1Router from './routes/bannerV1.route.js';
import bannerList2Router from './routes/bannerList2.route.js';
import blogRouter from './routes/blog.route.js';
import orderRouter from './routes/order.route.js';
import logoRouter from './routes/logo.route.js';
import storeRoute from './routes/store.route.js';
import inventoryRouter from './routes/inventory.route.js';
import promotionRouter from './routes/promotion.route.js';
import paymentRouter from './routes/payment.route.js';
import webhookRouter from './routes/webhook.route.js';
import settlementRouter from "./routes/settlement.route.js";
import supportRouter from "./routes/support.route.js";
import deliveryRouter from "./routes/delivery.route.js";
import reportExportRouter from "./routes/reportExport.route.js";
import reportRouter from "./routes/report.route.js";
import auditRouter from "./routes/audit.route.js";
import permissionAdminRouter from "./routes/permissionAdmin.route.js";
import adminUsersRoute from './routes/admin.users.route.js';
import uploadRoute from "./routes/upload.route.js";
import sellerApplicationRoute from "./routes/sellerApplication.route.js";
import deliveryApplicationsRouter from "./routes/deliveryApplication.route.js";
import categoryAttributeRouter from "./routes/categoryAttribute.route.js";
import filterRouter from "./routes/productFilter.route.js";
import productMediaRouter from "./routes/productMedia.route.js";
import fxRouter from './routes/productFx.route.js';

/* Modelos (syncIndexes opcional) */
import Product from './models/product.model.js';
import Order from './models/order.model.js';
import Store from './models/store.model.js';
import User from './models/user.model.js';

/* Auth + tenant + FX */
import auth from './middlewares/auth.js';
import withTenant from './middlewares/withTenant.js';
import withViewerCurrency from './middlewares/withViewerCurrency.js';
import { getFxSnapshot } from './services/fx.service.js';

import { attachResponseHelpers } from './middlewares/responseShape.js';
import { errorHandler } from './middlewares/errorHandler.js';

import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = 30;

/* ====== HTTP + Socket.IO ====== */
import http from 'http';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
const isProd = process.env.NODE_ENV === 'production';

/* ===== CORS HTTP (ponerlo primero) ===== */
const envAdmin = process.env.ADMIN_ORIGIN || 'http://localhost:5173';
const envStore = process.env.STORE_ORIGIN || 'http://localhost:5174';
const envClient = process.env.CLIENT_ORIGIN;
const extra = process.env.EXTRA_ORIGIN;
const webOrigin = process.env.WEB_ORIGIN;

const STATIC_WHITELIST = [envAdmin, envStore, envClient, extra, webOrigin].filter(Boolean);
const LOCAL_WHITELIST = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
]);

function isAllowedOrigin(origin) {
    if (!origin) return true; // Postman/SSR/healthchecks
    if (STATIC_WHITELIST.includes(origin)) return true;
    if (LOCAL_WHITELIST.has(origin)) return true;
    return false;
}

const corsOptions = {
    origin(origin, cb) {
        return isAllowedOrigin(origin)
            ? cb(null, true)
            : cb(new Error(`CORS not allowed for origin: ${origin}`));
    },
    credentials: true, // ⬅ imprescindible para cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Cache-Control',
        'Pragma',
        // Variantes comunes de tenant/store headers para evitar fallos de preflight
        'X-Store-Id', 'x-store-id', 'X-StoreId', 'x-storeid',
        'X-Tenant-Id', 'x-tenant-id', 'X-TenantId', 'x-tenantid',
        'X-Viewer-Currency',
        'X-CSRF-Token',
        'Accept',
    ],
    exposedHeaders: ['Content-Disposition', 'X-Total-Count'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight rápido

/* Seguridad + compresión */
app.use(helmet({ crossOriginResourcePolicy: false }));

// NO comprimir SSE
app.use(
    compression({
        filter: (req, res) => {
            if (req.path && req.path.startsWith('/api/events')) return false;
            return compression.filter(req, res);
        },
    })
);

if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);

if (!isProd) app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

/* Sanitizado + helpers */
applySanitizers(app);
app.use(xssTrim);
app.use(attachResponseHelpers);

/* Servir archivos subidos (pruebas de entrega, etc.) */
app.use("/uploads", express.static(path.resolve("uploads")));

/* Health */
app.get('/', (req, res) => res.ok({ message: 'Server is running ' + (process.env.PORT || 8000) }));

/* Evitar cache en /api/user/me (algunos proxies aplican ETag y molesta al refrescar) */
app.use((req, res, next) => {
    if (req.method === 'GET' && req.path === '/api/user/me') {
        try {
            res.set('Cache-Control', 'no-store');
            res.removeHeader('ETag');
        } catch { }
    }
    next();
});

/* Logger útil en dev para confirmar cookies/headers cuando hay 401 */
if (!isProd) {
    app.use((req, _res, next) => {
        if (req.path.startsWith('/api/user')) {
            console.log('[user] cookies:', Object.keys(req.cookies || {}));
            console.log('[user] auth header:', req.get('authorization'));
        }
        next();
    });
}

/* ========= Rutas sin tenant ========= */
app.use("/api/seller-applications", sellerApplicationRoute);
app.use("/api/delivery-applications", deliveryApplicationsRouter);

/* ========= Rutas resto ========= */
app.use('/api/user', userRouter);
app.use('/api/category', categoryRouter);
app.use('/api/product/media', productMediaRouter);  // media before CRUD to skip productRouter middleware
app.use('/api/product', filterRouter);   // public filter/list routes (must be before CRUD)
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/myList', myListRouter);
app.use('/api/address', addressRouter);
app.use('/api/homeSlides', homeSlidesRouter);
app.use('/api/bannerV1', bannerV1Router);
app.use('/api/bannerList2', bannerList2Router);
app.use('/api/blog', blogRouter);
app.use('/api/order', orderRouter);
app.use('/api/logo', logoRouter);
app.use('/api/store', storeRoute);
app.use('/api/inventory', inventoryRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/webhook', webhookRouter);
app.use('/api/settlements', settlementRouter);
app.use('/api/support', supportRouter);
app.use('/api/delivery', deliveryRouter);
app.use('/api/report', reportRouter);
app.use('/api/report', reportExportRouter);
app.use('/api/audit', auditRouter);
app.use('/api/permissions', permissionAdminRouter);
app.use('/api/admin', adminUsersRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/categoryAttribute", categoryAttributeRouter);
app.use('/api/fx', fxRouter);

import directSalesRouter from './routes/directSales.route.js';
app.use('/api/direct-sales', directSalesRouter);

import profitLossRouter from './routes/profitLoss.route.js';
app.use('/api/profit-loss', profitLossRouter);

import contactRouter from './routes/contact.route.js';
app.use('/api/contacts', contactRouter);

import salePaymentsRouter from './routes/salePayments.route.js';
app.use('/api/sale-payments', salePaymentsRouter);

import shippingRouter from './routes/shipping.route.js';
app.use('/api/shipping', shippingRouter);

/* ========= Rutas con tenant ========= */
app.use(
    '/api/promotion',
    auth,
    withTenant({ required: false, source: 'auto' }),
    withViewerCurrency(getFxSnapshot),
    promotionRouter
);

/* 404 */
app.use((req, res) => res.err(404, 'NOT_FOUND', 'Ruta no encontrada'));

/* Error handler */
app.use(errorHandler);

/* ====== Crear HTTP server y Socket.IO ====== */
const server = http.createServer(app);

/* ========= Secret de access token (compat) ========= */
function getAccessSecret() {
    return (
        process.env.SECRET_KEY_ACCESS_TOKEN || // recomendado
        process.env.JWT_ACCESS_KEY ||          // compat
        process.env.JSON_WEB_TOKEN_SECRET_KEY  // fallback dev
    );
}

/* ========= Socket.IO config ========= */
const SOCKET_TRANSPORTS = (process.env.SOCKET_TRANSPORTS || 'websocket,polling')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

const io = new SocketIOServer(server, {
    path: "/socket.io",
    cors: {
        origin(origin, callback) {
            if (isAllowedOrigin(origin)) return callback(null, true);
            return callback(new Error(`WS CORS not allowed for origin: ${origin}`));
        },
        credentials: true,
    },
    transports: SOCKET_TRANSPORTS,
    pingTimeout: 20000,
    pingInterval: 25000,
    allowEIO3: true,
});

/** 🔐 Handshake auth */
io.use((socket, next) => {
    const raw =
        socket.handshake?.auth?.token ||
        String(socket.handshake?.headers?.authorization || "").replace(/^Bearer\s+/i, "");

    socket.data = socket.data || {};
    socket.data.accessToken = raw || null;

    if (!raw) return next(); // permitir anónimo

    try {
        const payload = jwt.verify(raw, getAccessSecret());
        const id = payload?.id || payload?._id || payload?.userId;
        if (id) socket.userId = String(id);
    } catch {
        // token inválido → seguir como anónimo
    }
    return next();
});

/** ========= Registro de sockets por usuario ========= */
const userSockets = new Map();

io.on('connection', (socket) => {
    const userId = socket.userId || null;

    if (userId) {
        if (!userSockets.has(userId)) userSockets.set(userId, new Set());
        userSockets.get(userId).add(socket.id);

        // Room por usuario (prefijo)
        socket.join(`user:${userId}`);
        // (compat legacy) socket.join(userId);
    }

    socket.on('disconnect', () => {
        if (!userId) return;
        const set = userSockets.get(userId);
        if (!set) return;
        set.delete(socket.id);
        if (set.size === 0) userSockets.delete(userId);
    });
});

/* Logs útiles para diagnosticar problemas de upgrade */
try {
    io.engine.on('connection_error', (err) => {
        console.warn('[socket.io] engine connection_error:', err?.code, err?.message);
    });
    io.engine.on('initial_headers', (headers, req) => {
        // console.log('[socket.io] initial_headers from', req.headers.origin);
    });
} catch { }

/** ========= Export util global ========= */
export function emitToUser(userId, event, payload) {
    if (!userId) return;
    const uid = String(userId);
    io.to(`user:${uid}`).emit(event, payload);
    // io.to(uid).emit(event, payload); // compat sin prefijo si lo usas
}

/* ====== Boot + (opcional) syncIndexes ====== */
connectDB()
    .then(async () => {
        if (process.env.SYNC_INDEXES === 'true') {
            await Promise.all([
                Product.syncIndexes(),
                Order.syncIndexes(),
                Store.syncIndexes(),
                User.syncIndexes(),
            ]);
            console.log('Índices sincronizados ✅');
        }

        server.listen(process.env.PORT || 8000, () => {
            console.log('Server is running', process.env.PORT || 8000);
            console.log('[socket.io] transports:', SOCKET_TRANSPORTS.join(', '));
        });
    })
    .catch((err) => {
        console.error('Error al conectar DB:', err);
        process.exit(1);
    });

export { server, io };
export default app;
