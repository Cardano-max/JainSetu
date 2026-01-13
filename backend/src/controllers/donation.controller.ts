import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { CreateCauseInput, MakeDonationInput, CreatePaymentOrderInput } from '../schemas/donation.schema.js';
import logger from '../utils/logger.js';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Check if Razorpay is configured
const isRazorpayConfigured = (): boolean => {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
};

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

      // Validate amount
      if (amount < 1) {
        throw new AppError('Amount must be at least ₹1', 400);
      }

      if (amount > 1000000) {
        throw new AppError('Amount cannot exceed ₹10,00,000', 400);
      }

      // Verify cause exists
      const cause = await prisma.donationCause.findUnique({
        where: { id: causeId },
      });

      if (!cause || !cause.isActive) {
        throw new AppError('Cause not found or inactive', 404);
      }

      // Check if Razorpay is configured
      if (!isRazorpayConfigured()) {
        logger.warn('Razorpay not configured, using mock order');
        // Return mock order for development
        const mockOrderId = `order_mock_${Date.now()}`;
        return res.json({
          success: true,
          order: {
            id: mockOrderId,
            amount: amount * 100,
            currency: 'INR',
          },
          isMock: true,
        });
      }

      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `donation_${causeId}_${Date.now()}`,
        notes: {
          causeId,
          causeName: cause.title,
        },
      });

      logger.info(`Created Razorpay order ${order.id} for cause ${causeId}`);

      res.json({
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Verify Payment (webhook handler and client verification)
  verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentId, orderId, signature } = req.body;

      if (!paymentId || !orderId || !signature) {
        throw new AppError('Missing payment verification parameters', 400);
      }

      // Check if Razorpay is configured
      if (!isRazorpayConfigured()) {
        logger.warn('Razorpay not configured, skipping verification');
        return res.json({ success: true, verified: true, isMock: true });
      }

      // Verify signature
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = generatedSignature === signature;

      if (!isValid) {
        logger.warn(`Payment verification failed for order ${orderId}`);
        throw new AppError('Payment verification failed', 400);
      }

      logger.info(`Payment ${paymentId} verified successfully`);

      res.json({ success: true, verified: true });
    } catch (error) {
      next(error);
    }
  };

  // Razorpay Webhook Handler
  handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

      if (!webhookSecret) {
        logger.warn('Razorpay webhook secret not configured');
        return res.status(200).json({ success: true });
      }

      // Verify webhook signature
      const signature = req.headers['x-razorpay-signature'] as string;
      const body = JSON.stringify(req.body);

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        logger.warn('Invalid webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }

      const event = req.body.event;
      const payload = req.body.payload;

      logger.info(`Received webhook event: ${event}`);

      switch (event) {
        case 'payment.captured':
          // Payment was successful
          const paymentId = payload.payment.entity.id;
          const orderId = payload.payment.entity.order_id;
          const amount = payload.payment.entity.amount / 100;

          logger.info(`Payment captured: ${paymentId}, Order: ${orderId}, Amount: ${amount}`);

          // Update donation status if exists
          await prisma.donation.updateMany({
            where: { paymentId },
            data: { status: 'COMPLETED' },
          });
          break;

        case 'payment.failed':
          // Payment failed
          const failedPaymentId = payload.payment.entity.id;
          logger.warn(`Payment failed: ${failedPaymentId}`);

          await prisma.donation.updateMany({
            where: { paymentId: failedPaymentId },
            data: { status: 'FAILED' },
          });
          break;

        case 'refund.created':
          // Refund initiated
          const refundPaymentId = payload.refund.entity.payment_id;
          logger.info(`Refund created for payment: ${refundPaymentId}`);

          await prisma.donation.updateMany({
            where: { paymentId: refundPaymentId },
            data: { status: 'REFUNDED' },
          });
          break;

        default:
          logger.info(`Unhandled webhook event: ${event}`);
      }

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Webhook handler error:', error);
      // Always return 200 to acknowledge receipt (Razorpay will retry otherwise)
      res.status(200).json({ success: true });
    }
  };

  // Make Donation
  makeDonation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as MakeDonationInput;
      const userId = req.user?.id;

      // Validate amount
      if (data.amount < 1) {
        throw new AppError('Amount must be at least ₹1', 400);
      }

      // Verify cause
      const cause = await prisma.donationCause.findUnique({
        where: { id: data.causeId },
      });

      if (!cause || !cause.isActive) {
        throw new AppError('Cause not found or inactive', 404);
      }

      // Generate receipt number
      const receiptNumber = `JSD${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Create donation with PENDING status initially
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
          status: data.paymentId ? 'COMPLETED' : 'PENDING',
          receiptNumber,
        },
        include: { cause: true },
      });

      // Update cause raised amount if payment is completed
      if (donation.status === 'COMPLETED') {
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

        logger.info(`Donation ${donation.id} completed: ₹${data.amount} to ${cause.title}`);
      }

      res.status(201).json({ success: true, donation });
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

      logger.info(`Created donation cause: ${cause.id} - ${cause.title}`);

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

      logger.info(`Updated donation cause: ${cause.id}`);

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
        logger.info(`Soft deleted donation cause: ${id} (has ${donationCount} donations)`);
      } else {
        await prisma.donationCause.delete({ where: { id } });
        logger.info(`Deleted donation cause: ${id}`);
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
