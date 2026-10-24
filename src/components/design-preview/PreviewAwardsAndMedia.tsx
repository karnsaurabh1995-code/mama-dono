import React from 'react';
import { Award, ShieldCheck, FileCheck, Building2, Lock } from 'lucide-react';

export function PreviewAwardsAndMedia() {
  const credentials = [
    {
      icon: Building2,
      title: 'NITI Aayog NGO-Darpan',
      desc: 'Active accreditation & reporting on the Government of India portal.',
      tag: 'Govt. Accredited',
    },
    {
      icon: FileCheck,
      title: 'Section 80G & 12A Certified',
      desc: 'Immediate Form 10BE compliant tax exemption certificate for donors.',
      tag: '50% Tax Relief',
    },
    {
      icon: Award,
      title: 'MCA & CSR-1 Registered',
      desc: 'Ministry of Corporate Affairs compliant for certified CSR partnerships.',
      tag: 'MCA Verified',
    },
    {
      icon: Lock,
      title: 'ISO 27001 & 256-Bit SSL',
      desc: 'Bank-grade encryption protecting transaction ledgers and donor privacy.',
      tag: 'Bank Encrypted',
    },
  ];

  const mediaOutlets = [
    { name: 'The Times of India', quote: 'Pioneering item-level transparency in Indian crowdfunding' },
    { name: 'The Hindu', quote: 'Connecting verified medical emergencies with zero platform fee' },
    { name: 'The Economic Times', quote: 'A trusted bridge for philanthropic capital & CSR governance' },
    { name: 'NDTV India', quote: 'Speeding emergency surgical interventions for underprivileged children' },
    { name: 'The Indian Express', quote: 'Transforming grassroots social giving with digital receipts' },
  ];

  return (
    <section
      data-component="PreviewAwardsAndMedia"
      className="py-20 bg-white border-b border-[#E8E6E1]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Subsection 1: Awards & Recognition */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#EF4949] bg-[#FFF0EF] px-3.5 py-1.5 rounded-full inline-block mb-2 border border-[#FEE2E2]">
              GOVERNANCE & TRUST
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#202124] tracking-tight">
              Institutional Credentials & Legal Compliance
            </h2>
            <p className="text-xs sm:text-sm text-[#555B63] mt-2">
              Every fundraising operation on dokind follows strict statutory verification protocols established by Indian regulatory authorities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {credentials.map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-[#FAF9F6] border border-[#E8E6E1] hover:border-neutral-300 transition shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E6E1] text-[#EF4949] flex items-center justify-center shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-white px-2 py-0.5 rounded-md border border-[#E8E6E1]">
                      {c.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#202124]">{c.title}</h3>
                    <p className="text-xs text-[#555B63] mt-1 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subsection 2: Featured In Media */}
        <div className="pt-8 border-t border-[#E8E6E1]">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-400">
              FEATURED IN NATIONAL MEDIA
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {mediaOutlets.map((m, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] text-center flex flex-col justify-center items-center gap-1.5 hover:bg-neutral-100/70 transition"
              >
                <div className="font-serif font-black text-xs sm:text-sm text-[#202124] tracking-tight">
                  {m.name}
                </div>
                <div className="text-[10px] text-neutral-500 line-clamp-2 italic">
                  &ldquo;{m.quote}&rdquo;
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
