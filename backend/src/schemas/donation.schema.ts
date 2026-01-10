import { z } from 'zod';

export const createCauseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  shortDescription: z.string().max(500).optional(),
  targetAmount: z.number().min(0).optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  organizerName: z.string().min(1).max(100),
  organizerPhone: z.string().max(15).optional(),
  is80GEligible: z.boolean().default(false),
  panNumber: z.string().max(20).optional(),
  isActive: z.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
});

export const makeDonationSchema = z.object({
  causeId: z.string().uuid(),
  amount: z.number().min(1),
  donorName: z.string().min(1).max(100),
  donorPhone: z.string().min(10).max(15),
  donorEmail: z.string().email().optional(),
  donorPAN: z.string().max(20).optional(),
  isAnonymous: z.boolean().default(false),
  paymentId: z.string().optional(),
  paymentMethod: z.string().optional(),
});

export const createPaymentOrderSchema = z.object({
  amount: z.number().min(1),
  causeId: z.string().uuid(),
});

export type CreateCauseInput = z.infer<typeof createCauseSchema>;
export type MakeDonationInput = z.infer<typeof makeDonationSchema>;
export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;
