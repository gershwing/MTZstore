// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const USE_PROXY = String(env.VITE_USE_PROXY || '').toLowerCase() === 'true';

  // ⚙️ Puertos/targets
  const DEV_PORT = Number(env.VITE_DEV_PORT || 5173);
  const PREVIEW_PORT = Number(env.VITE_PREVIEW_PORT || 4173);
  const API_TARGET = env.VITE_API_URL || 'http://localhost:8000'; // backend HTTP/S
  const WS_TARGET = env.VITE_WS_URL || API_TARGET;                // backend WS (socket.io / ws)

  // 🧰 Logs de proxy (visibles en consola)
  const attachProxyLogging = (proxy, label, target) => {
    proxy.on('error', (err, _req, _res) => {
      console.error(`[vite-proxy:${label}] error:`, err?.code || err?.message || err);
    });
    proxy.on('proxyReq', (proxyReq, req) => {
      console.info(`[vite-proxy:${label}] → ${target}${req.url}`);
      proxyReq.setHeader('X-Forwarded-Proto', 'http');
      proxyReq.setHeader('X-Forwarded-Host', 'localhost:' + DEV_PORT);
    });
    proxy.on('proxyRes', (proxyRes, req) => {
      console.info(`[vite-proxy:${label}] ← ${proxyRes.statusCode} ${req.method} ${req.url}`);
      // Normaliza cookies para dev http (quita Secure / ajusta SameSite)
      const setCookie = proxyRes.headers['set-cookie'];
      if (Array.isArray(setCookie)) {
        proxyRes.headers['set-cookie'] = setCookie.map((c) =>
          c.replace(/; ?Secure/gi, '').replace(/; ?SameSite=None/gi, '; SameSite=Lax')
        );
      }
    });
    proxy.on?.('upgrade', (_req, _socket, _head) => {
      console.info(`[vite-proxy:${label}] (ws) upgrade`);
    });
  };

  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    server: {
      // Si necesitas acceder desde otra máquina en tu red: usa '0.0.0.0'
      host: env.VITE_DEV_HOST || 'localhost',
      port: DEV_PORT,
      open: false,
      strictPort: true,
      cors: true,

      // HMR por WebSocket (por defecto). Si usas túneles/containers, ajusta host si hace falta.
      hmr: {
        protocol: 'ws',
        host: env.VITE_HMR_HOST || 'localhost',
        clientPort: DEV_PORT,
      },

      ...(USE_PROXY
        ? {
          proxy: {
            // API REST principal
            '/api': {
              target: API_TARGET,
              changeOrigin: true,
              secure: false,
              ws: true, // por si tu backend expone ws bajo /api
              configure: (proxy) => attachProxyLogging(proxy, 'api', API_TARGET),
            },

            // SSE: stream de eventos (NO WebSocket)
            '/api/events': {
              target: API_TARGET,
              changeOrigin: true,
              secure: false,
              ws: false,
              proxyTimeout: 0,
              timeout: 0,
              configure: (proxy) => attachProxyLogging(proxy, 'events', API_TARGET),
            },

            // ✅ Socket.IO (WebSocket)
            '/socket.io': {
              target: WS_TARGET,
              changeOrigin: true,
              secure: false,
              ws: true, // imprescindible para handshake WS
              // No reescribas el path; Socket.IO espera exactamente /socket.io
              configure: (proxy) => attachProxyLogging(proxy, 'socket', WS_TARGET),
            },

            // ✅ WS nativo u otros paths de WS
            '/ws': {
              target: WS_TARGET,
              changeOrigin: true,
              secure: false,
              ws: true,
              configure: (proxy) => attachProxyLogging(proxy, 'ws', WS_TARGET),
            },

            // Archivos estáticos / uploads
            '/uploads': {
              target: API_TARGET,
              changeOrigin: true,
              secure: false,
              ws: false,
              configure: (proxy) => attachProxyLogging(proxy, 'uploads', API_TARGET),
            },
          },
        }
        : {}),
    },

    preview: {
      host: 'localhost',
      port: PREVIEW_PORT,
      open: false,
      cors: true,
    },

    base: '/',
  };
});
