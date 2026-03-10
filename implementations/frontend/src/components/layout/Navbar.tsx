'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Briefcase, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getDashboardPath } from '@/lib/auth';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dashboardPath = user ? getDashboardPath(user.role) : '/dashboard/applicant';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">Chongyai</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">
              Home
            </Link>
            <Link href="/dashboard/applicant/jobs" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">
              Find Jobs
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link href={dashboardPath} className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">
                  Dashboard
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-xl transition-colors"
                  >
                    <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.firstName}</span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">{user.role}</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { router.push(`${dashboardPath}/profile`); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-primary transition-colors"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login" className="text-gray-700 hover:text-primary text-sm font-medium transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          <Link href="/" className="block py-2 text-gray-700 hover:text-primary">Home</Link>
          <Link href="/dashboard/applicant/jobs" className="block py-2 text-gray-700 hover:text-primary">Find Jobs</Link>
          {user ? (
            <>
              <Link href={dashboardPath} className="block py-2 text-gray-700 hover:text-primary">Dashboard</Link>
              <button onClick={logout} className="block w-full text-left py-2 text-red-600">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="block py-2 text-gray-700">Sign In</Link>
              <Link href="/auth/register" className="block py-2 text-primary font-semibold">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
