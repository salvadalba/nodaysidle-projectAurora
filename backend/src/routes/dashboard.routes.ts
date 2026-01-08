import { Router } from 'express';
import {
    listDashboards,
    getDashboardById,
    getLayers,
    createDashboardHandler,
    createLayerHandler,
} from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// GET /api/dashboards - List all dashboards
router.get('/', listDashboards);

// POST /api/dashboards - Create a new dashboard
router.post('/', createDashboardHandler);

// GET /api/dashboards/:id - Get dashboard with layers/widgets
router.get('/:id', getDashboardById);

// GET /api/dashboards/:id/layers - Get layers for a dashboard
router.get('/:id/layers', getLayers);

// POST /api/dashboards/:id/layers - Create a new layer
router.post('/:id/layers', createLayerHandler);

export default router;
