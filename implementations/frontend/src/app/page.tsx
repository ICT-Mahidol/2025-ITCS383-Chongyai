import Link from 'next/link';
import { Search, Briefcase, Shield, Video, ArrowRight, CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight">
            Find Your{' '}
            <span className="text-yellow-200 underline decoration-wavy decoration-yellow-300">
              Dream Job
            </span>
          </h1>
          <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
            Connect with top employers in Thailand. Whether you&apos;re a fresh graduate or a seasoned professional, your next opportunity is here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-white text-primary hover:bg-orange-50 font-bold px-8 py-4 rounded-2xl text-lg transition-colors inline-flex items-center gap-2 shadow-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard/applicant/jobs"
              className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold px-8 py-4 rounded-2xl text-lg transition-colors inline-flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Browse Jobs
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-white/10 backdrop-blur-sm border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-3 gap-6 text-center">
            {[
              { value: '1,000+', label: 'Active Jobs' },
              { value: '500+', label: 'Companies' },
              { value: '10,000+', label: 'Hired This Year' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-extrabold text-white">{value}</p>
                <p className="text-orange-100 text-sm mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Everything You Need</h2>
            <p className="text-gray-500 mt-3">A complete platform for job seekers and employers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: 'Smart Job Matching',
                description: 'Our AI-powered recommendation engine matches jobs to your skills and preferences automatically.',
                color: 'text-primary',
                bg: 'bg-orange-50',
              },
              {
                icon: Shield,
                title: 'Verified Profiles',
                description: 'Identity verification through MOI API ensures a safe and trusted environment for all users.',
                color: 'text-green-600',
                bg: 'bg-green-50',
              },
              {
                icon: Video,
                title: 'Video Interviews',
                description: 'Built-in video conferencing lets you conduct interviews without leaving the platform.',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
            ].map(({ icon: Icon, title, description, color, bg }) => (
              <div key={title} className="bg-gray-50 rounded-2xl p-7 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-5`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="text-gray-500 mt-3">Get started in minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Create Account', desc: 'Register as a job seeker or employer' },
              { step: '2', title: 'Complete Profile', desc: 'Add your skills and experience' },
              { step: '3', title: 'Get Verified', desc: 'Verify your identity with Thai Citizen ID' },
              { step: '4', title: 'Apply & Get Hired', desc: 'Apply to jobs and start your career' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 bg-primary text-white text-xl font-extrabold rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
                  {step}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-10">Join thousands of professionals and companies already on Chongyai</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-2xl text-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              <Briefcase className="w-5 h-5" />
              I&apos;m a Job Seeker
            </Link>
            <Link
              href="/auth/register"
              className="bg-accent hover:bg-accent-dark text-white font-bold px-8 py-4 rounded-2xl text-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              I&apos;m an Employer
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
            {['Free to browse', 'Verified companies', '24/7 support'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
