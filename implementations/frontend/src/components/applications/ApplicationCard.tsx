'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Building2, MapPin, CalendarPlus, User } from 'lucide-react';
import { ApplicationStatusBadge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { Application, ApplicationStatus } from '@/types';

const STATUS_OPTIONS = [
  { value: 'APPLIED', label: 'Applied' },
  { value: 'REVIEWING', label: 'Under Review' },
  { value: 'INTERVIEWING', label: 'Interviewing' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
];

interface ApplicationCardProps {
  application: Application;
  showApplicant?: boolean;
  onStatusChange?: (id: string, status: ApplicationStatus) => Promise<void>;
  showViewProfile?: boolean;
  showScheduleInterview?: boolean;
  onScheduleInterview?: (application: Application) => void;
}

export function ApplicationCard({ 
  application, 
  showApplicant = false, 
  onStatusChange,
  showViewProfile = false,
  showScheduleInterview = false,
  onScheduleInterview 
}: ApplicationCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const companyName = application.job?.recruiter?.recruiterProfile?.companyName;

  const handleStatusChange = async (status: string) => {
    if (!onStatusChange) return;
    setIsUpdating(true);
    try {
      await onStatusChange(application.id, status as ApplicationStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {application.job?.title ?? 'Job'}
          </h3>
          {companyName && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
              <Building2 className="w-3.5 h-3.5" />
              {companyName}
            </div>
          )}
          {application.job?.location && (
            <div className="flex items-center gap-1 text-sm text-gray-400 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              {application.job.location}
            </div>
          )}
        </div>
        <ApplicationStatusBadge status={application.status} />
      </div>

      {showApplicant && application.applicant && (
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">
            Applicant: <span className="font-medium">{application.applicant.firstName} {application.applicant.lastName}</span>
          </p>
          {showViewProfile && (
            <Link 
              href={`/dashboard/recruiter/applicants/${application.applicantId}`}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <User className="w-3 h-3" />
              View Profile
            </Link>
          )}
        </div>
      )}

      {application.coverLetter && (
        <p className="text-sm text-gray-500 italic mb-3 line-clamp-2">
          &ldquo;{application.coverLetter}&rdquo;
        </p>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <span className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
        </span>
        <div className="flex items-center gap-2">
          {showScheduleInterview && onScheduleInterview && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onScheduleInterview(application)}
              className="text-xs"
            >
              <CalendarPlus className="w-3 h-3 mr-1" />
              Schedule Interview
            </Button>
          )}
          {onStatusChange && (
            <div className="w-40">
              <Select
                options={STATUS_OPTIONS}
                value={application.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdating}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
