'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('donation_support');
  const [message, setMessage] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedTicket(ticketId);
  };

  return (
    <div className="py-12 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Contact & Support</span>
        </nav>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-[#202124] tracking-tight">
            We’re Here to Help You
          </h1>
          <p className="text-sm text-[#555B63] max-w-xl">
            Have questions regarding your 80G tax receipt, setting up an emergency medical fundraiser, or partner NGO verification? Reach out to our dedicated support desk.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-7 shadow-xs space-y-6">
              <h3 className="text-base font-bold text-[#202124]">Direct Channels</h3>

              <div className="space-y-4 text-xs text-[#555B63]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FFF0EF] text-[#E84B45] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-[#202124]">Helpline (Donor & Patient Care)</strong>
                    <span>+91 80 4719 2300</span>
                    <span className="block text-[11px] text-neutral-400">Monday to Saturday: 9:00 AM – 7:00 PM IST</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#25845B] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-[#202124]">Email Inquiries</strong>
                    <span>support@sevasetu.org.in</span>
                    <span className="block text-[11px] text-neutral-400">Average response time: 2 business hours</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-[#202124]">Registered Foundation Address</strong>
                    <span>SevaSetu Foundation, 4th Floor, Barakhamba Road, Connaught Place, New Delhi - 110001, India</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Urgent ICU / Emergency Medical Verification?</span>
              </div>
              <p>
                Treating doctors and hospital patient welfare managers can flag critical ICU admissions for priority 4-hour document verification by calling directly.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            {submittedTicket ? (
              <div className="bg-white rounded-3xl border border-[#E8E6E1] p-8 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#25845B] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#202124]">Support Ticket Generated</h3>
                <p className="text-xs text-[#555B63] max-w-sm mx-auto">
                  Your inquiry has been routed to our donor care team with reference ticket <strong>{submittedTicket}</strong>. We will reply to {email} shortly.
                </p>
                <Button variant="outline" size="sm" onClick={() => setSubmittedTicket(null)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-[#202124]">Send Us a Message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-xs font-semibold text-[#202124] mb-1">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Anand Sen"
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
                      placeholder="e.g. anand@example.com"
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
                      Query Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                    >
                      <option value="donation_support">Donation & Payment Query</option>
                      <option value="tax_80g">Section 80G / Form 10BE Receipt</option>
                      <option value="start_fundraiser">Starting a Medical Fundraiser</option>
                      <option value="ngo_verification">NGO Darpan Verification</option>
                      <option value="monthly_cancel">Monthly Giving Management</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your query or transaction details..."
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl p-3 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full font-bold">
                  Submit Support Ticket
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
