import { z } from 'zod';
import { EventStatus } from '@prisma/client';

export const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  shortDescription: z.string().max(500).optional(),
  venue: z.string().min(1).max(200),
  address: z.string().min(1).max(500),
  cityId: z.string().uuid(),
  mapUrl: z.string().url().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  sanghId: z.string().uuid().optional().nullable(),
  organizerName: z.string().min(1).max(100),
  organizerPhone: z.string().max(15).optional(),
  organizerEmail: z.string().email().optional(),
  bannerImage: z.string().optional(),
  images: z.array(z.string()).optional(),
  dressCode: z.string().optional(),
  prohibitedItems: z.array(z.string()).optional(),
  parkingInfo: z.string().optional(),
  footwearInfo: z.string().optional(),
  isRegistrationRequired: z.boolean().default(false),
  registrationFee: z.number().min(0).optional(),
  maxAttendees: z.number().min(1).optional(),
  registrationDeadline: z.string().optional().nullable(),
  attendancePoints: z.number().min(0).default(0),
  status: z.nativeEnum(EventStatus).default(EventStatus.DRAFT),
  isPublic: z.boolean().default(true),
});

export const registerEventSchema = z.object({
  attendeeCount: z.number().min(1).max(10).default(1),
  attendeeNames: z.array(z.string()).optional(),
  hasDiabetes: z.boolean().optional(),
  hasBP: z.boolean().optional(),
  needsAccommodation: z.boolean().optional(),
  arrivalDateTime: z.string().optional(),
  specialRequirements: z.string().max(500).optional(),
});

export const feedbackSchema = z.object({
  overallRating: z.number().min(1).max(5),
  arrangementRating: z.number().min(1).max(5).optional(),
  foodRating: z.number().min(1).max(5).optional(),
  punctualityRating: z.number().min(1).max(5).optional(),
  suggestion: z.string().max(1000).optional(),
  photos: z.array(z.string()).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type RegisterEventInput = z.infer<typeof registerEventSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
