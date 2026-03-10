'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { JobForm } from '@/components/jobs/JobForm';
import { Spinner } from '@/components/ui/Spinner';
import { useJob } from '@/hooks/useJobs';
import api, { getApiErrorMessage } from '@/lib/api';
import type { CreateJobForm } from '@/types';

interface EditJobPageProps {
  params: { id: string };
}

export default function EditJobPage({ params }: EditJobPageProps) {
  const { id } = params;
  const router = useRouter();
  const { job, isLoading, error } = useJob(id);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateJobForm) => {
    setSaving(true);
    setSaveError(null);
    try {
      await api.put(`/jobs/${id}`, data);
      router.push('/dashboard/recruiter/jobs');
    } catch (err) {
      setSaveError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (error || !job) return <div className="text-center py-8 text-red-500">{error ?? 'Job not found'}</div>;

  return (
    <div className="max-w-2xl space-y-5">
      <Link href="/dashboard/recruiter/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary">
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
        <p className="text-gray-500 text-sm">{job.title}</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {saveError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{saveError}</div>}
        <JobForm defaultValues={job} onSubmit={handleSubmit} isLoading={saving} submitLabel="Save Changes" />
      </div>
    </div>
  );
}
