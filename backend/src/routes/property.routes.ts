import { Router } from 'express';
import { PropertyController } from '../controllers/property.controller.js';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createPropertySchema } from '../schemas/property.schema.js';

const router = Router();
const propertyController = new PropertyController();

// Public routes
router.get('/', optionalAuth, propertyController.getProperties);
router.get('/featured', optionalAuth, propertyController.getFeaturedProperties);
router.get('/:id', optionalAuth, propertyController.getPropertyById);

// My properties
router.get('/my/list', authenticate, propertyController.getMyProperties);
router.post('/', authenticate, validateBody(createPropertySchema), propertyController.createProperty);
router.put('/:id', authenticate, validateBody(createPropertySchema), propertyController.updateProperty);
router.delete('/:id', authenticate, propertyController.deleteProperty);

// Admin routes
router.put('/:id/approve', authenticate, requireAdmin, propertyController.approveProperty);
router.put('/:id/reject', authenticate, requireAdmin, propertyController.rejectProperty);
router.put('/:id/feature', authenticate, requireAdmin, propertyController.toggleFeatured);

export default router;
