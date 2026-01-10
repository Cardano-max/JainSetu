import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { CreateEventInput, RegisterEventInput, FeedbackInput } from '../schemas/event.schema.js';

export class EventController {
  // Get Events (with filters)
  getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = '1',
        limit = '20',
        cityId,
        sanghId,
        status,
        search,
        startDate,
        endDate,
      } = req.query;

      const where: any = {
        isPublic: true,
      };

      if (cityId) where.cityId = cityId;
      if (sanghId) where.sanghId = sanghId;
      if (status) where.status = status;

      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { venue: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      if (startDate || endDate) {
        where.startDate = {};
        if (startDate) where.startDate.gte = new Date(startDate as string);
        if (endDate) where.startDate.lte = new Date(endDate as string);
      }

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          include: {
            city: true,
            sangh: true,
            _count: { select: { registrations: true } },
          },
          orderBy: { startDate: 'asc' },
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.event.count({ where }),
      ]);

      res.json({
        success: true,
        events,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get Upcoming Events
  getUpcomingEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit = '10', cityId } = req.query;
      const now = new Date();

      const where: any = {
        isPublic: true,
        status: 'PUBLISHED',
        startDate: { gte: now },
      };

      if (cityId) where.cityId = cityId;

      const events = await prisma.event.findMany({
        where,
        include: {
          city: true,
          _count: { select: { registrations: true } },
        },
        orderBy: { startDate: 'asc' },
        take: parseInt(limit as string),
      });

      res.json({ success: true, events });
    } catch (error) {
      next(error);
    }
  };

  // Get Event by ID
  getEventById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          city: true,
          sangh: true,
          _count: { select: { registrations: true, feedbacks: true } },
        },
      });

      if (!event) {
        throw new AppError('Event not found', 404);
      }

      // Check if user is registered (if authenticated)
      let userRegistration = null;
      if (req.user) {
        userRegistration = await prisma.eventRegistration.findUnique({
          where: {
            eventId_userId: {
              eventId: id,
              userId: req.user.id,
            },
          },
        });
      }

      // Calculate average rating
      const feedbackStats = await prisma.eventFeedback.aggregate({
        where: { eventId: id },
        _avg: {
          overallRating: true,
          arrangementRating: true,
          foodRating: true,
          punctualityRating: true,
        },
      });

      res.json({
        success: true,
        event: {
          ...event,
          userRegistration,
          ratings: feedbackStats._avg,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Register for Event
  registerForEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body as RegisterEventInput;
      const userId = req.user!.id;

      const event = await prisma.event.findUnique({
        where: { id },
        include: { _count: { select: { registrations: true } } },
      });

      if (!event) {
        throw new AppError('Event not found', 404);
      }

      if (event.status !== 'PUBLISHED') {
        throw new AppError('Event is not open for registration', 400);
      }

      // Check if already registered
      const existing = await prisma.eventRegistration.findUnique({
        where: {
          eventId_userId: { eventId: id, userId },
        },
      });

      if (existing) {
        throw new AppError('Already registered for this event', 409);
      }

      // Check capacity
      if (event.maxAttendees && event._count.registrations >= event.maxAttendees) {
        throw new AppError('Event is full', 400);
      }

      // Check deadline
      if (event.registrationDeadline && new Date() > event.registrationDeadline) {
        throw new AppError('Registration deadline has passed', 400);
      }

      // Create registration
      const registration = await prisma.eventRegistration.create({
        data: {
          eventId: id,
          userId,
          attendeeCount: data.attendeeCount || 1,
          attendeeNames: data.attendeeNames || [],
          hasDiabetes: data.hasDiabetes,
          hasBP: data.hasBP,
          needsAccommodation: data.needsAccommodation,
          arrivalDateTime: data.arrivalDateTime ? new Date(data.arrivalDateTime) : null,
          specialRequirements: data.specialRequirements,
          amount: event.registrationFee ? event.registrationFee * (data.attendeeCount || 1) : null,
          status: event.registrationFee ? 'PENDING' : 'CONFIRMED',
          paymentStatus: event.registrationFee ? 'PENDING' : 'COMPLETED',
        },
        include: { event: { select: { title: true } } },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId,
          title: 'Registration Successful',
          body: `You have registered for ${event.title}`,
          type: 'event_registration',
          entityType: 'event',
          entityId: id,
        },
      });

      res.status(201).json({ success: true, registration });
    } catch (error) {
      next(error);
    }
  };

  // Get My Registration
  getMyRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const registration = await prisma.eventRegistration.findUnique({
        where: {
          eventId_userId: {
            eventId: id,
            userId: req.user!.id,
          },
        },
        include: { event: true },
      });

      if (!registration) {
        return res.json({ success: true, registration: null });
      }

      res.json({ success: true, registration });
    } catch (error) {
      next(error);
    }
  };

  // Cancel Registration
  cancelRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const registration = await prisma.eventRegistration.findUnique({
        where: {
          eventId_userId: {
            eventId: id,
            userId: req.user!.id,
          },
        },
        include: { event: true },
      });

      if (!registration) {
        throw new AppError('Registration not found', 404);
      }

      if (registration.status === 'ATTENDED') {
        throw new AppError('Cannot cancel after attendance', 400);
      }

      await prisma.eventRegistration.update({
        where: { id: registration.id },
        data: { status: 'CANCELLED' },
      });

      res.json({ success: true, message: 'Registration cancelled' });
    } catch (error) {
      next(error);
    }
  };

  // Submit Feedback
  submitFeedback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body as FeedbackInput;
      const userId = req.user!.id;

      // Check if event exists and is completed
      const event = await prisma.event.findUnique({ where: { id } });

      if (!event) {
        throw new AppError('Event not found', 404);
      }

      // Check if user attended
      const registration = await prisma.eventRegistration.findUnique({
        where: {
          eventId_userId: { eventId: id, userId },
        },
      });

      if (!registration) {
        throw new AppError('You did not attend this event', 400);
      }

      // Check for existing feedback
      const existing = await prisma.eventFeedback.findUnique({
        where: {
          eventId_userId: { eventId: id, userId },
        },
      });

      if (existing) {
        throw new AppError('Feedback already submitted', 409);
      }

      const feedback = await prisma.eventFeedback.create({
        data: {
          eventId: id,
          userId,
          ...data,
        },
      });

      res.status(201).json({ success: true, feedback });
    } catch (error) {
      next(error);
    }
  };

  // Get Event Feedback
  getEventFeedback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { page = '1', limit = '10' } = req.query;

      const [feedbacks, total] = await Promise.all([
        prisma.eventFeedback.findMany({
          where: { eventId: id },
          include: {
            user: {
              select: { firstName: true, lastName: true, profilePhoto: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.eventFeedback.count({ where: { eventId: id } }),
      ]);

      res.json({
        success: true,
        feedbacks,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get My Registrations
  getMyRegistrations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, upcoming } = req.query;
      const userId = req.user!.id;

      const where: any = { userId };

      if (status) where.status = status;

      if (upcoming === 'true') {
        where.event = { startDate: { gte: new Date() } };
      }

      const registrations = await prisma.eventRegistration.findMany({
        where,
        include: {
          event: {
            include: { city: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, registrations });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Create Event
  createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as CreateEventInput;

      const event = await prisma.event.create({
        data: {
          ...data,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
        },
        include: { city: true, sangh: true },
      });

      res.status(201).json({ success: true, event });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Update Event
  updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body as CreateEventInput;

      const event = await prisma.event.update({
        where: { id },
        data: {
          ...data,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
        },
        include: { city: true, sangh: true },
      });

      res.json({ success: true, event });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Delete Event
  deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await prisma.event.delete({ where: { id } });

      res.json({ success: true, message: 'Event deleted' });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Get Event Registrations
  getEventRegistrations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status, page = '1', limit = '50' } = req.query;

      const where: any = { eventId: id };
      if (status) where.status = status;

      const [registrations, total] = await Promise.all([
        prisma.eventRegistration.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
                profilePhoto: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.eventRegistration.count({ where }),
      ]);

      res.json({
        success: true,
        registrations,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Check-in Attendee
  checkInAttendee = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, registrationId } = req.params;

      const registration = await prisma.eventRegistration.findFirst({
        where: { id: registrationId, eventId: id },
        include: { event: true },
      });

      if (!registration) {
        throw new AppError('Registration not found', 404);
      }

      const updated = await prisma.eventRegistration.update({
        where: { id: registrationId },
        data: {
          status: 'ATTENDED',
          checkedInAt: new Date(),
          pointsEarned: registration.event.attendancePoints,
        },
      });

      res.json({ success: true, registration: updated });
    } catch (error) {
      next(error);
    }
  };
}
