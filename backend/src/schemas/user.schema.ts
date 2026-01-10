import { z } from 'zod';
import { Sect, PrivacyLevel } from '@prisma/client';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  profilePhoto: z.string().optional().nullable(),
  cityId: z.string().uuid().optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  pincode: z.string().max(10).optional().nullable(),
  sect: z.nativeEnum(Sect).optional().nullable(),
  sanghId: z.string().uuid().optional().nullable(),
  gotra: z.string().max(50).optional().nullable(),
});

export const updatePrivacySchema = z.object({
  phonePrivacy: z.nativeEnum(PrivacyLevel).optional(),
  emailPrivacy: z.nativeEnum(PrivacyLevel).optional(),
  profilePrivacy: z.nativeEnum(PrivacyLevel).optional(),
});

export const addFamilyMemberSchema = z.object({
  name: z.string().min(1).max(100),
  relation: z.string().min(1).max(50),
  phone: z.string().max(15).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePrivacyInput = z.infer<typeof updatePrivacySchema>;
export type AddFamilyMemberInput = z.infer<typeof addFamilyMemberSchema>;
