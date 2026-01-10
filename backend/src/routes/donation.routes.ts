import { Router } from 'express';
import { DonationController } from '../controllers/donation.controller.js';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createCauseSchema, makeDonationSchema, createPaymentOrderSchema } from '../schemas/donation.schema.js';

const router = Router();
const donationController = new DonationController();

// Public routes
router.get('/causes', optionalAuth, donationController.getCauses);
router.get('/causes/:id', optionalAuth, donationController.getCauseById);

// Donation
router.post('/create-order', authenticate, validateBody(createPaymentOrderSchema), donationController.createPaymentOrder);
router.post('/', authenticate, validateBody(makeDonationSchema), donationController.makeDonation);
router.post('/verify', authenticate, donationController.verifyPayment);

// My donations
router.get('/my', authenticate, donationController.getMyDonations);
router.get('/my/:id/receipt', authenticate, donationController.getReceipt);

// Admin routes
router.post('/causes', authenticate, requireAdmin, validateBody(createCauseSchema), donationController.createCause);
router.put('/causes/:id', authenticate, requireAdmin, validateBody(createCauseSchema), donationController.updateCause);
router.delete('/causes/:id', authenticate, requireAdmin, donationController.deleteCause);
router.get('/causes/:id/donations', authenticate, requireAdmin, donationController.getCauseDonations);

export default router;
