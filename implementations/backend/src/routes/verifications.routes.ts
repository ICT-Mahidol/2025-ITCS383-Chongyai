import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { VerificationStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { successResponse, errorResponse } from '../lib/response';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const VerifyIdSchema = z.object({
  citizenId: z.string().regex(/^\d{13}$/, 'Citizen ID must be exactly 13 digits'),
});

function validateThaiId(id: string): boolean {
  if (id.length !== 13) return false;
  const digits = id.split('').map(Number);
  const sum = digits.slice(0, 12).reduce((acc, digit, index) => acc + digit * (13 - index), 0);
  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === digits[12];
}

router.post(
  '/verify-id',
  authenticateToken,
  validate(VerifyIdSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { isVerified: true },
      });
      if (user?.isVerified) {
        errorResponse(res, 'Identity already verified', 400);
        return;
      }

      const { citizenId } = req.body as z.infer<typeof VerifyIdSchema>;
      const isValid = validateThaiId(citizenId);

      const verification = await prisma.verification.upsert({
        where: { userId: req.user!.id },
        update: {
          citizenId,
          status: isValid ? VerificationStatus.VERIFIED : VerificationStatus.FAILED,
          verifiedAt: isValid ? new Date() : null,
        },
        create: {
          userId: req.user!.id,
          citizenId,
          status: isValid ? VerificationStatus.VERIFIED : VerificationStatus.FAILED,
          verifiedAt: isValid ? new Date() : null,
        },
      });

      if (isValid) {
        await prisma.user.update({
          where: { id: req.user!.id },
          data: { citizenId, isVerified: true },
        });
      }

      successResponse(res, {
        status: verification.status,
        message: isValid
          ? 'Identity verified successfully'
          : 'Citizen ID verification failed. Please check your ID number.',
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/status',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const verification = await prisma.verification.findUnique({
        where: { userId: req.user!.id },
        select: { status: true, verifiedAt: true, createdAt: true },
      });

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { isVerified: true },
      });

      successResponse(res, {
        isVerified: user?.isVerified ?? false,
        verification: verification ?? null,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
