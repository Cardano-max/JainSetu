export interface MaharajProfile {
  id: string;
  nameEn: string;
  nameGu: string;
  dikshaName?: string;
  sampraday: 'Shwetambar' | 'Digambar' | 'Sthanakvasi' | 'Terapanthi';
  gachchh?: string;
  guruName?: string;
  dikshaDate?: string;
  dikshaPlace?: string;
  sanghId?: string;
  sanghName?: string;
  sanghMemberCount?: number;
  isLeader?: boolean;
  isPublic: boolean;
  photo?: string;
  followersCount: number;
  isFollowing?: boolean;
  currentLocation: MaharajLocation;
  schedule?: MaharajSchedule;
}

export interface MaharajLocation {
  city: string;
  area?: string;
  upashrayName: string;
  fromDate: string;
  toDate?: string;
  lastUpdatedAt: string;
  status: 'updated_today' | 'updated_this_week' | 'outdated';
}

export interface MaharajSchedule {
  pravachanTime?: string;
  samayikTime?: string;
  pratikramanTime?: string;
  swadhyayTime?: string;
  notes?: string;
}

export interface MaharajPlanEntry {
  date: string;
  city: string;
  area?: string;
  upashray?: string;
  arrivalTime?: string;
  status: 'confirmed' | 'tentative';
  notes?: string;
}

export interface MaharajPlanner {
  tomorrow?: MaharajPlanEntry;
  weekly: MaharajPlanEntry[];
  monthly: { city: string; fromDate: string; toDate: string; event?: string }[];
}

export interface MaharajEvent {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  location: string;
  type: 'pravachan' | 'mahotsav' | 'tap' | 'seva' | 'other';
}

export interface MaharajContact {
  id: string;
  personName: string;
  role: 'Sevak' | 'Trust' | 'Sangh';
  phone: string;
  whatsapp?: string;
  callingHours?: string;
  isVerified: boolean;
}
