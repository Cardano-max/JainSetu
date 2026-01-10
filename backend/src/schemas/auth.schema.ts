import { z } from 'zod';
import { Sect } from '@prisma/client';

export const sendOtpSchema = z.object({
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be at most 15 digits')
    .regex(/^[0-9+]+$/, 'Invalid phone number format'),
  purpose: z.enum(['login', 'register', 'reset']).default('login'),
});

export const verifyOtpSchema = z.object({
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be at most 15 digits'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  purpose: z.enum(['login', 'register', 'reset']).default('login'),
});

export const registerSchema = z.object({
  phone: z.string().min(10).max(15),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email').optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().optional().nullable(),
  cityId: z.string().uuid().optional().nullable(),
  sect: z.nativeEnum(Sect).optional().nullable(),
  sanghId: z.string().uuid().optional().nullable(),
  gotra: z.string().max(50).optional().nullable(),
  registrationToken: z.string().min(1, 'Registration token is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
