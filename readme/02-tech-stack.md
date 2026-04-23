# Tech Stack

## Backend (Server)

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Node.js | ES Modules | Runtime |
| Express.js | 4.21 | Framework HTTP |
| MongoDB | - | Base de datos |
| Mongoose | 8.9 | ODM para MongoDB |
| JSON Web Token | 9.0 | Autenticación |
| Socket.IO | 4.8 | Comunicación en tiempo real |
| Cloudinary | 2.5 | Hosting de imágenes |
| Multer | 1.4 | Upload de archivos |
| Nodemailer | 6.9 | Envío de emails (SMTP Gmail) |
| PayPal SDK | - | Procesamiento de pagos |
| bcryptjs | 2.4 | Hash de contraseñas |
| Helmet | 8.0 | Seguridad HTTP headers |
| express-rate-limit | 7.4 | Rate limiting |
| express-mongo-sanitize | 2.2 | Prevención NoSQL injection |
| hpp | 0.2 | Prevención HTTP parameter pollution |
| Axios | 1.7 | Requests HTTP (Binance FX) |
| ExcelJS | 4.4 | Generación de reportes Excel |
| Puppeteer | 23.7 | Generación de PDFs |
| Slugify | 1.6 | Generación de slugs |

---

## Frontend — Client (Tienda pública)

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React | 18.3 | UI Framework |
| Vite | 5.4 | Build tool / Dev server |
| React Router DOM | 7.0 | Navegación |
| Material-UI (MUI) | 6.x | Componentes UI |
| Tailwind CSS | 3.4 | Estilos utilitarios |
| Styled Components | 6.1 | CSS-in-JS |
| Firebase Auth | 11.0 | Google OAuth login |
| Stripe.js | 5.6 | Pagos con tarjeta |
| Swiper | 11.1 | Carruseles / sliders |
| Axios | 1.7 | HTTP client |
| React Hot Toast | 2.4 | Notificaciones toast |
| React Icons | 5.3 | Iconografía |
| React Range Slider | - | Filtros de rango de precio |

---

## Frontend — Admin (Panel de administración)

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React | 18.3 | UI Framework |
| Vite | 6.0 | Build tool / Dev server |
| React Router DOM | 6.30 | Navegación |
| Material-UI (MUI) | 6.x | Componentes UI |
| MUI X Data Grid | 8.13 | Tablas avanzadas |
| Tailwind CSS | 3.4 | Estilos utilitarios |
| TanStack React Query | 5.90 | Server state / caching |
| Recharts | 2.15 | Gráficos y analytics |
| Socket.IO Client | 4.8 | Eventos en tiempo real |
| Firebase Auth | 11.0 | Google OAuth login |
| jsPDF | - | Exportación a PDF |
| html2canvas | - | Capturas para PDF |
| React Simple WYSIWYG | - | Editor de texto enriquecido |
| dayjs / date-fns | - | Manejo de fechas |
| Axios | 1.7 | HTTP client |

---

## Servicios externos

| Servicio | Uso |
|---------|-----|
| MongoDB Atlas | Base de datos en la nube |
| Cloudinary | CDN y hosting de imágenes |
| Firebase | Google OAuth para login social |
| PayPal | Procesamiento de pagos (sandbox) |
| Binance API | Tasa de cambio USD/BOB en tiempo real |
| Gmail SMTP | Envío de emails transaccionales |
| Vercel | Hosting de frontends (client + admin) |

---

## Puertos de desarrollo

| Servicio | Puerto |
|---------|--------|
| Server (API) | 8000 |
| Admin (Panel) | 5173 |
| Client (Tienda) | 5174 |
