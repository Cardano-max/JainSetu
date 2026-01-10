import { Router } from 'express';
import { MatrimonyController } from '../controllers/matrimony.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createProfileSchema, updatePreferencesSchema, sendInterestSchema } from '../schemas/matrimony.schema.js';

const router = Router();
const matrimonyController = new MatrimonyController();

// My Profile
router.get('/my-profile', authenticate, matrimonyController.getMyProfile);
router.post('/profile', authenticate, validateBody(createProfileSchema), matrimonyController.createProfile);
router.put('/profile', authenticate, validateBody(createProfileSchema), matrimonyController.updateProfile);
router.put('/preferences', authenticate, validateBody(updatePreferencesSchema), matrimonyController.updatePreferences);

// Browse Profiles
router.get('/profiles', authenticate, matrimonyController.browseProfiles);
router.get('/profiles/:id', authenticate, matrimonyController.getProfileById);

// Interests
router.post('/interests', authenticate, validateBody(sendInterestSchema), matrimonyController.sendInterest);
router.get('/interests/sent', authenticate, matrimonyController.getSentInterests);
router.get('/interests/received', authenticate, matrimonyController.getReceivedInterests);
router.put('/interests/:id/accept', authenticate, matrimonyController.acceptInterest);
router.put('/interests/:id/reject', authenticate, matrimonyController.rejectInterest);

// Shortlist (can be implemented with a separate table if needed)
router.get('/shortlist', authenticate, matrimonyController.getShortlist);
router.post('/shortlist/:profileId', authenticate, matrimonyController.addToShortlist);
router.delete('/shortlist/:profileId', authenticate, matrimonyController.removeFromShortlist);

// Admin routes
router.get('/admin/profiles', authenticate, requireAdmin, matrimonyController.adminGetProfiles);
router.put('/admin/profiles/:id/approve', authenticate, requireAdmin, matrimonyController.adminApproveProfile);
router.put('/admin/profiles/:id/reject', authenticate, requireAdmin, matrimonyController.adminRejectProfile);
router.put('/admin/profiles/:id/verify', authenticate, requireAdmin, matrimonyController.adminVerifyProfile);

export default router;
