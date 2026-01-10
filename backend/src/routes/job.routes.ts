import { Router } from 'express';
import { JobController } from '../controllers/job.controller.js';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createJobSchema, applyJobSchema } from '../schemas/job.schema.js';

const router = Router();
const jobController = new JobController();

// Public routes
router.get('/', optionalAuth, jobController.getJobs);
router.get('/:id', optionalAuth, jobController.getJobById);

// Applications
router.post('/:id/apply', authenticate, validateBody(applyJobSchema), jobController.applyForJob);
router.get('/my/applications', authenticate, jobController.getMyApplications);

// My posted jobs
router.get('/my/posted', authenticate, jobController.getMyPostedJobs);
router.post('/', authenticate, validateBody(createJobSchema), jobController.createJob);
router.put('/:id', authenticate, validateBody(createJobSchema), jobController.updateJob);
router.delete('/:id', authenticate, jobController.deleteJob);
router.get('/:id/applications', authenticate, jobController.getJobApplications);
router.put('/applications/:applicationId/status', authenticate, jobController.updateApplicationStatus);

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, jobController.getAllJobs);
router.put('/:id/approve', authenticate, requireAdmin, jobController.approveJob);

export default router;
