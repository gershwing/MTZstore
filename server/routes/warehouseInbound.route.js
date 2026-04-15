import { Router } from 'express';
import auth from '../middlewares/auth.js';
import withTenant from '../middlewares/withTenant.js';
import { requirePermission } from '../middlewares/requirePermission.js';
import {
  create, listMine, listAdmin, getById, approve, reject
} from '../controllers/warehouseInbound.controller.js';

const router = Router();

// Seller endpoints
router.post('/', auth, withTenant({ required: true }), create);
router.get('/mine', auth, listMine);

// Admin endpoints
router.get('/admin', auth, withTenant({ required: false }), requirePermission('warehouse:read'), listAdmin);
router.get('/admin/:id', auth, withTenant({ required: false }), requirePermission('warehouse:read'), getById);
router.patch('/:id/approve', auth, withTenant({ required: false }), requirePermission('warehouse:write'), approve);
router.patch('/:id/reject', auth, withTenant({ required: false }), requirePermission('warehouse:write'), reject);

export default router;
