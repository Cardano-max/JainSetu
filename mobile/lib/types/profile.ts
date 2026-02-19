export interface ExtendedProfile {
  id: string;
  firstName: string;
  firstNameGuj?: string;
  lastName: string;
  lastNameGuj?: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  city: string;
  nativePlace?: string;
  bloodGroup?: string;
  bio?: string;
  profilePhoto?: string;
  coverPhoto?: string;
  isVerified: boolean;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  family: FamilyInfo;
  dharmik: DharmikInfo;
  tap: TapInfo;
  lifestyle: LifestyleInfo;
  social: SocialInfo;
  points: PointsInfo;
}

export interface FamilyInfo {
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  children?: string[];
  mamajiName?: string;
  mamajiCity?: string;
  buvaName?: string;
  buvaCity?: string;
  sanghName?: string;
}

export interface DharmikInfo {
  sampraday?: 'Digambar' | 'Shwetambar' | 'Sthanakvasi' | 'Terapanthi';
  guruName?: string;
  darshanDaily?: boolean;
  samayikDaily?: boolean;
  pratikramanDaily?: boolean;
}

export interface TapInfo {
  type?: string[];
  totalFasts?: number;
  currentStreak?: number;
  history?: TapEntry[];
}

export interface TapEntry {
  id: string;
  type: string;
  date: string;
  duration?: string;
  location?: string;
}

export interface LifestyleInfo {
  diet?: 'Jain' | 'Vegetarian' | 'Vegan';
  wakeUpTime?: string;
  sleepTime?: string;
  yoga?: boolean;
  meditation?: boolean;
}

export interface SocialInfo {
  bio?: string;
  interests?: string[];
  privacy?: 'public' | 'contacts' | 'private';
}

export interface PointsInfo {
  balance: number;
  lifetimeEarned: number;
  transactions: PointTransaction[];
}

export interface PointTransaction {
  id: string;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  date: string;
}

export interface Post {
  id: string;
  imageUrl?: string;
  caption?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface StoryHighlight {
  id: string;
  title: string;
  icon: string;
  color: string;
  count: number;
}
