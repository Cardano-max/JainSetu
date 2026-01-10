import { z } from 'zod';
import { Sect, MaritalStatus } from '@prisma/client';

export const createProfileSchema = z.object({
  // Basic Info
  height: z.string().optional(),
  weight: z.string().optional(),
  complexion: z.string().optional(),
  bodyType: z.string().optional(),
  bloodGroup: z.string().optional(),

  // Personal
  maritalStatus: z.nativeEnum(MaritalStatus).default(MaritalStatus.NEVER_MARRIED),
  hasChildren: z.boolean().default(false),
  childrenCount: z.number().optional(),

  // Education & Career
  education: z.string().optional(),
  educationDetail: z.string().optional(),
  profession: z.string().optional(),
  companyName: z.string().optional(),
  annualIncome: z.string().optional(),
  workingCity: z.string().optional(),

  // Family
  fatherName: z.string().optional(),
  fatherOccupation: z.string().optional(),
  motherName: z.string().optional(),
  motherOccupation: z.string().optional(),
  siblings: z.string().optional(),
  familyType: z.string().optional(),
  familyStatus: z.string().optional(),
  nativePlace: z.string().optional(),

  // Religious
  sect: z.nativeEnum(Sect).optional(),
  subSect: z.string().optional(),
  gotra: z.string().optional(),

  // Lifestyle
  diet: z.string().optional(),
  drinking: z.string().optional(),
  smoking: z.string().optional(),

  // About
  aboutMe: z.string().max(2000).optional(),
  hobbies: z.array(z.string()).optional(),

  // Photos
  photos: z.array(z.string()).optional(),

  // Privacy
  showPhone: z.boolean().default(false),
  showEmail: z.boolean().default(false),
});

export const updatePreferencesSchema = z.object({
  preferredAgeMin: z.number().min(18).max(80).optional(),
  preferredAgeMax: z.number().min(18).max(80).optional(),
  preferredHeightMin: z.string().optional(),
  preferredHeightMax: z.string().optional(),
  preferredEducation: z.array(z.string()).optional(),
  preferredProfession: z.array(z.string()).optional(),
  preferredCity: z.array(z.string()).optional(),
  preferredSect: z.array(z.nativeEnum(Sect)).optional(),
  aboutPartner: z.string().max(2000).optional(),
});

export const sendInterestSchema = z.object({
  receiverId: z.string().uuid(),
  message: z.string().max(500).optional(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type SendInterestInput = z.infer<typeof sendInterestSchema>;
