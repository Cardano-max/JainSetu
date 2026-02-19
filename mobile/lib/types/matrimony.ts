export interface MatrimonyProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  dateOfBirth?: string;
  height: string;
  weight?: string;
  complexion?: string;
  bloodGroup?: string;
  maritalStatus: string;
  diet?: string;
  language?: string;
  sect?: string;
  caste?: string;
  gotra?: string;
  city: string;
  nativePlace?: { paternal?: { city: string; state: string }; maternal?: { city: string; state: string } };
  education: { highest?: string; degree: string; college?: string };
  work?: { occupation: string; company?: string; location?: string; incomeRange?: string };
  family: {
    fatherName?: string;
    fatherOccupation?: string;
    motherName?: string;
    motherOccupation?: string;
    siblings?: { relation: string; maritalStatus: string; details?: string }[];
    familyType?: 'Joint' | 'Nuclear';
    about?: string;
  };
  mamaji?: { name: string; currentCity?: string; nativePlace?: { city: string; state: string }; occupation?: string }[];
  buva?: { name: string; currentCity?: string; nativePlace?: { city: string; state: string }; occupation?: string }[];
  dharmik?: {
    routine?: string[];
    knowledgeLevel?: 'basic' | 'intermediate' | 'advanced';
    pathshala?: { attended: boolean; years?: number };
    seva?: string[];
  };
  tap?: {
    types?: string[];
    lifetimeCounts?: { upvas: number; ayambil: number; ekasana: number };
    recent12Months?: { upvas: number; ayambil: number };
    biggestTap?: string;
  };
  partnerPrefs?: {
    ageRange?: { min: number; max: number };
    heightRange?: { min: string; max: string };
    cityPreference?: string[];
    sectPreference?: string;
    educationPreference?: string;
    dharmikPreference?: string;
  };
  about?: string;
  isVerified: boolean;
  verificationLevel?: 'basic' | 'id' | 'community';
  isPremium?: boolean;
  photos?: string[];
  contactPhone?: string;
  contactEmail?: string;
  contactWhatsapp?: string;
  isContactVisible?: boolean;
}

export interface MatrimonyInterest {
  id: string;
  fromProfileId: string;
  toProfileId: string;
  status: 'pending' | 'accepted' | 'rejected';
  sentAt: string;
}

export type BiodataSection =
  | 'profile'
  | 'education'
  | 'family'
  | 'mamaji-buva'
  | 'dharmik'
  | 'tap'
  | 'partner'
  | 'contact';
