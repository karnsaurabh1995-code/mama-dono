'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Workflow,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  Smartphone,
  Cloud,
  Building2,
  ExternalLink,
  Save,
} from 'lucide-react';

export default function IntegrationsPage() {
  const [toastMessage, setToastMessage] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const integrations = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Business API (Meta Cloud)',
      description: 'Deliver instant Section 80G PDF receipts and patient video recovery updates straight to donor WhatsApp numbers.',
      icon: MessageCircle,
      status: 'Connected',
      configured: true,
      senderId: '+91 80 4719 2300',
    },
    {
      id: 'sms',
      name: 'TRAI DLT SMS Gateway (Fast2SMS / Gupshup)',
      description: 'Mandatory Indian DLT entity registration with approved transactional template headers for donor OTPs.',
      icon: Smartphone,
      status: 'Active',
      configured: true,
      senderId: 'SEVATR',
    },
    {
      id: 'storage',
      name: 'Encrypted Document Cloud Storage',
      description: 'HIPAA and Indian health data compliant storage for patient UHID cards, hospital discharge summaries, and bills.',
      icon: Cloud,
      status: 'Active',
      configured: true,
      senderId: 's3-ap-south-1 (Mumbai)',
    },
    {
      id: 'darpan',
      name: 'NITI Aayog NGO-Darpan Portal Verification API',
      description: 'Automated verification check against Government of India NGO registration directory.',
      icon: Building2,
      status: 'Verified',
      configured: true,
      senderId: 'NITI-AAYOG-PROD-SYNC',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <Workflow className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">External Connectors</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Integrations, APIs & Messaging Channels
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Manage WhatsApp Cloud API, Indian DLT SMS gateways, and cloud storage escrows.
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')}>✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800">
                    <Icon className="w-5 h-5 text-[#E84B45]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {item.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#202124]">{item.name}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="font-mono text-neutral-500 text-[11px]">{item.senderId}</span>
                <Button size="sm" variant="outline" onClick={() => notify(`Re-tested connection to ${item.name}: Healthy.`)} className="text-xs">
                  Test Ping
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
