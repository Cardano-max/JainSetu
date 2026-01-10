import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { CreateBusinessInput, InquiryInput } from '../schemas/business.schema.js';

export class BusinessController {
  // Get Categories
  getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await prisma.businessCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });

      res.json({ success: true, categories });
    } catch (error) {
      next(error);
    }
  };

  // Get Businesses
  getBusinesses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = '1',
        limit = '20',
        categoryId,
        cityId,
        search,
        verified,
      } = req.query;

      const where: any = { status: 'ACTIVE' };

      if (categoryId) where.categoryId = categoryId;
      if (cityId) where.cityId = cityId;
      if (verified === 'true') where.isVerified = true;

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { shortDescription: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [businesses, total] = await Promise.all([
        prisma.business.findMany({
          where,
          include: {
            category: true,
            city: true,
          },
          orderBy: [
            { isFeatured: 'desc' },
            { isVerified: 'desc' },
            { createdAt: 'desc' },
          ],
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.business.count({ where }),
      ]);

      res.json({
        success: true,
        businesses,
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

  // Get Featured Businesses
  getFeaturedBusinesses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit = '10', categoryId } = req.query;

      const where: any = {
        status: 'ACTIVE',
        isFeatured: true,
      };

      if (categoryId) where.categoryId = categoryId;

      const businesses = await prisma.business.findMany({
        where,
        include: {
          category: true,
          city: true,
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
      });

      res.json({ success: true, businesses });
    } catch (error) {
      next(error);
    }
  };

  // Get Business by ID
  getBusinessById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const business = await prisma.business.findUnique({
        where: { id },
        include: {
          category: true,
          city: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
            },
          },
        },
      });

      if (!business) {
        throw new AppError('Business not found', 404);
      }

      // Increment view count
      await prisma.business.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });

      res.json({ success: true, business });
    } catch (error) {
      next(error);
    }
  };

  // Submit Inquiry
  submitInquiry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body as InquiryInput;

      const business = await prisma.business.findUnique({ where: { id } });

      if (!business) {
        throw new AppError('Business not found', 404);
      }

      const inquiry = await prisma.businessInquiry.create({
        data: {
          businessId: id,
          ...data,
        },
      });

      // Update contact count
      await prisma.business.update({
        where: { id },
        data: { contactCount: { increment: 1 } },
      });

      // Notify business owner
      await prisma.notification.create({
        data: {
          userId: business.ownerId,
          title: 'New Business Inquiry',
          body: `${data.name} sent an inquiry for ${business.name}`,
          type: 'business_inquiry',
          entityType: 'business',
          entityId: id,
        },
      });

      res.status(201).json({ success: true, inquiry });
    } catch (error) {
      next(error);
    }
  };

  // Get My Businesses
  getMyBusinesses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const businesses = await prisma.business.findMany({
        where: { ownerId: userId },
        include: {
          category: true,
          city: true,
          _count: { select: { inquiries: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, businesses });
    } catch (error) {
      next(error);
    }
  };

  // Create Business
  createBusiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as CreateBusinessInput;
      const userId = req.user!.id;

      const business = await prisma.business.create({
        data: {
          ...data,
          ownerId: userId,
          status: 'PENDING_APPROVAL',
        },
        include: {
          category: true,
          city: true,
        },
      });

      res.status(201).json({ success: true, business });
    } catch (error) {
      next(error);
    }
  };

  // Update Business
  updateBusiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body as CreateBusinessInput;
      const userId = req.user!.id;

      // Verify ownership
      const existing = await prisma.business.findFirst({
        where: { id, ownerId: userId },
      });

      if (!existing) {
        throw new AppError('Business not found', 404);
      }

      const business = await prisma.business.update({
        where: { id },
        data,
        include: {
          category: true,
          city: true,
        },
      });

      res.json({ success: true, business });
    } catch (error) {
      next(error);
    }
  };

  // Delete Business
  deleteBusiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Verify ownership
      const existing = await prisma.business.findFirst({
        where: { id, ownerId: userId },
      });

      if (!existing) {
        throw new AppError('Business not found', 404);
      }

      await prisma.business.delete({ where: { id } });

      res.json({ success: true, message: 'Business deleted' });
    } catch (error) {
      next(error);
    }
  };

  // Get Business Inquiries
  getBusinessInquiries = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Verify ownership
      const business = await prisma.business.findFirst({
        where: { id, ownerId: userId },
      });

      if (!business) {
        throw new AppError('Business not found', 404);
      }

      const inquiries = await prisma.businessInquiry.findMany({
        where: { businessId: id },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, inquiries });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Approve Business
  approveBusiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const business = await prisma.business.update({
        where: { id },
        data: { status: 'ACTIVE' },
      });

      // Notify owner
      await prisma.notification.create({
        data: {
          userId: business.ownerId,
          title: 'Business Approved',
          body: `Your business "${business.name}" has been approved and is now live.`,
          type: 'business_approved',
          entityType: 'business',
          entityId: id,
        },
      });

      res.json({ success: true, business });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Reject Business
  rejectBusiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const business = await prisma.business.update({
        where: { id },
        data: { status: 'REJECTED' },
      });

      // Notify owner
      await prisma.notification.create({
        data: {
          userId: business.ownerId,
          title: 'Business Listing Rejected',
          body: `Your business "${business.name}" was not approved. ${reason || ''}`,
          type: 'business_rejected',
          entityType: 'business',
          entityId: id,
        },
      });

      res.json({ success: true, business });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Toggle Featured
  toggleFeatured = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const business = await prisma.business.findUnique({ where: { id } });

      if (!business) {
        throw new AppError('Business not found', 404);
      }

      const updated = await prisma.business.update({
        where: { id },
        data: { isFeatured: !business.isFeatured },
      });

      res.json({ success: true, business: updated });
    } catch (error) {
      next(error);
    }
  };
}
