import { Router } from 'express';
import {
    createWidgetHandler,
    updateWidgetHandler,
    updateDockingHandler,
    deleteWidgetHandler,
    getWidgetDataHandler,
    getWidgetHandler,
} from '../controllers/widget.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All widget routes require authentication
router.use(authenticate);

// POST /api/widgets - Create a new widget
router.post('/', createWidgetHandler);

// GET /api/widgets/:id - Get a widget
router.get('/:id', getWidgetHandler);

// PATCH /api/widgets/:id - Update a widget
router.patch('/:id', updateWidgetHandler);

// DELETE /api/widgets/:id - Delete a widget
router.delete('/:id', deleteWidgetHandler);

// GET /api/widgets/:id/data - Get widget data
router.get('/:id/data', getWidgetDataHandler);

// PATCH /api/widgets/:id/docking - Update docking state
router.patch('/:id/docking', updateDockingHandler);

export default router;
