// server/routes/debug.route.js (temporal)
import { Router } from 'express';
import auth from '../middlewares/auth.js';
const router = Router();

router.get('/__whoami', auth, (req, res) => {
  res.json({
    email: req.user?.email,
    role: req.user?.role,
    isPlatformSuperAdmin: req.user?.isPlatformSuperAdmin || req.isPlatformSuperAdmin,
    xStoreId: req.headers['x-store-id'] || null,
    tenantId: req.tenantId ?? req.tenant?.storeId ?? null,
  });
});
export default router;
