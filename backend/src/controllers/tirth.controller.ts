import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { CreateTirthInput, CreateRoomInput, BookingInput } from '../schemas/tirth.schema.js';

export class TirthController {
  // Get Tirths
  getTirths = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = '1',
        limit = '20',
        cityId,
        state,
        hasDharamshala,
        search,
      } = req.query;

      const where: any = { isActive: true };

      if (cityId) where.cityId = cityId;
      if (state) where.state = state;
      if (hasDharamshala === 'true') where.hasDharamshala = true;

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { address: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [tirths, total] = await Promise.all([
        prisma.tirth.findMany({
          where,
          include: {
            city: true,
            _count: { select: { rooms: true } },
          },
          orderBy: [{ isVerified: 'desc' }, { name: 'asc' }],
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.tirth.count({ where }),
      ]);

      res.json({
        success: true,
        tirths,
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

  // Search Tirths
  searchTirths = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, limit = '10' } = req.query;

      if (!q) {
        return res.json({ success: true, tirths: [] });
      }

      const tirths = await prisma.tirth.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q as string, mode: 'insensitive' } },
            { city: { name: { contains: q as string, mode: 'insensitive' } } },
            { state: { contains: q as string, mode: 'insensitive' } },
          ],
        },
        include: { city: true },
        take: parseInt(limit as string),
      });

      res.json({ success: true, tirths });
    } catch (error) {
      next(error);
    }
  };

  // Get Tirth by ID
  getTirthById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const tirth = await prisma.tirth.findUnique({
        where: { id },
        include: {
          city: true,
          rooms: {
            where: { isActive: true },
            orderBy: { pricePerNight: 'asc' },
          },
        },
      });

      if (!tirth) {
        throw new AppError('Tirth not found', 404);
      }

      res.json({ success: true, tirth });
    } catch (error) {
      next(error);
    }
  };

  // Get Tirth Rooms
  getTirthRooms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const rooms = await prisma.dharamshalaRoom.findMany({
        where: { tirthId: id, isActive: true },
        orderBy: { pricePerNight: 'asc' },
      });

      res.json({ success: true, rooms });
    } catch (error) {
      next(error);
    }
  };

  // Check Availability
  checkAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { checkIn, checkOut, roomId } = req.query;

      if (!checkIn || !checkOut) {
        throw new AppError('Check-in and check-out dates required', 400);
      }

      const checkInDate = new Date(checkIn as string);
      const checkOutDate = new Date(checkOut as string);

      const where: any = {
        tirthId: id,
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
        OR: [
          {
            checkInDate: { lte: checkOutDate },
            checkOutDate: { gte: checkInDate },
          },
        ],
      };

      if (roomId) where.roomId = roomId;

      const existingBookings = await prisma.tirthBooking.findMany({
        where,
        include: { room: true },
      });

      // Get all rooms
      const rooms = await prisma.dharamshalaRoom.findMany({
        where: {
          tirthId: id,
          isActive: true,
          ...(roomId && { id: roomId as string }),
        },
      });

      // Calculate availability
      const availability = rooms.map((room) => {
        const roomBookings = existingBookings.filter((b) => b.roomId === room.id);
        const bookedCount = roomBookings.length;
        const availableCount = room.totalRooms - bookedCount;

        return {
          roomId: room.id,
          roomName: room.name,
          roomType: room.roomType,
          totalRooms: room.totalRooms,
          bookedRooms: bookedCount,
          availableRooms: Math.max(0, availableCount),
          pricePerNight: room.pricePerNight,
          isAvailable: availableCount > 0,
        };
      });

      res.json({ success: true, availability });
    } catch (error) {
      next(error);
    }
  };

  // Create Booking
  createBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const data = req.body as BookingInput;

      const tirth = await prisma.tirth.findUnique({ where: { id: data.tirthId } });

      if (!tirth) {
        throw new AppError('Tirth not found', 404);
      }

      let totalAmount = 0;

      if (data.roomId) {
        const room = await prisma.dharamshalaRoom.findUnique({
          where: { id: data.roomId },
        });

        if (!room) {
          throw new AppError('Room not found', 404);
        }

        // Calculate nights
        const checkIn = new Date(data.checkInDate);
        const checkOut = new Date(data.checkOutDate);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

        totalAmount = room.pricePerNight * nights;
      }

      const booking = await prisma.tirthBooking.create({
        data: {
          tirthId: data.tirthId,
          roomId: data.roomId || null,
          userId,
          checkInDate: new Date(data.checkInDate),
          checkOutDate: new Date(data.checkOutDate),
          guestCount: data.guestCount,
          guestNames: data.guestNames || [],
          contactPhone: data.contactPhone,
          specialRequests: data.specialRequests,
          totalAmount,
          status: 'PENDING',
        },
        include: {
          tirth: true,
          room: true,
        },
      });

      // Notify user
      await prisma.notification.create({
        data: {
          userId,
          title: 'Booking Request Submitted',
          body: `Your booking at ${tirth.name} has been submitted. Confirmation pending.`,
          type: 'tirth_booking',
          entityType: 'booking',
          entityId: booking.id,
        },
      });

      res.status(201).json({ success: true, booking });
    } catch (error) {
      next(error);
    }
  };

  // Get My Bookings
  getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { status, upcoming } = req.query;

      const where: any = { userId };

      if (status) where.status = status;
      if (upcoming === 'true') {
        where.checkInDate = { gte: new Date() };
      }

      const bookings = await prisma.tirthBooking.findMany({
        where,
        include: {
          tirth: { select: { name: true, images: true, city: true } },
          room: { select: { name: true, roomType: true } },
        },
        orderBy: { checkInDate: 'desc' },
      });

      res.json({ success: true, bookings });
    } catch (error) {
      next(error);
    }
  };

  // Get Booking by ID
  getBookingById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const booking = await prisma.tirthBooking.findFirst({
        where: { id, userId },
        include: {
          tirth: true,
          room: true,
        },
      });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      res.json({ success: true, booking });
    } catch (error) {
      next(error);
    }
  };

  // Cancel Booking
  cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { reason } = req.body;

      const booking = await prisma.tirthBooking.findFirst({
        where: { id, userId },
      });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      if (['CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].includes(booking.status)) {
        throw new AppError('Cannot cancel this booking', 400);
      }

      const updated = await prisma.tirthBooking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: reason,
        },
      });

      res.json({ success: true, booking: updated });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Create Tirth
  createTirth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as CreateTirthInput;

      const tirth = await prisma.tirth.create({
        data,
        include: { city: true },
      });

      res.status(201).json({ success: true, tirth });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Update Tirth
  updateTirth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body as CreateTirthInput;

      const tirth = await prisma.tirth.update({
        where: { id },
        data,
        include: { city: true },
      });

      res.json({ success: true, tirth });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Delete Tirth
  deleteTirth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await prisma.tirth.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({ success: true, message: 'Tirth deleted' });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Add Room
  addRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body as CreateRoomInput;

      const room = await prisma.dharamshalaRoom.create({
        data: {
          tirthId: id,
          ...data,
        },
      });

      res.status(201).json({ success: true, room });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Update Room
  updateRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roomId } = req.params;
      const data = req.body as CreateRoomInput;

      const room = await prisma.dharamshalaRoom.update({
        where: { id: roomId },
        data,
      });

      res.json({ success: true, room });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Delete Room
  deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roomId } = req.params;

      await prisma.dharamshalaRoom.update({
        where: { id: roomId },
        data: { isActive: false },
      });

      res.json({ success: true, message: 'Room deleted' });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Get Tirth Bookings
  getTirthBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status, page = '1', limit = '50' } = req.query;

      const where: any = { tirthId: id };
      if (status) where.status = status;

      const [bookings, total] = await Promise.all([
        prisma.tirthBooking.findMany({
          where,
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, phone: true },
            },
            room: true,
          },
          orderBy: { checkInDate: 'desc' },
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.tirthBooking.count({ where }),
      ]);

      res.json({
        success: true,
        bookings,
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

  // Admin: Confirm Booking
  confirmBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const booking = await prisma.tirthBooking.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
        include: { tirth: true },
      });

      await prisma.notification.create({
        data: {
          userId: booking.userId,
          title: 'Booking Confirmed',
          body: `Your booking at ${booking.tirth.name} has been confirmed.`,
          type: 'booking_confirmed',
          entityType: 'booking',
          entityId: id,
        },
      });

      res.json({ success: true, booking });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Check-in Guest
  checkInGuest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const booking = await prisma.tirthBooking.update({
        where: { id },
        data: { status: 'CHECKED_IN' },
      });

      res.json({ success: true, booking });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Check-out Guest
  checkOutGuest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const booking = await prisma.tirthBooking.update({
        where: { id },
        data: { status: 'CHECKED_OUT' },
      });

      res.json({ success: true, booking });
    } catch (error) {
      next(error);
    }
  };
}
