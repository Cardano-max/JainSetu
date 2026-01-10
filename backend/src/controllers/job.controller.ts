import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { CreateJobInput, ApplyJobInput } from '../schemas/job.schema.js';

export class JobController {
  // Get Jobs
  getJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = '1',
        limit = '20',
        jobType,
        location,
        search,
        isRemote,
      } = req.query;

      const where: any = { status: 'ACTIVE' };

      if (jobType) where.jobType = jobType;
      if (location) where.location = { contains: location as string, mode: 'insensitive' };
      if (isRemote === 'true') where.isRemote = true;

      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { companyName: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.job.count({ where }),
      ]);

      res.json({
        success: true,
        jobs,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get Job by ID
  getJobById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const job = await prisma.job.findUnique({
        where: { id },
        include: {
          postedBy: {
            select: { firstName: true, lastName: true, profilePhoto: true },
          },
        },
      });

      if (!job) {
        throw new AppError('Job not found', 404);
      }

      // Increment view count
      await prisma.job.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });

      // Check if user has applied
      let hasApplied = false;
      if (req.user) {
        const application = await prisma.jobApplication.findUnique({
          where: { jobId_userId: { jobId: id, userId: req.user.id } },
        });
        hasApplied = !!application;
      }

      res.json({ success: true, job, hasApplied });
    } catch (error) {
      next(error);
    }
  };

  // Apply for Job
  applyForJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const data = req.body as ApplyJobInput;

      const job = await prisma.job.findUnique({ where: { id } });

      if (!job) {
        throw new AppError('Job not found', 404);
      }

      // Check if already applied
      const existing = await prisma.jobApplication.findUnique({
        where: { jobId_userId: { jobId: id, userId } },
      });

      if (existing) {
        throw new AppError('Already applied for this job', 409);
      }

      // Check deadline
      if (job.applicationDeadline && new Date() > job.applicationDeadline) {
        throw new AppError('Application deadline has passed', 400);
      }

      const application = await prisma.jobApplication.create({
        data: {
          jobId: id,
          userId,
          coverLetter: data.coverLetter,
          resumeUrl: data.resumeUrl,
        },
      });

      // Update application count
      await prisma.job.update({
        where: { id },
        data: { applicationCount: { increment: 1 } },
      });

      // Notify job poster
      await prisma.notification.create({
        data: {
          userId: job.postedById,
          title: 'New Job Application',
          body: `Someone applied for ${job.title}`,
          type: 'job_application',
          entityType: 'job',
          entityId: id,
        },
      });

      res.status(201).json({ success: true, application });
    } catch (error) {
      next(error);
    }
  };

  // Get My Applications
  getMyApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const applications = await prisma.jobApplication.findMany({
        where: { userId },
        include: {
          job: {
            select: {
              title: true,
              companyName: true,
              companyLogo: true,
              location: true,
              jobType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, applications });
    } catch (error) {
      next(error);
    }
  };

  // Get My Posted Jobs
  getMyPostedJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const jobs = await prisma.job.findMany({
        where: { postedById: userId },
        include: { _count: { select: { applications: true } } },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, jobs });
    } catch (error) {
      next(error);
    }
  };

  // Create Job
  createJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const data = req.body as CreateJobInput;

      const job = await prisma.job.create({
        data: {
          postedById: userId,
          ...data,
          applicationDeadline: data.applicationDeadline
            ? new Date(data.applicationDeadline)
            : null,
          status: 'ACTIVE',
        },
      });

      res.status(201).json({ success: true, job });
    } catch (error) {
      next(error);
    }
  };

  // Update Job
  updateJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const data = req.body as CreateJobInput;

      const existing = await prisma.job.findFirst({
        where: { id, postedById: userId },
      });

      if (!existing) {
        throw new AppError('Job not found', 404);
      }

      const job = await prisma.job.update({
        where: { id },
        data: {
          ...data,
          applicationDeadline: data.applicationDeadline
            ? new Date(data.applicationDeadline)
            : null,
        },
      });

      res.json({ success: true, job });
    } catch (error) {
      next(error);
    }
  };

  // Delete Job
  deleteJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const existing = await prisma.job.findFirst({
        where: { id, postedById: userId },
      });

      if (!existing) {
        throw new AppError('Job not found', 404);
      }

      await prisma.job.update({
        where: { id },
        data: { status: 'EXPIRED' },
      });

      res.json({ success: true, message: 'Job deleted' });
    } catch (error) {
      next(error);
    }
  };

  // Get Job Applications
  getJobApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const job = await prisma.job.findFirst({
        where: { id, postedById: userId },
      });

      if (!job) {
        throw new AppError('Job not found', 404);
      }

      const applications = await prisma.jobApplication.findMany({
        where: { jobId: id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              profilePhoto: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, applications });
    } catch (error) {
      next(error);
    }
  };

  // Update Application Status
  updateApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { applicationId } = req.params;
      const userId = req.user!.id;
      const { status } = req.body;

      const application = await prisma.jobApplication.findUnique({
        where: { id: applicationId },
        include: { job: true },
      });

      if (!application || application.job.postedById !== userId) {
        throw new AppError('Application not found', 404);
      }

      const updated = await prisma.jobApplication.update({
        where: { id: applicationId },
        data: { status },
      });

      // Notify applicant
      await prisma.notification.create({
        data: {
          userId: application.userId,
          title: 'Application Update',
          body: `Your application for ${application.job.title} is now: ${status}`,
          type: 'application_update',
          entityType: 'application',
          entityId: applicationId,
        },
      });

      res.json({ success: true, application: updated });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Get All Jobs
  getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, page = '1', limit = '50' } = req.query;

      const where: any = {};
      if (status) where.status = status;

      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          include: {
            postedBy: {
              select: { firstName: true, lastName: true, phone: true },
            },
            _count: { select: { applications: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        }),
        prisma.job.count({ where }),
      ]);

      res.json({
        success: true,
        jobs,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Approve Job
  approveJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const job = await prisma.job.update({
        where: { id },
        data: { status: 'ACTIVE' },
      });

      res.json({ success: true, job });
    } catch (error) {
      next(error);
    }
  };
}
