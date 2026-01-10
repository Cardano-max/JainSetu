import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { CreatePropertyInput } from '../schemas/property.schema.js';

export class PropertyController {
  // Get Properties
  getProperties = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = '1',
        limit = '20',
        propertyType,
        listingType,
        cityId,
        minPrice,
        maxPrice,
        bedrooms,
        search,
      } = req.query;

      const where: any = { status: 'ACTIVE' };

      if (propertyType) where.propertyType = propertyType;
      if (listingType) where.listingType = listingType;
      if (cityId) where.cityId = cityId;
      if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms as string) };

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice as string);
        if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
      }

      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { locality: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [properties, total] = await Promise.all([
        prisma.property.findMany({
          where,
          include: { city: true },
          orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.property.count({ where }),
      ]);

      res.json({
        success: true,
        properties,
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

  // Get Featured Properties
  getFeaturedProperties = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit = '10', listingType } = req.query;

      const where: any = { status: 'ACTIVE', isFeatured: true };
      if (listingType) where.listingType = listingType;

      const properties = await prisma.property.findMany({
        where,
        include: { city: true },
        take: parseInt(limit as string),
      });

      res.json({ success: true, properties });
    } catch (error) {
      next(error);
    }
  };

  // Get Property by ID
  getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const property = await prisma.property.findUnique({
        where: { id },
        include: {
          city: true,
          owner: {
            select: {
              firstName: true,
              lastName: true,
              profilePhoto: true,
            },
          },
        },
      });

      if (!property) {
        throw new AppError('Property not found', 404);
      }

      // Increment view count
      await prisma.property.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });

      res.json({ success: true, property });
    } catch (error) {
      next(error);
    }
  };

  // Get My Properties
  getMyProperties = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const properties = await prisma.property.findMany({
        where: { ownerId: userId },
        include: { city: true },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, properties });
    } catch (error) {
      next(error);
    }
  };

  // Create Property
  createProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const data = req.body as CreatePropertyInput;

      const property = await prisma.property.create({
        data: {
          ownerId: userId,
          ...data,
          status: 'PENDING_APPROVAL',
        },
        include: { city: true },
      });

      res.status(201).json({ success: true, property });
    } catch (error) {
      next(error);
    }
  };

  // Update Property
  updateProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const data = req.body as CreatePropertyInput;

      const existing = await prisma.property.findFirst({
        where: { id, ownerId: userId },
      });

      if (!existing) {
        throw new AppError('Property not found', 404);
      }

      const property = await prisma.property.update({
        where: { id },
        data,
        include: { city: true },
      });

      res.json({ success: true, property });
    } catch (error) {
      next(error);
    }
  };

  // Delete Property
  deleteProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const existing = await prisma.property.findFirst({
        where: { id, ownerId: userId },
      });

      if (!existing) {
        throw new AppError('Property not found', 404);
      }

      await prisma.property.delete({ where: { id } });

      res.json({ success: true, message: 'Property deleted' });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Approve Property
  approveProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const property = await prisma.property.update({
        where: { id },
        data: { status: 'ACTIVE' },
      });

      await prisma.notification.create({
        data: {
          userId: property.ownerId,
          title: 'Property Approved',
          body: `Your property "${property.title}" is now live.`,
          type: 'property_approved',
          entityType: 'property',
          entityId: id,
        },
      });

      res.json({ success: true, property });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Reject Property
  rejectProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const property = await prisma.property.update({
        where: { id },
        data: { status: 'REJECTED' },
      });

      await prisma.notification.create({
        data: {
          userId: property.ownerId,
          title: 'Property Rejected',
          body: `Your property "${property.title}" was not approved. ${reason || ''}`,
          type: 'property_rejected',
          entityType: 'property',
          entityId: id,
        },
      });

      res.json({ success: true, property });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Toggle Featured
  toggleFeatured = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const property = await prisma.property.findUnique({ where: { id } });

      if (!property) {
        throw new AppError('Property not found', 404);
      }

      const updated = await prisma.property.update({
        where: { id },
        data: { isFeatured: !property.isFeatured },
      });

      res.json({ success: true, property: updated });
    } catch (error) {
      next(error);
    }
  };
}
