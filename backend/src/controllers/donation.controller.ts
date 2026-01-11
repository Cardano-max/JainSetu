import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { CreateCauseInput, MakeDonationInput, CreatePaymentOrderInput } from '../schemas/donation.schema.js';
import { v4 as uuidv4 } from 'uuid';

export class DonationController {
  // Get Active Causes
  getCauses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = '1', limit = '20', search } = req.query;

      const where: any = { isActive: true };

      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [causes, total] = await Promise.all([
        prisma.donationCause.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.donationCause.count({ where }),
      ]);

      res.json({
        success: true,
        causes,
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

  // Get Cause by ID
  getCauseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const cause = await prisma.donationCause.findUnique({
        where: { id },
      });

      if (!cause) {
        throw new AppError('Cause not found', 404);
      }

      // Get donation stats
      const stats = await prisma.donation.aggregate({
        where: { causeId: id, status: 'COMPLETED' },
        _sum: { amount: true },
        _count: { id: true },
      });

      // Get recent donations (non-anonymous)
      const recentDonations = await prisma.donation.findMany({
        where: { causeId: id, status: 'COMPLETED', isAnonymous: false },
        select: {
          donorName: true,
          amount: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      res.json({
        success: true,
        cause: {
          ...cause,
          totalRaised: stats._sum.amount || 0,
          donorCount: stats._count.id,
          recentDonations,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Create Payment Order (for Razorpay)
  createPaymentOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, causeId } = req.body as CreatePaymentOrderInput;

      // Verify cause exists
      const cause = await prisma.donationCause.findUnique({
        where: { id: causeId },
      });

      if (!cause || !cause.isActive) {
        throw new AppError('Cause not found or inactive', 404);
      }

      // In production, create Razorpay order
      // For now, return a mock order ID
      const orderId = `order_${uuidv4().replace(/-/g, '').substring(0, 14)}`;

      res.json({
        success: true,
        order: {
          id: orderId,
          amount: amount * 100, // Razorpay expects amount in paise
          currency: 'INR',
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Make Donation
  makeDonation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as MakeDonationInput;
      const userId = req.user?.id;

      // Verify cause
      const cause = await prisma.donationCause.findUnique({
        where: { id: data.causeId },
      });

      if (!cause || !cause.isActive) {
        throw new AppError('Cause not found or inactive', 404);
      }

      // Generate receipt number
      const receiptNumber = `JSD${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Create donation
      const donation = await prisma.donation.create({
        data: {
          causeId: data.causeId,
          userId: userId || null,
          donorName: data.donorName,
          donorPhone: data.donorPhone,
          donorEmail: data.donorEmail,
          donorPAN: data.donorPAN,
          amount: data.amount,
          paymentId: data.paymentId,
          paymentMethod: data.paymentMethod || 'online',
          isAnonymous: data.isAnonymous,
          status: 'COMPLETED',
          receiptNumber,
        },
        include: { cause: true },
      });

      // Update cause raised amount
      await prisma.donationCause.update({
        where: { id: data.causeId },
        data: { raisedAmount: { increment: data.amount } },
      });

      // Create notification if user is logged in
      if (userId) {
        await prisma.notification.create({
          data: {
            userId,
            title: 'Thank You for Your Donation',
            body: `Your donation of ₹${data.amount} to ${cause.title} has been received.`,
            type: 'donation',
            entityType: 'donation',
            entityId: donation.id,
          },
        });
      }

      res.status(201).json({ success: true, donation });
    } catch (error) {
      next(error);
    }
  };

  // Verify Payment (webhook handler)
  verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentId, orderId, signature } = req.body;

      // In production, verify with Razorpay
      // For now, just acknowledge
      res.json({ success: true, verified: true });
    } catch (error) {
      next(error);
    }
  };

  // Get My Donations
  getMyDonations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = '1', limit = '20' } = req.query;
      const userId = req.user!.id;

      const [donations, total] = await Promise.all([
        prisma.donation.findMany({
          where: { userId },
          include: { cause: { select: { title: true, image: true } } },
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.donation.count({ where: { userId } }),
      ]);

      const totalDonated = await prisma.donation.aggregate({
        where: { userId, status: 'COMPLETED' },
        _sum: { amount: true },
      });

      res.json({
        success: true,
        donations,
        totalDonated: totalDonated._sum.amount || 0,
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

  // Get Receipt
  getReceipt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const donation = await prisma.donation.findFirst({
        where: { id, userId },
        include: { cause: true },
      });

      if (!donation) {
        throw new AppError('Donation not found', 404);
      }

      res.json({
        success: true,
        receipt: {
          receiptNumber: donation.receiptNumber,
          donorName: donation.donorName,
          donorPAN: donation.donorPAN,
          amount: donation.amount,
          cause: donation.cause.title,
          date: donation.createdAt,
          is80GEligible: donation.cause.is80GEligible,
          organizerPAN: donation.cause.panNumber,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Get All Causes (including inactive)
  getAllCauses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = '1', limit = '50', search, isActive } = req.query;

      const where: any = {};
      if (isActive !== undefined && isActive !== '') {
        where.isActive = isActive === 'true';
      }
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { organizerName: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [causes, total] = await Promise.all([
        prisma.donationCause.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.donationCause.count({ where }),
      ]);

      res.json({
        success: true,
        causes,
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

  // Admin: Get All Donations
  getAllDonations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = '1', limit = '50', causeId, status } = req.query;

      const where: any = {};
      if (causeId) where.causeId = causeId;
      if (status) where.status = status;

      const [donations, total] = await Promise.all([
        prisma.donation.findMany({
          where,
          include: {
            cause: { select: { title: true } },
            user: { select: { firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.donation.count({ where }),
      ]);

      res.json({
        success: true,
        donations,
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

  // Admin: Create Cause
  createCause = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as CreateCauseInput;

      const cause = await prisma.donationCause.create({
        data: {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          endDate: data.endDate ? new Date(data.endDate) : null,
        },
      });

      res.status(201).json({ success: true, cause });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Update Cause
  updateCause = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body as CreateCauseInput;

      const cause = await prisma.donationCause.update({
        where: { id },
        data: {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : null,
        },
      });

      res.json({ success: true, cause });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Delete Cause
  deleteCause = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Check if cause has donations
      const donationCount = await prisma.donation.count({
        where: { causeId: id },
      });

      if (donationCount > 0) {
        // Soft delete - just deactivate
        await prisma.donationCause.update({
          where: { id },
          data: { isActive: false },
        });
      } else {
        await prisma.donationCause.delete({ where: { id } });
      }

      res.json({ success: true, message: 'Cause deleted' });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Get Cause Donations
  getCauseDonations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { page = '1', limit = '50', status } = req.query;

      const where: any = { causeId: id };
      if (status) where.status = status;

      const [donations, total] = await Promise.all([
        prisma.donation.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.donation.count({ where }),
      ]);

      res.json({
        success: true,
        donations,
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
}
