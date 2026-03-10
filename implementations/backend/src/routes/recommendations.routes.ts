import { Router, Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { successResponse, errorResponse } from '../lib/response';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get(
  '/',
  authenticateToken,
  requireRole(Role.APPLICANT),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { isPaid: true, applicantProfile: { select: { skills: true, preferredLocation: true } } },
      });

      if (!user?.isPaid) {
        errorResponse(res, 'Payment required to view recommendations', 402);
        return;
      }

      const skills = user.applicantProfile?.skills ?? [];

      const appliedJobIds = await prisma.application.findMany({
        where: { applicantId: req.user!.id },
        select: { jobId: true },
      });
      const excludeIds = appliedJobIds.map((a) => a.jobId);

      let jobs = await prisma.job.findMany({
        where: {
          isActive: true,
          id: { notIn: excludeIds },
          ...(skills.length > 0 && { skills: { hasSome: skills } }),
        },
        include: {
          recruiter: { select: { id: true, firstName: true, lastName: true, recruiterProfile: { select: { companyName: true } } } },
        },
        take: 20,
      });

      // Score by number of matching skills
      const scored = jobs.map((job) => ({
        ...job,
        matchScore: skills.filter((s) => job.skills.includes(s)).length,
      }));
      scored.sort((a, b) => b.matchScore - a.matchScore);

      successResponse(res, scored.slice(0, 10));
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/similar/:jobId',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });
      if (!job) {
        errorResponse(res, 'Job not found', 404);
        return;
      }

      const similar = await prisma.job.findMany({
        where: {
          isActive: true,
          id: { not: req.params.jobId },
          OR: [
            { skills: { hasSome: job.skills } },
            { jobType: job.jobType },
          ],
        },
        include: {
          recruiter: { select: { recruiterProfile: { select: { companyName: true } } } },
        },
        take: 10,
      });

      const scored = similar.map((j) => ({
        ...j,
        matchScore:
          job.skills.filter((s) => j.skills.includes(s)).length +
          (j.jobType === job.jobType ? 1 : 0),
      }));
      scored.sort((a, b) => b.matchScore - a.matchScore);

      successResponse(res, scored.slice(0, 5));
    } catch (err) {
      next(err);
    }
  },
);

export default router;
