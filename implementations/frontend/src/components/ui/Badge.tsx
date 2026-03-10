import { clsx } from 'clsx';
import type { ApplicationStatus, JobType, InterviewStatus } from '@/types';

type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'orange' | 'yellow' | 'secondary' | 'destructive';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
  warning: 'bg-yellow-100 text-yellow-700',
  info: 'bg-blue-100 text-blue-700',
  orange: 'bg-orange-100 text-orange-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  secondary: 'bg-gray-100 text-gray-600',
  destructive: 'bg-red-100 text-red-700',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const variantMap: Record<ApplicationStatus, BadgeVariant> = {
    APPLIED: 'orange',
    REVIEWING: 'info',
    INTERVIEWING: 'yellow',
    ACCEPTED: 'success',
    REJECTED: 'error',
  };

  const labelMap: Record<ApplicationStatus, string> = {
    APPLIED: 'Applied',
    REVIEWING: 'Under Review',
    INTERVIEWING: 'Interviewing',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
  };

  return <Badge variant={variantMap[status]}>{labelMap[status]}</Badge>;
}

export function JobTypeBadge({ type }: { type: JobType }) {
  const labelMap: Record<JobType, string> = {
    FULL_TIME: 'Full Time',
    PART_TIME: 'Part Time',
    CONTRACT: 'Contract',
    INTERNSHIP: 'Internship',
    REMOTE: 'Remote',
  };

  return <Badge variant="orange">{labelMap[type]}</Badge>;
}

export function InterviewStatusBadge({ status }: { status: InterviewStatus }) {
  const variantMap: Record<InterviewStatus, BadgeVariant> = {
    SCHEDULED: 'info',
    COMPLETED: 'success',
    CANCELLED: 'error',
  };
  return <Badge variant={variantMap[status]}>{status}</Badge>;
}
