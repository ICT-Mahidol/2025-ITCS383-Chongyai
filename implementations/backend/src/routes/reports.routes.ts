import { Router, Request, Response, NextFunction } from 'express';
import { Role, ApplicationStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { successResponse } from '../lib/response';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get(
  '/summary',
  authenticateToken,
  requireRole(Role.ADMIN),
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [
        totalApplicants,
        totalRecruiters,
        totalAdmins,
        totalActiveJobs,
        totalInactiveJobs,
        totalApplications,
        acceptedApplications,
        completedPayments,
        recentUsers,
        recentJobs,
      ] = await prisma.$transaction([
        prisma.user.count({ where: { role: Role.APPLICANT } }),
        prisma.user.count({ where: { role: Role.RECRUITER } }),
        prisma.user.count({ where: { role: Role.ADMIN } }),
        prisma.job.count({ where: { isActive: true } }),
        prisma.job.count({ where: { isActive: false } }),
        prisma.application.count(),
        prisma.application.count({ where: { status: ApplicationStatus.ACCEPTED } }),
        prisma.payment.count({ where: { status: PaymentStatus.COMPLETED } }),
        prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.job.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      ]);

      const totalRevenue = await prisma.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      });

      successResponse(res, {
        users: { total: totalApplicants + totalRecruiters + totalAdmins, applicants: totalApplicants, recruiters: totalRecruiters, admins: totalAdmins },
        jobs: { active: totalActiveJobs, inactive: totalInactiveJobs },
        applications: { total: totalApplications, accepted: acceptedApplications },
        payments: { completed: completedPayments, revenue: totalRevenue._sum.amount ?? 0 },
        recentActivity: { newUsers: recentUsers, newJobs: recentJobs },
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/jobs',
  authenticateToken,
  requireRole(Role.ADMIN),
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const topViewed = await prisma.job.findMany({
        orderBy: { viewCount: 'desc' },
        take: 10,
        select: { id: true, title: true, viewCount: true, isActive: true },
      });

      const byType = await prisma.job.groupBy({
        by: ['jobType'],
        _count: { id: true },
      });

      const byLocation = await prisma.job.groupBy({
        by: ['location'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      });

      successResponse(res, { topViewed, byType, byLocation });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/applications',
  authenticateToken,
  requireRole(Role.ADMIN),
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const byStatus = await prisma.application.groupBy({
        by: ['status'],
        _count: { id: true },
      });

      successResponse(res, { byStatus });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/users',
  authenticateToken,
  requireRole(Role.ADMIN),
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const byRole = await prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      });

      const recentUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, email: true, role: true, firstName: true, lastName: true, createdAt: true },
      });

      successResponse(res, { byRole, recentUsers });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/payments',
  authenticateToken,
  requireRole(Role.ADMIN),
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const byStatus = await prisma.payment.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { amount: true },
      });

      const totalRevenue = await prisma.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      });

      successResponse(res, { byStatus, totalRevenue: totalRevenue._sum.amount ?? 0 });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
