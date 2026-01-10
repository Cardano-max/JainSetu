import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { updateProfileSchema, updatePrivacySchema, addFamilyMemberSchema } from '../schemas/user.schema.js';

const router = Router();
const userController = new UserController();

// Get user profile
router.get('/profile', authenticate, userController.getProfile);

// Update profile
router.put('/profile', authenticate, validateBody(updateProfileSchema), userController.updateProfile);

// Update privacy settings
router.put('/privacy', authenticate, validateBody(updatePrivacySchema), userController.updatePrivacy);

// Family members
router.get('/family', authenticate, userController.getFamilyMembers);
router.post('/family', authenticate, validateBody(addFamilyMemberSchema), userController.addFamilyMember);
router.put('/family/:id', authenticate, validateBody(addFamilyMemberSchema), userController.updateFamilyMember);
router.delete('/family/:id', authenticate, userController.deleteFamilyMember);

// Notifications
router.get('/notifications', authenticate, userController.getNotifications);
router.put('/notifications/:id/read', authenticate, userController.markNotificationRead);
router.put('/notifications/read-all', authenticate, userController.markAllNotificationsRead);

// Activity / Points
router.get('/points', authenticate, userController.getUserPoints);

export default router;
