import { Router } from 'express';
import { BusinessController } from '../controllers/business.controller.js';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createBusinessSchema, inquirySchema } from '../schemas/business.schema.js';

const router = Router();
const businessController = new BusinessController();

// Categories
router.get('/categories', businessController.getCategories);

// Public routes
router.get('/', optionalAuth, businessController.getBusinesses);
router.get('/featured', optionalAuth, businessController.getFeaturedBusinesses);
router.get('/:id', optionalAuth, businessController.getBusinessById);

// Inquiry
router.post('/:id/inquiry', authenticate, validateBody(inquirySchema), businessController.submitInquiry);

// My businesses
router.get('/my/list', authenticate, businessController.getMyBusinesses);
router.post('/', authenticate, validateBody(createBusinessSchema), businessController.createBusiness);
router.put('/:id', authenticate, validateBody(createBusinessSchema), businessController.updateBusiness);
router.delete('/:id', authenticate, businessController.deleteBusiness);
router.get('/:id/inquiries', authenticate, businessController.getBusinessInquiries);

// Admin routes
router.put('/:id/approve', authenticate, requireAdmin, businessController.approveBusiness);
router.put('/:id/reject', authenticate, requireAdmin, businessController.rejectBusiness);
router.put('/:id/feature', authenticate, requireAdmin, businessController.toggleFeatured);

export default router;
