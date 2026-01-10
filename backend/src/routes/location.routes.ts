import { Router } from 'express';
import { LocationController } from '../controllers/location.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();
const locationController = new LocationController();

// Cities
router.get('/cities', locationController.getCities);
router.get('/cities/search', locationController.searchCities);
router.get('/cities/:id', locationController.getCityById);

// Sanghs
router.get('/sanghs', locationController.getSanghs);
router.get('/sanghs/search', locationController.searchSanghs);
router.get('/sanghs/:id', locationController.getSanghById);

// Admin routes
router.post('/cities', authenticate, requireAdmin, locationController.createCity);
router.put('/cities/:id', authenticate, requireAdmin, locationController.updateCity);

router.post('/sanghs', authenticate, requireAdmin, locationController.createSangh);
router.put('/sanghs/:id', authenticate, requireAdmin, locationController.updateSangh);

export default router;
