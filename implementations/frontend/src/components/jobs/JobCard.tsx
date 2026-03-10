'use client';

import Link from 'next/link';
import { MapPin, Eye, Building2, Banknote } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { JobTypeBadge } from '@/components/ui/Badge';
import type { Job } from '@/types';

interface JobCardProps {
  job: Job;
  href?: string;
}

export function JobCard({ job, href }: JobCardProps) {
  const companyName = job.recruiter?.recruiterProfile?.companyName ?? 'Unknown Company';
  const cardHref = href ?? `/dashboard/applicant/jobs/${job.id}`;

  return (
    <Link href={cardHref} className="block group">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary to-accent" />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
                {job.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-sm">
                <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{companyName}</span>
              </div>
            </div>
            <JobTypeBadge type={job.jobType} />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.location}
            </div>
            {(job.salaryMin ?? job.salaryMax) && (
              <div className="flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5" />
                {job.salaryMin && job.salaryMax
                  ? `฿${job.salaryMin.toLocaleString()}–฿${job.salaryMax.toLocaleString()}`
                  : job.salaryMin
                  ? `From ฿${job.salaryMin.toLocaleString()}`
                  : `Up to ฿${job.salaryMax?.toLocaleString()}`}
              </div>
            )}
          </div>

          {job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {job.skills.slice(0, 4).map((skill) => (
                <span key={skill} className="bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {skill}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="text-xs text-gray-400">+{job.skills.length - 4} more</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-50">
            <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {job.viewCount}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
