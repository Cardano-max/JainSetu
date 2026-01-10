import { Router } from 'express';
import { TirthController } from '../controllers/tirth.controller.js';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createTirthSchema, createRoomSchema, bookingSchema } from '../schemas/tirth.schema.js';

const router = Router();
const tirthController = new TirthController();

// Public routes
router.get('/', optionalAuth, tirthController.getTirths);
router.get('/search', optionalAuth, tirthController.searchTirths);
router.get('/:id', optionalAuth, tirthController.getTirthById);
router.get('/:id/rooms', optionalAuth, tirthController.getTirthRooms);
router.get('/:id/availability', optionalAuth, tirthController.checkAvailability);

// Booking
router.post('/bookings', authenticate, validateBody(bookingSchema), tirthController.createBooking);
router.get('/bookings/my', authenticate, tirthController.getMyBookings);
router.get('/bookings/:id', authenticate, tirthController.getBookingById);
router.put('/bookings/:id/cancel', authenticate, tirthController.cancelBooking);

// Admin routes
router.post('/', authenticate, requireAdmin, validateBody(createTirthSchema), tirthController.createTirth);
router.put('/:id', authenticate, requireAdmin, validateBody(createTirthSchema), tirthController.updateTirth);
router.delete('/:id', authenticate, requireAdmin, tirthController.deleteTirth);

// Room management
router.post('/:id/rooms', authenticate, requireAdmin, validateBody(createRoomSchema), tirthController.addRoom);
router.put('/:id/rooms/:roomId', authenticate, requireAdmin, validateBody(createRoomSchema), tirthController.updateRoom);
router.delete('/:id/rooms/:roomId', authenticate, requireAdmin, tirthController.deleteRoom);

// Booking management
router.get('/:id/bookings', authenticate, requireAdmin, tirthController.getTirthBookings);
router.put('/bookings/:id/confirm', authenticate, requireAdmin, tirthController.confirmBooking);
router.put('/bookings/:id/checkin', authenticate, requireAdmin, tirthController.checkInGuest);
router.put('/bookings/:id/checkout', authenticate, requireAdmin, tirthController.checkOutGuest);

export default router;
