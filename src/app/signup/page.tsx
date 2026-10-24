'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/Button';
import { DokindLogo } from '@/components/common/DokindLogo';
import { Heart, Lock, Mail, User, Phone, CheckCircle2 } from 'lucide-react';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pan, setPan] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'donor' | 'fundraiser'>('donor');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Name and Email are required.');
      return;
    }
    login(email, role);
    if (role === 'fundraiser') {
      router.push('/start-campaign');
    } else {
      router.push('/account');
    }
  };

  return (
    <div className="py-12 bg-[#FAF9F6] min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center group mb-1">
            <DokindLogo size="lg" />
          </Link>
          <h1 className="text-2xl font-bold text-[#202124]">Create Your Account</h1>
          <p className="text-xs text-[#555B63]">
            Join over 18,000+ compassionate donors and verified fundraisers across India.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-7 shadow-xs space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4 text-xs">
            {/* Account Role Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1]">
              <button
                type="button"
                onClick={() => setRole('donor')}
                className={`py-2 text-center rounded-lg font-semibold transition-colors cursor-pointer ${
                  role === 'donor'
                    ? 'bg-white shadow-xs text-[#E84B45]'
                    : 'text-[#555B63] hover:text-[#202124]'
                }`}
              >
                I want to Donate
              </button>
              <button
                type="button"
                onClick={() => setRole('fundraiser')}
                className={`py-2 text-center rounded-lg font-semibold transition-colors cursor-pointer ${
                  role === 'fundraiser'
                    ? 'bg-white shadow-xs text-[#E84B45]'
                    : 'text-[#555B63] hover:text-[#202124]'
                }`}
              >
                I want to Raise Funds
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Radhika Sharma"
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. radhika@example.com"
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full font-bold">
              Create My Account
            </Button>
          </form>

          <div className="text-center text-xs text-[#555B63]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#E84B45] font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
