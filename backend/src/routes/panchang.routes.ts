import { Router } from 'express';
import { PanchangController } from '../controllers/panchang.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();
const panchangController = new PanchangController();

// Get today's panchang
router.get('/today', optionalAuth, panchangController.getToday);

// Get panchang for a specific date
router.get('/date/:date', optionalAuth, panchangController.getByDate);

// Get panchang for a month
router.get('/month/:year/:month', optionalAuth, panchangController.getMonth);

// Get upcoming parv (festivals)
router.get('/parv', optionalAuth, panchangController.getUpcomingParv);

// Get parv for a specific month
router.get('/parv/:year/:month', optionalAuth, panchangController.getParvByMonth);

export default router;
