'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import api, { getApiErrorMessage } from '@/lib/api';

export default function RecruiterProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone ?? '',
    companyName: user?.recruiterProfile?.companyName ?? '',
    companyDescription: user?.recruiterProfile?.companyDescription ?? '',
    website: user?.recruiterProfile?.website ?? '',
    industry: user?.recruiterProfile?.industry ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await api.put('/users/profile', form);
      setMsg('Profile saved successfully');
    } catch (err) {
      setMsg(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
        <p className="text-gray-500 text-sm">Manage your recruiter and company information</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-bold text-gray-800">Personal Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
          <Input label="Last Name" value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
        </div>
        <Input label="Phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-bold text-gray-800">Company Info</h2>
        <Input label="Company Name" value={form.companyName} onChange={(e) => handleChange('companyName', e.target.value)} />
        <div className="flex flex-col gap-1">
          <label htmlFor="company-description" className="text-sm font-medium text-gray-700">Company Description</label>
          <textarea
            id="company-description"
            rows={3}
            value={form.companyDescription}
            onChange={(e) => handleChange('companyDescription', e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Input label="Website" placeholder="https://..." value={form.website} onChange={(e) => handleChange('website', e.target.value)} />
        <Input label="Industry" value={form.industry} onChange={(e) => handleChange('industry', e.target.value)} />
      </div>

      {msg && <p className="text-sm text-green-600">{msg}</p>}
      <Button onClick={handleSave} isLoading={saving}>Save Profile</Button>
    </div>
  );
}
