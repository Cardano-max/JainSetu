import { Router } from 'express';
import { EventController } from '../controllers/event.controller.js';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createEventSchema, registerEventSchema, feedbackSchema } from '../schemas/event.schema.js';

const router = Router();
const eventController = new EventController();

// Public routes
router.get('/', optionalAuth, eventController.getEvents);
router.get('/upcoming', optionalAuth, eventController.getUpcomingEvents);
router.get('/:id', optionalAuth, eventController.getEventById);

// Registration
router.post('/:id/register', authenticate, validateBody(registerEventSchema), eventController.registerForEvent);
router.get('/:id/registration', authenticate, eventController.getMyRegistration);
router.delete('/:id/registration', authenticate, eventController.cancelRegistration);

// Feedback
router.post('/:id/feedback', authenticate, validateBody(feedbackSchema), eventController.submitFeedback);
router.get('/:id/feedback', optionalAuth, eventController.getEventFeedback);

// My registrations
router.get('/my/registrations', authenticate, eventController.getMyRegistrations);

// Admin routes
router.post('/', authenticate, requireAdmin, validateBody(createEventSchema), eventController.createEvent);
router.put('/:id', authenticate, requireAdmin, validateBody(createEventSchema), eventController.updateEvent);
router.delete('/:id', authenticate, requireAdmin, eventController.deleteEvent);
router.get('/:id/registrations', authenticate, requireAdmin, eventController.getEventRegistrations);
router.put('/:id/registrations/:registrationId/checkin', authenticate, requireAdmin, eventController.checkInAttendee);

export default router;
