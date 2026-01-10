import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { SendOtpInput, VerifyOtpInput, RegisterInput, RefreshTokenInput } from '../schemas/auth.schema.js';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthController {
  // Send OTP
  sendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone, purpose } = req.body as SendOtpInput;

      // Check if user exists for login purpose
      if (purpose === 'login') {
        const existingUser = await prisma.user.findUnique({
          where: { phone },
        });

        if (!existingUser) {
          // Return info that user needs to register
          return res.json({
            success: true,
            message: 'OTP sent successfully',
            isNewUser: true,
          });
        }
      }

      // Generate OTP (6 digits)
      const otp = process.env.NODE_ENV === 'development'
        ? '123456'  // Fixed OTP for development
        : Math.floor(100000 + Math.random() * 900000).toString();

      // Delete existing OTPs for this phone
      await prisma.oTPVerification.deleteMany({
        where: { phone, purpose },
      });

      // Create new OTP
      await prisma.oTPVerification.create({
        data: {
          phone,
          otp,
          purpose,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      });

      // In production, send SMS
      if (process.env.NODE_ENV === 'production' && process.env.OTP_SERVICE !== 'mock') {
        // TODO: Integrate actual SMS service (MSG91/Twilio)
        logger.info(`Sending OTP ${otp} to ${phone}`);
      } else {
        logger.info(`[DEV] OTP for ${phone}: ${otp}`);
      }

      const user = await prisma.user.findUnique({ where: { phone } });

      res.json({
        success: true,
        message: 'OTP sent successfully',
        isNewUser: !user,
        // Include OTP in development mode
        ...(process.env.NODE_ENV === 'development' && { otp }),
      });
    } catch (error) {
      next(error);
    }
  };

  // Verify OTP
  verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone, otp, purpose } = req.body as VerifyOtpInput;

      const otpRecord = await prisma.oTPVerification.findFirst({
        where: {
          phone,
          purpose,
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpRecord) {
        throw new AppError('OTP expired or invalid', 400);
      }

      if (otpRecord.attempts >= 5) {
        throw new AppError('Too many attempts. Please request a new OTP', 400);
      }

      if (otpRecord.otp !== otp) {
        // Increment attempts
        await prisma.oTPVerification.update({
          where: { id: otpRecord.id },
          data: { attempts: { increment: 1 } },
        });
        throw new AppError('Invalid OTP', 400);
      }

      // Mark OTP as used
      await prisma.oTPVerification.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { phone },
      });

      if (user) {
        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date(), isPhoneVerified: true },
        });

        // Generate tokens
        const accessToken = jwt.sign(
          { userId: user.id, role: user.role },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        const refreshToken = uuidv4();

        // Store refresh token
        await prisma.refreshToken.create({
          data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        });

        return res.json({
          success: true,
          isNewUser: false,
          user: {
            id: user.id,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profilePhoto: user.profilePhoto,
            role: user.role,
            status: user.status,
          },
          accessToken,
          refreshToken,
        });
      }

      // New user - return registration token
      const registrationToken = jwt.sign(
        { phone, verified: true },
        JWT_SECRET,
        { expiresIn: '30m' }
      );

      res.json({
        success: true,
        isNewUser: true,
        registrationToken,
        message: 'Phone verified. Please complete registration.',
      });
    } catch (error) {
      next(error);
    }
  };

  // Complete Registration
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        phone,
        firstName,
        lastName,
        email,
        gender,
        dateOfBirth,
        cityId,
        sect,
        sanghId,
        gotra,
        registrationToken,
      } = req.body as RegisterInput;

      // Verify registration token
      let decoded: { phone: string; verified: boolean };
      try {
        decoded = jwt.verify(registrationToken, JWT_SECRET) as { phone: string; verified: boolean };
      } catch {
        throw new AppError('Invalid or expired registration token', 400);
      }

      if (decoded.phone !== phone || !decoded.verified) {
        throw new AppError('Phone number mismatch', 400);
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { phone },
      });

      if (existingUser) {
        throw new AppError('User already registered', 409);
      }

      // Check email uniqueness if provided
      if (email) {
        const emailExists = await prisma.user.findUnique({
          where: { email },
        });

        if (emailExists) {
          throw new AppError('Email already in use', 409);
        }
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          phone,
          firstName,
          lastName,
          email: email || null,
          gender: gender || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          cityId: cityId || null,
          sect: sect || null,
          sanghId: sanghId || null,
          gotra: gotra || null,
          isPhoneVerified: true,
          status: 'ACTIVE',
        },
      });

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const refreshToken = uuidv4();

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      logger.info(`New user registered: ${user.id}`);

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profilePhoto: user.profilePhoto,
          role: user.role,
          status: user.status,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  };

  // Refresh Token
  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body as RefreshTokenInput;

      const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!tokenRecord) {
        throw new AppError('Invalid refresh token', 401);
      }

      if (tokenRecord.expiresAt < new Date()) {
        await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
        throw new AppError('Refresh token expired', 401);
      }

      if (tokenRecord.user.status !== 'ACTIVE') {
        throw new AppError('Account is not active', 403);
      }

      // Generate new tokens
      const accessToken = jwt.sign(
        { userId: tokenRecord.userId, role: tokenRecord.user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const newRefreshToken = uuidv4();

      // Update refresh token
      await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: {
          token: newRefreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      res.json({
        success: true,
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      next(error);
    }
  };

  // Logout
  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      // Delete all refresh tokens for this user
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // Get Current User
  getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
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

      res.json({
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePhoto: user.profilePhoto,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          role: user.role,
          status: user.status,
          city: user.city,
          address: user.address,
          pincode: user.pincode,
          sect: user.sect,
          sangh: user.sangh,
          gotra: user.gotra,
          phonePrivacy: user.phonePrivacy,
          emailPrivacy: user.emailPrivacy,
          profilePrivacy: user.profilePrivacy,
          isPhoneVerified: user.isPhoneVerified,
          isEmailVerified: user.isEmailVerified,
          isProfileVerified: user.isProfileVerified,
          familyMembers: user.familyMembers,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
