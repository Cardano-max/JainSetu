import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';

const router = Router();
const adminController = new AdminController();

// Dashboard
router.get('/dashboard', authenticate, requireAdmin, adminController.getDashboard);

// Users
router.get('/users', authenticate, requireAdmin, adminController.getUsers);
router.get('/users/:id', authenticate, requireAdmin, adminController.getUserById);
router.put('/users/:id/status', authenticate, requireAdmin, adminController.updateUserStatus);
router.put('/users/:id/role', authenticate, requireSuperAdmin, adminController.updateUserRole);
router.put('/users/:id/verify', authenticate, requireAdmin, adminController.verifyUser);

// Announcements
router.get('/announcements', authenticate, requireAdmin, adminController.getAnnouncements);
router.post('/announcements', authenticate, requireAdmin, adminController.createAnnouncement);
router.put('/announcements/:id', authenticate, requireAdmin, adminController.updateAnnouncement);
router.delete('/announcements/:id', authenticate, requireAdmin, adminController.deleteAnnouncement);

// Settings
router.get('/settings', authenticate, requireAdmin, adminController.getSettings);
router.put('/settings/:key', authenticate, requireSuperAdmin, adminController.updateSetting);

// Audit Logs
router.get('/audit-logs', authenticate, requireSuperAdmin, adminController.getAuditLogs);

// Reports
router.get('/reports/overview', authenticate, requireAdmin, adminController.getOverviewReport);
router.get('/reports/donations', authenticate, requireAdmin, adminController.getDonationReport);
router.get('/reports/events', authenticate, requireAdmin, adminController.getEventReport);

export default router;
