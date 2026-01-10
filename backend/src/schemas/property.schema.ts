import { z } from 'zod';
import { PropertyType, PropertyListingType } from '@prisma/client';

export const createPropertySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  propertyType: z.nativeEnum(PropertyType),
  listingType: z.nativeEnum(PropertyListingType),
  price: z.number().min(0),
  priceUnit: z.string().optional(),
  isNegotiable: z.boolean().default(true),
  area: z.number().min(0).optional(),
  areaUnit: z.string().optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  floors: z.number().min(0).optional(),
  furnishing: z.string().optional(),
  facing: z.string().optional(),
  ageOfProperty: z.string().optional(),
  address: z.string().min(1).max(500),
  cityId: z.string().uuid(),
  locality: z.string().optional(),
  pincode: z.string().max(10).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().url().optional(),
  contactName: z.string().max(100).optional(),
  contactPhone: z.string().min(10).max(15),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
