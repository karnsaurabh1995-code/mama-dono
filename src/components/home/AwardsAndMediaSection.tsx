import React from 'react';

export function AwardsAndMediaSection() {
  const mediaOutlets = [
    { name: 'The Times of India', quote: 'Pioneering item-level transparency in Indian crowdfunding' },
    { name: 'The Hindu', quote: 'Connecting verified medical emergencies with zero platform fee' },
    { name: 'The Economic Times', quote: 'A trusted bridge for philanthropic capital & CSR governance' },
    { name: 'NDTV India', quote: 'Speeding emergency surgical interventions for underprivileged children' },
    { name: 'The Indian Express', quote: 'Transforming grassroots social giving with digital receipts' },
  ];

  return (
    <section className="py-16 bg-[#FAF9F6] border-b border-[#E8E6E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#EF4949] bg-[#FFF0EF] px-3.5 py-1 rounded-full border border-red-100 inline-block mb-2">
            TRUST & RECOGNITION
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight">
            Featured In National Media
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {mediaOutlets.map((m, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-[#E8E6E1] text-center flex flex-col justify-center items-center gap-1.5 hover:border-neutral-300 transition shadow-2xs"
            >
              <div className="font-serif font-black text-xs sm:text-sm text-[#202124] tracking-tight">
                {m.name}
              </div>
              <div className="text-[11px] text-neutral-500 line-clamp-2 italic">
                &ldquo;{m.quote}&rdquo;
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
