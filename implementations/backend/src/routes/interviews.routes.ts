import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Role, InterviewType, InterviewStatus, ApplicationStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { successResponse, errorResponse } from '../lib/response';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const CreateInterviewSchema = z.object({
  applicationId: z.string().min(1),
  scheduledAt: z.string().datetime(),
  duration: z.number().int().positive().default(60),
  type: z.nativeEnum(InterviewType),
  notes: z.string().nullable().optional(),
});

const UpdateInterviewSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  duration: z.number().int().positive().optional(),
  type: z.nativeEnum(InterviewType).optional(),
  status: z.nativeEnum(InterviewStatus).optional(),
  notes: z.string().nullable().optional(),
});

router.post(
  '/',
  authenticateToken,
  requireRole(Role.RECRUITER),
  validate(CreateInterviewSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { applicationId, scheduledAt, duration, type, notes } =
        req.body as z.infer<typeof CreateInterviewSchema>;

      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { job: { select: { recruiterId: true } } },
      });
      if (!application) {
        errorResponse(res, 'Application not found', 404);
        return;
      }
      if (application.job.recruiterId !== req.user!.id) {
        errorResponse(res, 'Not authorized', 403);
        return;
      }

      const interview = await prisma.interview.create({
        data: { applicationId, scheduledAt: new Date(scheduledAt), duration, type, notes },
      });

      await prisma.application.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.INTERVIEWING },
      });

      successResponse(res, interview, 201);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/mine',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role, id } = req.user!;

      if (role === Role.APPLICANT) {
        const interviews = await prisma.interview.findMany({
          where: { application: { applicantId: id } },
          include: {
            application: {
              include: { job: { select: { title: true, recruiter: { select: { recruiterProfile: { select: { companyName: true } } } } } } },
            },
          },
          orderBy: { scheduledAt: 'asc' },
        });
        successResponse(res, interviews);
      } else if (role === Role.RECRUITER) {
        const interviews = await prisma.interview.findMany({
          where: { application: { job: { recruiterId: id } } },
          include: {
            application: {
              include: {
                job: { select: { title: true } },
                applicant: { select: { firstName: true, lastName: true, email: true } },
              },
            },
          },
          orderBy: { scheduledAt: 'asc' },
        });
        successResponse(res, interviews);
      } else {
        const interviews = await prisma.interview.findMany({
          include: { application: true },
          orderBy: { scheduledAt: 'asc' },
        });
        successResponse(res, interviews);
      }
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:id',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const interview = await prisma.interview.findUnique({
        where: { id: req.params.id },
        include: {
          application: {
            include: {
              job: { include: { recruiter: { select: { id: true, recruiterProfile: { select: { companyName: true } } } } } },
              applicant: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
        },
      });
      if (!interview) {
        errorResponse(res, 'Interview not found', 404);
        return;
      }
      successResponse(res, interview);
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  '/:id',
  authenticateToken,
  requireRole(Role.RECRUITER, Role.ADMIN),
  validate(UpdateInterviewSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const interview = await prisma.interview.findUnique({
        where: { id: req.params.id },
        include: { application: { include: { job: { select: { recruiterId: true } } } } },
      });
      if (!interview) {
        errorResponse(res, 'Interview not found', 404);
        return;
      }
      if (req.user!.role === Role.RECRUITER && interview.application.job.recruiterId !== req.user!.id) {
        errorResponse(res, 'Not authorized', 403);
        return;
      }

      const { scheduledAt, ...rest } = req.body as z.infer<typeof UpdateInterviewSchema>;
      const updated = await prisma.interview.update({
        where: { id: req.params.id },
        data: {
          ...rest,
          ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        },
      });
      successResponse(res, updated);
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole(Role.RECRUITER, Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const interview = await prisma.interview.findUnique({
        where: { id: req.params.id },
        include: { application: { include: { job: { select: { recruiterId: true } } } } },
      });
      if (!interview) {
        errorResponse(res, 'Interview not found', 404);
        return;
      }
      if (req.user!.role === Role.RECRUITER && interview.application.job.recruiterId !== req.user!.id) {
        errorResponse(res, 'Not authorized', 403);
        return;
      }
      await prisma.interview.update({ where: { id: req.params.id }, data: { status: InterviewStatus.CANCELLED } });
      successResponse(res, { message: 'Interview cancelled' });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
