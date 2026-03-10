'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Briefcase, Users, CalendarDays, Plus, Eye, ChevronRight } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ApplicationCard } from '@/components/applications/ApplicationCard';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { JobTypeBadge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import type { Application, Job, PaginatedResponse } from '@/types';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobsRes = await api.get<PaginatedResponse<Job>>('/jobs/recruiter/mine?limit=5');
        setJobs(jobsRes.data.data);
        const totalApps: Application[] = [];
        for (const job of jobsRes.data.data.slice(0, 3)) {
          const appsRes = await api.get<PaginatedResponse<Application>>(`/applications/job/${job.id}?limit=3`);
          totalApps.push(...appsRes.data.data);
        }
        setRecentApps(totalApps.slice(0, 5));
      } catch {
        // partial data
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  const activeJobs = jobs.filter((j) => j.isActive).length;
  const totalApps = jobs.reduce((sum, j) => sum + (j._count?.applications ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.firstName}!</h1>
          <p className="text-gray-500 text-sm mt-1">{user?.recruiterProfile?.companyName ?? 'Your Company'}</p>
        </div>
        <Link href="/dashboard/recruiter/jobs/new">
          <Button size="sm">
            <Plus className="w-4 h-4" />
            Post a Job
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatsCard title="Active Jobs" value={activeJobs} icon={Briefcase} color="orange" />
        <StatsCard title="Total Applications" value={totalApps} icon={Users} color="blue" />
        <StatsCard
          title="Interviewing"
          value={recentApps.filter((a) => a.status === 'INTERVIEWING').length}
          icon={CalendarDays}
          color="yellow"
        />
      </div>

      {/* Recent Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Your Jobs</h2>
          <Link href="/dashboard/recruiter/jobs" className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <p>No jobs posted yet.</p>
            <Link href="/dashboard/recruiter/jobs/new">
              <Button className="mt-3" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Post First Job
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {jobs.slice(0, 5).map((job) => (
              <Link 
                key={job.id} 
                href={`/dashboard/recruiter/jobs/${job.id}/applications`}
                className="block bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <JobTypeBadge type={job.jobType} />
                      {!job.isActive && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{job.location}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {job._count?.applications ?? 0} applications •{' '}
                      {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 group-hover:text-primary transition-colors">
                    <span className="text-sm hidden sm:inline">View Applicants</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            ))}
            {jobs.length > 5 && (
              <Link 
                href="/dashboard/recruiter/jobs"
                className="text-center py-3 text-sm text-primary hover:underline"
              >
                View {jobs.length - 5} more jobs
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Recent Applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Recent Applications</h2>
        </div>
        {recentApps.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-white rounded-2xl border border-gray-100">
            No applications yet. Post a job to get started!
          </div>
        ) : (
          <div className="grid gap-3">
            {recentApps.map((app) => (
              <ApplicationCard 
                key={app.id} 
                application={app} 
                showApplicant 
                showViewProfile
                showScheduleInterview
                onScheduleInterview={(application) => {
                  window.location.href = `/dashboard/recruiter/applicants/${application.applicantId}?scheduleInterview=true&applicationId=${application.id}`;
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
