'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { JobForm } from '@/components/jobs/JobForm';
import { useMyJobs } from '@/hooks/useJobs';
import type { CreateJobForm } from '@/types';

export default function NewJobPage() {
  const router = useRouter();
  const { createJob } = useMyJobs();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateJobForm) => {
    setIsLoading(true);
    setError(null);
    try {
      await createJob(data);
      router.push('/dashboard/recruiter/jobs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <Link href="/dashboard/recruiter/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary">
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-gray-500 text-sm">Fill in the details to attract the right candidates</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
        <JobForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
