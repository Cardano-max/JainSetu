import { z } from 'zod';

export const createBusinessSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  categoryId: z.string().uuid(),
  phone: z.string().min(10).max(15),
  alternatePhone: z.string().max(15).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  whatsapp: z.string().max(15).optional(),
  address: z.string().min(1).max(500),
  cityId: z.string().uuid(),
  pincode: z.string().max(10).optional(),
  mapUrl: z.string().url().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  logo: z.string().optional(),
  images: z.array(z.string()).optional(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  workingDays: z.array(z.string()).optional(),
});

export const inquirySchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(10).max(15),
  email: z.string().email().optional(),
  message: z.string().max(1000).optional(),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type InquiryInput = z.infer<typeof inquirySchema>;
