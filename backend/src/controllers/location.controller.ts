import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';

export class LocationController {
  // Get Cities
  getCities = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { state, page = '1', limit = '100' } = req.query;

      const where: any = { isActive: true };
      if (state) where.state = state;

      const cities = await prisma.city.findMany({
        where,
        orderBy: { name: 'asc' },
        take: parseInt(limit as string),
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      });

      res.json({ success: true, cities });
    } catch (error) {
      next(error);
    }
  };

  // Search Cities
  searchCities = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, limit = '20' } = req.query;

      if (!q) {
        return res.json({ success: true, cities: [] });
      }

      const cities = await prisma.city.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q as string, mode: 'insensitive' } },
            { state: { contains: q as string, mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
        take: parseInt(limit as string),
      });

      res.json({ success: true, cities });
    } catch (error) {
      next(error);
    }
  };

  // Get City by ID
  getCityById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const city = await prisma.city.findUnique({
        where: { id },
        include: {
          _count: {
            select: { users: true, sanghs: true, events: true, businesses: true },
          },
        },
      });

      if (!city) {
        throw new AppError('City not found', 404);
      }

      res.json({ success: true, city });
    } catch (error) {
      next(error);
    }
  };

  // Get Sanghs
  getSanghs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cityId, sect, page = '1', limit = '100' } = req.query;

      const where: any = { isActive: true };
      if (cityId) where.cityId = cityId;
      if (sect) where.sect = sect;

      const sanghs = await prisma.sangh.findMany({
        where,
        include: { city: true },
        orderBy: { name: 'asc' },
        take: parseInt(limit as string),
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      });

      res.json({ success: true, sanghs });
    } catch (error) {
      next(error);
    }
  };

  // Search Sanghs
  searchSanghs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, cityId, limit = '20' } = req.query;

      if (!q) {
        return res.json({ success: true, sanghs: [] });
      }

      const where: any = {
        isActive: true,
        name: { contains: q as string, mode: 'insensitive' },
      };

      if (cityId) where.cityId = cityId;

      const sanghs = await prisma.sangh.findMany({
        where,
        include: { city: true },
        orderBy: { name: 'asc' },
        take: parseInt(limit as string),
      });

      res.json({ success: true, sanghs });
    } catch (error) {
      next(error);
    }
  };

  // Get Sangh by ID
  getSanghById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const sangh = await prisma.sangh.findUnique({
        where: { id },
        include: {
          city: true,
          _count: { select: { users: true, events: true } },
        },
      });

      if (!sangh) {
        throw new AppError('Sangh not found', 404);
      }

      res.json({ success: true, sangh });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Create City
  createCity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, state, country } = req.body;

      const city = await prisma.city.create({
        data: { name, state, country: country || 'India' },
      });

      res.status(201).json({ success: true, city });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Update City
  updateCity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, state, country, isActive } = req.body;

      const city = await prisma.city.update({
        where: { id },
        data: { name, state, country, isActive },
      });

      res.json({ success: true, city });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Create Sangh
  createSangh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, cityId, address, phone, email, sect } = req.body;

      const sangh = await prisma.sangh.create({
        data: { name, cityId, address, phone, email, sect },
        include: { city: true },
      });

      res.status(201).json({ success: true, sangh });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Update Sangh
  updateSangh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, cityId, address, phone, email, sect, isVerified, isActive } = req.body;

      const sangh = await prisma.sangh.update({
        where: { id },
        data: { name, cityId, address, phone, email, sect, isVerified, isActive },
        include: { city: true },
      });

      res.json({ success: true, sangh });
    } catch (error) {
      next(error);
    }
  };
}
