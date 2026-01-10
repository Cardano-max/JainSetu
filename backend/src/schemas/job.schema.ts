import { z } from 'zod';
import { JobType } from '@prisma/client';

export const createJobSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  companyName: z.string().min(1).max(200),
  companyLogo: z.string().optional(),
  jobType: z.nativeEnum(JobType).default(JobType.FULL_TIME),
  experienceMin: z.number().min(0).optional(),
  experienceMax: z.number().min(0).optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  salaryPeriod: z.string().optional(),
  location: z.string().min(1).max(200),
  isRemote: z.boolean().default(false),
  skills: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(15).optional(),
  applyLink: z.string().url().optional(),
  applicationDeadline: z.string().optional().nullable(),
});

export const applyJobSchema = z.object({
  coverLetter: z.string().max(2000).optional(),
  resumeUrl: z.string().optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type ApplyJobInput = z.infer<typeof applyJobSchema>;
