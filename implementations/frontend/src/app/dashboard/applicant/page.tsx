'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Bookmark, CalendarDays, Search, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { JobCard } from '@/components/jobs/JobCard';
import { ApplicationStatusBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import api, { getApiErrorMessage } from '@/lib/api';
import type { Application, Job, PaginatedResponse, ApiResponse } from '@/types';

export default function ApplicantDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendations, setRecommendations] = useState<Job[]>([]);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, bookmarksRes] = await Promise.all([
          api.get<PaginatedResponse<Application>>('/applications/mine?limit=5'),
          api.get<PaginatedResponse<{ id: string }>>('/bookmarks?limit=1'),
        ]);
        setApplications(appsRes.data.data);
        setBookmarkCount(appsRes.data.pagination.total);
        setBookmarkCount(bookmarksRes.data.pagination.total);

        if (user?.isPaid) {
          const recRes = await api.get<ApiResponse<Job[]>>('/recommendations');
          setRecommendations(recRes.data.data.slice(0, 3));
        }
      } catch {
        // continue with partial data
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s your job search overview</p>
      </div>

      {/* Alerts */}
      {!user?.isPaid && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-orange-800">Payment Required</p>
            <p className="text-sm text-orange-600">Pay the 500 THB registration fee to unlock job applications and recommendations.</p>
          </div>
          <Link href="/dashboard/applicant/profile">
            <Button size="sm" variant="secondary">Pay Now</Button>
          </Link>
        </div>
      )}

      {!user?.isVerified && user?.isPaid && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-yellow-800">Verify Your Identity</p>
            <p className="text-sm text-yellow-600">Verify your Thai Citizen ID to boost your profile credibility.</p>
          </div>
          <Link href="/dashboard/applicant/profile">
            <Button size="sm" variant="outline">Verify Now</Button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Applications" value={applications.length} icon={FileText} color="orange" />
        <StatsCard title="Saved Jobs" value={bookmarkCount} icon={Bookmark} color="yellow" />
        <StatsCard
          title="Interviews"
          value={applications.filter((a) => a.status === 'INTERVIEWING').length}
          icon={CalendarDays}
          color="blue"
        />
        <StatsCard
          title="Accepted"
          value={applications.filter((a) => a.status === 'ACCEPTED').length}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Recent Applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Recent Applications</h2>
          <Link href="/dashboard/applicant/applications" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-gray-400 text-sm">No applications yet.</p>
            <Link href="/dashboard/applicant/jobs">
              <Button className="mt-3" size="sm">
                <Search className="w-3.5 h-3.5" />
                Browse Jobs
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{app.job?.title}</p>
                  <p className="text-xs text-gray-400">{app.job?.location}</p>
                </div>
                <ApplicationStatusBadge status={app.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recommended For You</h2>
            <Link href="/dashboard/applicant/jobs" className="text-sm text-primary hover:underline">Browse all</Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {recommendations.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        </div>
      )}
    </div>
  );
}
