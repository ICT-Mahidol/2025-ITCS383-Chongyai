'use client';

import { useState, useCallback } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { SearchFilters, JobType } from '@/types';

const JOB_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'REMOTE', label: 'Remote' },
];

interface JobFilterProps {
  onFilterChange: (filters: SearchFilters) => void;
}

export function JobFilter({ onFilterChange }: JobFilterProps) {
  const [q, setQ] = useState('');
  const [jobType, setJobType] = useState<JobType | ''>('');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');

  const handleSearch = useCallback(() => {
    onFilterChange({
      q: q || undefined,
      jobType: (jobType as JobType) || undefined,
      location: location || undefined,
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
    });
  }, [q, jobType, location, salaryMin, salaryMax, onFilterChange]);

  const handleReset = () => {
    setQ('');
    setJobType('');
    setLocation('');
    setSalaryMin('');
    setSalaryMax('');
    onFilterChange({});
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-gray-700 text-sm">Filter Jobs</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search jobs..."
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        <Select
          options={JOB_TYPE_OPTIONS}
          placeholder="All types"
          value={jobType}
          onChange={(e) => setJobType(e.target.value as JobType | '')}
        />

        <Input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min ฿"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          <input
            type="number"
            placeholder="Max ฿"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSearch} size="sm">
          <Search className="w-3.5 h-3.5" />
          Search
        </Button>
        <Button onClick={handleReset} variant="ghost" size="sm">
          Reset
        </Button>
      </div>
    </div>
  );
}
