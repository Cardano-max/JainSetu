import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { UpdateProfileInput, UpdatePrivacyInput, AddFamilyMemberInput } from '../schemas/user.schema.js';

export class UserController {
  // Get Profile
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: {
          city: true,
          sangh: true,
          familyMembers: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({ success: true, user });
    } catch (error) {
      next(error);
    }
  };

  // Update Profile
  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as UpdateProfileInput;

      // Check email uniqueness if being updated
      if (data.email) {
        const emailExists = await prisma.user.findFirst({
          where: {
            email: data.email,
            id: { not: req.user!.id },
          },
        });

        if (emailExists) {
          throw new AppError('Email already in use', 409);
        }
      }

      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          ...data,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        },
        include: {
          city: true,
          sangh: true,
        },
      });

      res.json({ success: true, user });
    } catch (error) {
      next(error);
    }
  };

  // Update Privacy Settings
  updatePrivacy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as UpdatePrivacyInput;

      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data,
      });

      res.json({
        success: true,
        privacy: {
          phonePrivacy: user.phonePrivacy,
          emailPrivacy: user.emailPrivacy,
          profilePrivacy: user.profilePrivacy,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get Family Members
  getFamilyMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const members = await prisma.familyMember.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'asc' },
      });

      res.json({ success: true, members });
    } catch (error) {
      next(error);
    }
  };

  // Add Family Member
  addFamilyMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as AddFamilyMemberInput;

      const member = await prisma.familyMember.create({
        data: {
          ...data,
          userId: req.user!.id,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        },
      });

      res.status(201).json({ success: true, member });
    } catch (error) {
      next(error);
    }
  };

  // Update Family Member
  updateFamilyMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body as AddFamilyMemberInput;

      // Verify ownership
      const existing = await prisma.familyMember.findFirst({
        where: { id, userId: req.user!.id },
      });

      if (!existing) {
        throw new AppError('Family member not found', 404);
      }

      const member = await prisma.familyMember.update({
        where: { id },
        data: {
          ...data,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        },
      });

      res.json({ success: true, member });
    } catch (error) {
      next(error);
    }
  };

  // Delete Family Member
  deleteFamilyMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Verify ownership
      const existing = await prisma.familyMember.findFirst({
        where: { id, userId: req.user!.id },
      });

      if (!existing) {
        throw new AppError('Family member not found', 404);
      }

      await prisma.familyMember.delete({ where: { id } });

      res.json({ success: true, message: 'Family member deleted' });
    } catch (error) {
      next(error);
    }
  };

  // Get Notifications
  getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = '1', limit = '20', unreadOnly = 'false' } = req.query;

      const where = {
        userId: req.user!.id,
        ...(unreadOnly === 'true' && { isRead: false }),
      };

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.notification.count({ where }),
      ]);

      const unreadCount = await prisma.notification.count({
        where: { userId: req.user!.id, isRead: false },
      });

      res.json({
        success: true,
        notifications,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
        unreadCount,
      });
    } catch (error) {
      next(error);
    }
  };

  // Mark Notification as Read
  markNotificationRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await prisma.notification.updateMany({
        where: { id, userId: req.user!.id },
        data: { isRead: true, readAt: new Date() },
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  // Mark All Notifications as Read
  markAllNotificationsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.notification.updateMany({
        where: { userId: req.user!.id, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  // Get User Points
  getUserPoints = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const registrations = await prisma.eventRegistration.findMany({
        where: { userId: req.user!.id, status: 'ATTENDED' },
        include: { event: { select: { title: true, startDate: true } } },
        orderBy: { createdAt: 'desc' },
      });

      const totalPoints = registrations.reduce((sum, r) => sum + r.pointsEarned, 0);

      res.json({
        success: true,
        totalPoints,
        pointsHistory: registrations.map((r) => ({
          id: r.id,
          points: r.pointsEarned,
          event: r.event.title,
          date: r.event.startDate,
        })),
      });
    } catch (error) {
      next(error);
    }
  };
}
