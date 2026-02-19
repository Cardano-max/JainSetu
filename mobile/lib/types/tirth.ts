export type TirthCategory =
  | 'all'
  | 'tirth'
  | 'dharamshala'
  | 'temple'
  | 'upashray'
  | 'bhojanshala'
  | 'ayambil'
  | 'gharDerasar'
  | '108parshwanath'
  | 'viharDham';

export interface TirthListing {
  id: string;
  tirthId?: string;
  category: Exclude<TirthCategory, 'all'>;
  name: string;
  nameGuj?: string;
  address?: string;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
  description?: string;
  facilities: string[];
  timings?: Record<string, string>;
  rules?: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  contacts: TirthContact[];
  photos: string[];
  roomAvailability?: 'available' | 'limited' | 'full';
  hasMenu?: boolean;
  nearestRailway?: string;
  nearestAirport?: string;
}

export interface TirthContact {
  personName: string;
  phone1?: string;
  phone2?: string;
  whatsapp?: string;
  email?: string;
  visibility: 'public' | 'locked';
}

export interface DailyMenu {
  id: string;
  listingId: string;
  date: string;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  ayambil?: string;
  price?: string;
  timings?: Record<string, string>;
}

export interface RoomType {
  id: string;
  listingId: string;
  typeName: string;
  beds: number;
  basePrice: number;
  totalRooms: number;
  availableRooms: number;
}

export interface TirthBooking {
  id: string;
  listingId: string;
  listingName: string;
  roomTypeId: string;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  roomsCount: number;
  guestName: string;
  guestPhone: string;
  guestIdType?: string;
  guestSampraday?: string;
  totalAmount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'checked-in' | 'completed';
  createdAt: string;
}

export interface TirthReview {
  id: string;
  listingId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}
