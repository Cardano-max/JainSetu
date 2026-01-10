import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';

export class AdminController {
  // Get Dashboard
  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        totalUsers,
        newUsersToday,
        totalEvents,
        upcomingEvents,
        totalDonations,
        donationsThisMonth,
        totalBusinesses,
        pendingApprovals,
      ] = await Promise.all([
        prisma.user.count({ where: { status: 'ACTIVE' } }),
        prisma.user.count({ where: { createdAt: { gte: today } } }),
        prisma.event.count(),
        prisma.event.count({ where: { startDate: { gte: today }, status: 'PUBLISHED' } }),
        prisma.donation.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        prisma.donation.aggregate({
          where: {
            status: 'COMPLETED',
            createdAt: { gte: new Date(today.getFullYear(), today.getMonth(), 1) },
          },
          _sum: { amount: true },
        }),
        prisma.business.count({ where: { status: 'ACTIVE' } }),
        prisma.business.count({ where: { status: 'PENDING_APPROVAL' } }) +
          prisma.matrimonyProfile.count({ where: { status: 'PENDING_APPROVAL' } }) +
          prisma.property.count({ where: { status: 'PENDING_APPROVAL' } }),
      ]);

      // Recent activities
      const recentUsers = await prisma.user.findMany({
        select: { id: true, firstName: true, lastName: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      const recentDonations = await prisma.donation.findMany({
        where: { status: 'COMPLETED' },
        select: {
          id: true,
          donorName: true,
          amount: true,
          createdAt: true,
          cause: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      res.json({
        success: true,
        dashboard: {
          stats: {
            totalUsers,
            newUsersToday,
            totalEvents,
            upcomingEvents,
            totalDonations: totalDonations._sum.amount || 0,
            donationsThisMonth: donationsThisMonth._sum.amount || 0,
            totalBusinesses,
            pendingApprovals,
          },
          recentUsers,
          recentDonations,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get Users
  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = '1', limit = '50', status, role, search } = req.query;

      const where: any = {};

      if (status) where.status = status;
      if (role) where.role = role;

      if (search) {
        where.OR = [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { phone: { contains: search as string } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: { city: true },
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        success: true,
        users,
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

  // Get User by ID
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          city: true,
          sangh: true,
          familyMembers: true,
          _count: {
            select: {
              donations: true,
              eventRegistrations: true,
              businesses: true,
            },
          },
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

  // Update User Status
  updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: { status },
      });

      // Log action
      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'UPDATE_USER_STATUS',
          entityType: 'user',
          entityId: id,
          newValue: { status },
        },
      });

      res.json({ success: true, user });
    } catch (error) {
      next(error);
    }
  };

  // Update User Role
  updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: { role },
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'UPDATE_USER_ROLE',
          entityType: 'user',
          entityId: id,
          newValue: { role },
        },
      });

      res.json({ success: true, user });
    } catch (error) {
      next(error);
    }
  };

  // Verify User
  verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.update({
        where: { id },
        data: { isProfileVerified: true },
      });

      res.json({ success: true, user });
    } catch (error) {
      next(error);
    }
  };

  // Get Announcements
  getAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const announcements = await prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, announcements });
    } catch (error) {
      next(error);
    }
  };

  // Create Announcement
  createAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        title,
        content,
        image,
        link,
        targetCities,
        targetSects,
        isGlobal,
        isPinned,
        startDate,
        endDate,
      } = req.body;

      const announcement = await prisma.announcement.create({
        data: {
          title,
          content,
          image,
          link,
          targetCities: targetCities || [],
          targetSects: targetSects || [],
          isGlobal: isGlobal || false,
          isPinned: isPinned || false,
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : null,
        },
      });

      res.status(201).json({ success: true, announcement });
    } catch (error) {
      next(error);
    }
  };

  // Update Announcement
  updateAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const announcement = await prisma.announcement.update({
        where: { id },
        data: {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : null,
        },
      });

      res.json({ success: true, announcement });
    } catch (error) {
      next(error);
    }
  };

  // Delete Announcement
  deleteAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await prisma.announcement.delete({ where: { id } });

      res.json({ success: true, message: 'Announcement deleted' });
    } catch (error) {
      next(error);
    }
  };

  // Get Settings
  getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await prisma.appSetting.findMany();

      const settingsMap = settings.reduce((acc, s) => {
        acc[s.key] = s.value;
        return acc;
      }, {} as Record<string, any>);

      res.json({ success: true, settings: settingsMap });
    } catch (error) {
      next(error);
    }
  };

  // Update Setting
  updateSetting = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { key } = req.params;
      const { value, description } = req.body;

      const setting = await prisma.appSetting.upsert({
        where: { key },
        update: { value, description },
        create: { key, value, description },
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'UPDATE_SETTING',
          entityType: 'setting',
          entityId: key,
          newValue: { value },
        },
      });

      res.json({ success: true, setting });
    } catch (error) {
      next(error);
    }
  };

  // Get Audit Logs
  getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = '1', limit = '50', action, entityType } = req.query;

      const where: any = {};
      if (action) where.action = action;
      if (entityType) where.entityType = entityType;

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.auditLog.count({ where }),
      ]);

      res.json({
        success: true,
        logs,
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

  // Get Overview Report
  getOverviewReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const [users, events, donations, businesses] = await Promise.all([
        prisma.user.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.event.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.donation.aggregate({
          where: { createdAt: { gte: start, lte: end }, status: 'COMPLETED' },
          _sum: { amount: true },
          _count: { id: true },
        }),
        prisma.business.count({ where: { createdAt: { gte: start, lte: end } } }),
      ]);

      res.json({
        success: true,
        report: {
          period: { start, end },
          newUsers: users,
          newEvents: events,
          totalDonations: donations._sum.amount || 0,
          donationCount: donations._count.id,
          newBusinesses: businesses,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get Donation Report
  getDonationReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const donationsByCause = await prisma.donation.groupBy({
        by: ['causeId'],
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
        _count: { id: true },
      });

      const causeIds = donationsByCause.map((d) => d.causeId);
      const causes = await prisma.donationCause.findMany({
        where: { id: { in: causeIds } },
        select: { id: true, title: true },
      });

      const report = donationsByCause.map((d) => ({
        cause: causes.find((c) => c.id === d.causeId)?.title || 'Unknown',
        totalAmount: d._sum.amount || 0,
        donationCount: d._count.id,
      }));

      res.json({ success: true, report });
    } catch (error) {
      next(error);
    }
  };

  // Get Event Report
  getEventReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventStats = await prisma.event.findMany({
        where: { status: 'COMPLETED' },
        select: {
          id: true,
          title: true,
          startDate: true,
          _count: { select: { registrations: true, feedbacks: true } },
        },
        orderBy: { startDate: 'desc' },
        take: 20,
      });

      res.json({ success: true, report: eventStats });
    } catch (error) {
      next(error);
    }
  };
}
