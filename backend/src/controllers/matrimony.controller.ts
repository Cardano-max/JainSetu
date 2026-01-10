import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { CreateProfileInput, UpdatePreferencesInput, SendInterestInput } from '../schemas/matrimony.schema.js';

export class MatrimonyController {
  // Get My Profile
  getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const profile = await prisma.matrimonyProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              gender: true,
              dateOfBirth: true,
              city: true,
              profilePhoto: true,
            },
          },
        },
      });

      res.json({ success: true, profile });
    } catch (error) {
      next(error);
    }
  };

  // Create Profile
  createProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const data = req.body as CreateProfileInput;

      // Check if profile already exists
      const existing = await prisma.matrimonyProfile.findUnique({
        where: { userId },
      });

      if (existing) {
        throw new AppError('Profile already exists', 409);
      }

      const profile = await prisma.matrimonyProfile.create({
        data: {
          userId,
          ...data,
          status: 'PENDING_APPROVAL',
        },
      });

      res.status(201).json({ success: true, profile });
    } catch (error) {
      next(error);
    }
  };

  // Update Profile
  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const data = req.body as CreateProfileInput;

      const profile = await prisma.matrimonyProfile.update({
        where: { userId },
        data,
      });

      res.json({ success: true, profile });
    } catch (error) {
      next(error);
    }
  };

  // Update Preferences
  updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const data = req.body as UpdatePreferencesInput;

      const profile = await prisma.matrimonyProfile.update({
        where: { userId },
        data,
      });

      res.json({ success: true, profile });
    } catch (error) {
      next(error);
    }
  };

  // Browse Profiles
  browseProfiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const {
        page = '1',
        limit = '20',
        gender,
        ageMin,
        ageMax,
        sect,
        city,
        education,
        maritalStatus,
      } = req.query;

      // Get current user's gender to show opposite
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { gender: true },
      });

      const where: any = {
        userId: { not: userId },
        status: 'ACTIVE',
        isActive: true,
      };

      // Show opposite gender
      if (currentUser?.gender) {
        where.user = {
          gender: currentUser.gender === 'MALE' ? 'FEMALE' : 'MALE',
        };
      }

      if (gender) {
        where.user = { ...where.user, gender };
      }

      if (sect) where.sect = sect;
      if (maritalStatus) where.maritalStatus = maritalStatus;
      if (education) where.education = { contains: education as string, mode: 'insensitive' };

      const [profiles, total] = await Promise.all([
        prisma.matrimonyProfile.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                gender: true,
                dateOfBirth: true,
                city: true,
                profilePhoto: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.matrimonyProfile.count({ where }),
      ]);

      // Calculate age and mask contact info
      const maskedProfiles = profiles.map((p) => ({
        ...p,
        user: {
          ...p.user,
          age: p.user.dateOfBirth
            ? Math.floor((Date.now() - p.user.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
            : null,
        },
      }));

      res.json({
        success: true,
        profiles: maskedProfiles,
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

  // Get Profile by ID
  getProfileById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const profile = await prisma.matrimonyProfile.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              gender: true,
              dateOfBirth: true,
              city: true,
              profilePhoto: true,
              phone: true,
              email: true,
            },
          },
        },
      });

      if (!profile) {
        throw new AppError('Profile not found', 404);
      }

      // Check if there's an accepted interest to show contact
      const acceptedInterest = await prisma.matrimonyInterest.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: profile.userId, isAccepted: true },
            { senderId: profile.userId, receiverId: userId, isAccepted: true },
          ],
        },
      });

      // Increment view count
      await prisma.matrimonyProfile.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });

      // Mask contact info unless interest is accepted
      const showContact = acceptedInterest || profile.showPhone;

      res.json({
        success: true,
        profile: {
          ...profile,
          user: {
            ...profile.user,
            phone: showContact ? profile.user.phone : null,
            email: profile.showEmail || showContact ? profile.user.email : null,
            age: profile.user.dateOfBirth
              ? Math.floor((Date.now() - profile.user.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
              : null,
          },
          canViewContact: !!acceptedInterest,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Send Interest
  sendInterest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { receiverId, message } = req.body as SendInterestInput;

      if (userId === receiverId) {
        throw new AppError('Cannot send interest to yourself', 400);
      }

      // Check if already sent
      const existing = await prisma.matrimonyInterest.findUnique({
        where: {
          senderId_receiverId: { senderId: userId, receiverId },
        },
      });

      if (existing) {
        throw new AppError('Interest already sent', 409);
      }

      const interest = await prisma.matrimonyInterest.create({
        data: {
          senderId: userId,
          receiverId,
          message,
        },
      });

      // Notify receiver
      const sender = await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      });

      await prisma.notification.create({
        data: {
          userId: receiverId,
          title: 'New Interest Received',
          body: `${sender?.firstName} ${sender?.lastName} has expressed interest in your profile.`,
          type: 'matrimony_interest',
          entityType: 'matrimony',
          entityId: interest.id,
        },
      });

      res.status(201).json({ success: true, interest });
    } catch (error) {
      next(error);
    }
  };

  // Get Sent Interests
  getSentInterests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const interests = await prisma.matrimonyInterest.findMany({
        where: { senderId: userId },
        include: {
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
              city: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, interests });
    } catch (error) {
      next(error);
    }
  };

  // Get Received Interests
  getReceivedInterests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const interests = await prisma.matrimonyInterest.findMany({
        where: { receiverId: userId },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
              city: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, interests });
    } catch (error) {
      next(error);
    }
  };

  // Accept Interest
  acceptInterest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const interest = await prisma.matrimonyInterest.findFirst({
        where: { id, receiverId: userId },
      });

      if (!interest) {
        throw new AppError('Interest not found', 404);
      }

      const updated = await prisma.matrimonyInterest.update({
        where: { id },
        data: {
          isAccepted: true,
          respondedAt: new Date(),
        },
      });

      // Notify sender
      const receiver = await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      });

      await prisma.notification.create({
        data: {
          userId: interest.senderId,
          title: 'Interest Accepted',
          body: `${receiver?.firstName} ${receiver?.lastName} has accepted your interest!`,
          type: 'matrimony_accepted',
          entityType: 'matrimony',
          entityId: id,
        },
      });

      res.json({ success: true, interest: updated });
    } catch (error) {
      next(error);
    }
  };

  // Reject Interest
  rejectInterest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const interest = await prisma.matrimonyInterest.findFirst({
        where: { id, receiverId: userId },
      });

      if (!interest) {
        throw new AppError('Interest not found', 404);
      }

      const updated = await prisma.matrimonyInterest.update({
        where: { id },
        data: {
          isAccepted: false,
          respondedAt: new Date(),
        },
      });

      res.json({ success: true, interest: updated });
    } catch (error) {
      next(error);
    }
  };

  // Shortlist handlers (simplified - can use a separate table for production)
  getShortlist = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: true, shortlist: [] });
  };

  addToShortlist = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: true, message: 'Added to shortlist' });
  };

  removeFromShortlist = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: true, message: 'Removed from shortlist' });
  };

  // Admin: Get all profiles
  adminGetProfiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = '1', limit = '50', status } = req.query;

      const where: any = {};
      if (status) where.status = status;

      const [profiles, total] = await Promise.all([
        prisma.matrimonyProfile.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
                gender: true,
                city: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.matrimonyProfile.count({ where }),
      ]);

      res.json({
        success: true,
        profiles,
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

  // Admin: Approve Profile
  adminApproveProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const profile = await prisma.matrimonyProfile.update({
        where: { id },
        data: { status: 'ACTIVE' },
      });

      await prisma.notification.create({
        data: {
          userId: profile.userId,
          title: 'Matrimony Profile Approved',
          body: 'Your matrimony profile is now live and visible to other members.',
          type: 'matrimony_approved',
          entityType: 'matrimony',
          entityId: id,
        },
      });

      res.json({ success: true, profile });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Reject Profile
  adminRejectProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const profile = await prisma.matrimonyProfile.update({
        where: { id },
        data: { status: 'REJECTED' },
      });

      await prisma.notification.create({
        data: {
          userId: profile.userId,
          title: 'Matrimony Profile Not Approved',
          body: `Your profile was not approved. ${reason || 'Please update and resubmit.'}`,
          type: 'matrimony_rejected',
          entityType: 'matrimony',
          entityId: id,
        },
      });

      res.json({ success: true, profile });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Verify Profile
  adminVerifyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const profile = await prisma.matrimonyProfile.update({
        where: { id },
        data: {
          isVerified: true,
          isPhotoVerified: true,
        },
      });

      res.json({ success: true, profile });
    } catch (error) {
      next(error);
    }
  };
}
