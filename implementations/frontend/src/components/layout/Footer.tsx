import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Chongyai</span>
            </div>
            <p className="text-sm text-gray-400">
              Thailand&apos;s modern job center connecting talented professionals with great companies.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">For Job Seekers</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/register" className="hover:text-primary transition-colors">Create Account</Link></li>
              <li><Link href="/dashboard/applicant/jobs" className="hover:text-primary transition-colors">Browse Jobs</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">For Employers</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/register" className="hover:text-primary transition-colors">Post a Job</Link></li>
              <li><Link href="/auth/login" className="hover:text-primary transition-colors">Recruiter Login</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Chongyai Job Center. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
