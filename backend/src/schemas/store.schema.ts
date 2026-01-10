import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  categoryId: z.string().uuid(),
  price: z.number().min(0),
  comparePrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  sku: z.string().optional(),
  quantity: z.number().min(0).default(0),
  lowStockThreshold: z.number().min(0).default(5),
  images: z.array(z.string()).optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  material: z.string().optional(),
  isFreeShipping: z.boolean().default(false),
  shippingCharge: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().min(1),
  })).min(1),
  shippingName: z.string().min(1).max(100),
  shippingPhone: z.string().min(10).max(15),
  shippingAddress: z.string().min(1).max(500),
  shippingCity: z.string().min(1).max(100),
  shippingState: z.string().min(1).max(100),
  shippingPincode: z.string().min(1).max(10),
  notes: z.string().max(500).optional(),
  paymentMethod: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
