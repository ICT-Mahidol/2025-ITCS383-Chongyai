import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { successResponse } from '../lib/response';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const SendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  sessionId: z.string().min(1),
});

function isBusinessHours(): boolean {
  const now = new Date();
  // UTC+7 (Thailand)
  const thaiHour = (now.getUTCHours() + 7) % 24;
  const day = now.getUTCDay(); // 0=Sun, 6=Sat
  return day >= 1 && day <= 5 && thaiHour >= 9 && thaiHour < 17;
}

function generateBotResponse(content: string): string {
  const lower = content.toLowerCase();

  if (lower.includes('job') || lower.includes('งาน')) {
    return 'We have many exciting job opportunities available! You can browse jobs from the Jobs section in your dashboard. Use filters to find positions matching your skills and preferred location.';
  }
  if (lower.includes('apply') || lower.includes('สมัคร')) {
    return 'To apply for a job: 1) Complete your profile, 2) Pay the registration fee (500 THB), 3) Verify your Citizen ID, 4) Browse jobs and click Apply. Your application status will be updated in the Applications section.';
  }
  if (lower.includes('payment') || lower.includes('pay') || lower.includes('ชำระ') || lower.includes('เงิน')) {
    return 'Registration fee is 500 THB for Applicants and 5,000 THB for Recruiters. Go to Profile → Payment to complete your registration payment. We accept all major credit/debit cards.';
  }
  if (lower.includes('verify') || lower.includes('id') || lower.includes('บัตร')) {
    return 'To verify your identity, go to Profile → Verify ID and enter your 13-digit Thai Citizen ID number. Verification is required before you can apply for jobs.';
  }
  if (lower.includes('interview') || lower.includes('สัมภาษณ์')) {
    return 'Interview scheduling is handled by recruiters. Once you apply, the recruiter may invite you for an interview. You can view scheduled interviews in the Interviews section of your dashboard.';
  }
  if (lower.includes('bookmark') || lower.includes('save') || lower.includes('บันทึก')) {
    return 'You can bookmark jobs by clicking the bookmark icon on any job listing. Access your saved jobs from the Bookmarks section in your dashboard.';
  }
  if (lower.includes('password') || lower.includes('รหัสผ่าน')) {
    return 'To change your password, go to Profile → Security → Change Password. You will need your current password to set a new one.';
  }
  if (lower.includes('help') || lower.includes('ช่วย') || lower.includes('how')) {
    return 'I can help you with: \n• Finding jobs (type "jobs")\n• Applying for positions (type "apply")\n• Payment information (type "payment")\n• ID verification (type "verify")\n• Interview scheduling (type "interview")\n• Saving jobs (type "bookmark")\n\nFor complex issues, a human agent will assist you during business hours (Mon–Fri 9:00–17:00).';
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('สวัสดี')) {
    return 'Hello! Welcome to Chongyai Job Center. How can I assist you today? Type "help" to see what I can help you with.';
  }

  return 'Thank you for your message. I\'m your automated assistant. For detailed assistance, please type "help" to see available topics. Human support is available Mon–Fri 9:00–17:00 (Bangkok time).';
}

router.post(
  '/message',
  authenticateToken,
  validate(SendMessageSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { content, sessionId } = req.body as z.infer<typeof SendMessageSchema>;

      const userMessage = await prisma.message.create({
        data: { senderId: req.user!.id, content, sessionId, isBot: false },
      });

      const botContent = generateBotResponse(content);
      const botMessage = await prisma.message.create({
        data: { content: botContent, sessionId, isBot: true },
      });

      successResponse(res, { userMessage, botMessage });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/history/:sessionId',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const messages = await prisma.message.findMany({
        where: { sessionId: req.params.sessionId },
        orderBy: { createdAt: 'asc' },
      });
      successResponse(res, messages);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/sessions',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sessions = await prisma.message.findMany({
        where: { senderId: req.user!.id },
        select: { sessionId: true, createdAt: true },
        distinct: ['sessionId'],
        orderBy: { createdAt: 'desc' },
      });
      successResponse(res, sessions);
    } catch (err) {
      next(err);
    }
  },
);

router.get('/support-status', (_req: Request, res: Response): void => {
  const available = isBusinessHours();
  successResponse(res, {
    available,
    message: available
      ? 'Human support is available now (Mon–Fri 9:00–17:00 Bangkok time)'
      : 'Human support is available Mon–Fri 9:00–17:00 Bangkok time. Our chatbot is here to help 24/7.',
  });
});

export default router;
