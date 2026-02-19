export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  experience: string;
  description: string;
  requirements?: string[];
  education?: string;
  workMode?: 'onsite' | 'remote' | 'hybrid';
  industry?: string;
  companySize?: string;
  benefits?: string[];
  skills?: string[];
  postedAt: string;
  deadline?: string;
  isActive: boolean;
  isVerified?: boolean;
  contactEmail?: string;
  contactPhone?: string;
  openings?: number;
}

export interface JobSeekerProfile {
  id: string;
  name: string;
  currentStatus: 'working' | 'fresher' | 'student' | 'business';
  totalExperience?: string;
  currentCompany?: string;
  currentSalary?: string;
  expectedSalary?: string;
  preferredLocation?: string[];
  preferredType?: string;
  education: { qualification: string; course: string; college: string; passingYear: string }[];
  experience: { company: string; role: string; duration: string; responsibilities?: string }[];
  skills: { name: string; proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' }[];
  immediateJoiner?: boolean;
  noticePeriod?: string;
  willingToTravel?: boolean;
}

export type JobMode = 'hiring' | 'looking';
