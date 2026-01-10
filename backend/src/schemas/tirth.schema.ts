import { z } from 'zod';

export const createTirthSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  address: z.string().min(1).max(500),
  cityId: z.string().uuid(),
  state: z.string().min(1).max(100),
  pincode: z.string().max(10).optional(),
  mapUrl: z.string().url().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phone: z.string().max(15).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  images: z.array(z.string()).optional(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  hasDharamshala: z.boolean().default(false),
  hasParking: z.boolean().default(false),
  hasBhojanshala: z.boolean().default(false),
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const createRoomSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  roomType: z.string().min(1),
  capacity: z.number().min(1),
  pricePerNight: z.number().min(0),
  hasAC: z.boolean().default(false),
  hasAttachedBath: z.boolean().default(true),
  amenities: z.array(z.string()).optional(),
  totalRooms: z.number().min(1).default(1),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const bookingSchema = z.object({
  tirthId: z.string().uuid(),
  roomId: z.string().uuid().optional(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  guestCount: z.number().min(1).default(1),
  guestNames: z.array(z.string()).optional(),
  contactPhone: z.string().min(10).max(15),
  specialRequests: z.string().max(500).optional(),
});

export type CreateTirthInput = z.infer<typeof createTirthSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
