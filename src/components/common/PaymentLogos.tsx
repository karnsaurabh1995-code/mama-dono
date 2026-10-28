import React from 'react';

export function UpiLogo({ className = 'h-5 w-auto shrink-0' }: { className?: string }) {
  return (
    <svg viewBox="0 0 58 22" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="UPI">
      <path d="M11 2.5L4 19H8.5L13.5 7L11 2.5Z" fill="#097939" />
      <path d="M15 2.5L8 19H12.5L19.5 2.5H15Z" fill="#F37021" />
      <path d="M23.5 3.5v9.8c0 2.4 1.7 4 4.3 4s4.3-1.6 4.3-4V3.5h-3.4v9.6c0 .9-.7 1.5-1.8 1.5s-1.8-.6-1.8-1.5V3.5h-1.6Z" fill="#1B1C1E" />
      <path d="M34.5 3.5v13.8h2.4V12.7h3.3c3 0 4.9-1.7 4.9-4.5s-1.9-4.7-4.9-4.7h-5.7Zm2.4 2.6h3.1c1.7 0 2.6.7 2.6 1.9s-.9 1.9-2.6 1.9h-3.1V6.1Z" fill="#1B1C1E" />
      <path d="M47.2 3.5v13.8h2.5V3.5h-2.5Z" fill="#1B1C1E" />
    </svg>
  );
}

export function GPayLogo({ className = 'h-5 w-auto shrink-0' }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 22" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Google Pay">
      {/* Google G */}
      <g transform="translate(1, 2)">
        <path
          d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z"
          fill="#4285F4"
        />
        <path
          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.94v2.33C2.42 15.98 5.48 18 9 18Z"
          fill="#34A853"
        />
        <path
          d="M3.97 10.71A5.4 5.4 0 0 1 3.69 9c0-.59.1-1.17.28-1.71V4.96H.94A8.99 8.99 0 0 0 0 9c0 1.45.35 2.82.94 4.04l3.03-2.33Z"
          fill="#FBBC05"
        />
        <path
          d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.88 11.43 0 9 0 5.48 0 2.42 2.02.94 4.96l3.03 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
          fill="#EA4335"
        />
      </g>
      {/* Pay text */}
      <path
        d="M24.5 5.5h4.2c2.4 0 4 1.5 4 3.6s-1.6 3.6-4 3.6h-2.2v4.3h-2V5.5Zm2 5.5h2.2c1.3 0 2.2-.8 2.2-1.9s-.9-1.9-2.2-1.9h-2.2V11Z"
        fill="#5F6368"
      />
      <path
        d="M38.5 8.7c1.7 0 3 .8 3.6 2.1V8.9H44v8.1h-1.9v-1.2c-.6 1-1.9 1.4-3.6 1.4-2.5 0-4.2-1.8-4.2-4.2s1.7-4.3 4.2-4.3Zm.2 6.8c1.5 0 2.5-1.1 2.5-2.5s-1-2.5-2.5-2.5-2.5 1.1-2.5 2.5 1 2.5 2.5 2.5Z"
        fill="#5F6368"
      />
      <path
        d="M45.5 8.9h2.1l2.8 6.7 2.7-6.7h2.1l-4 9.4-2.1 4.7h-2.1l1.6-3.6-3.1-10.5Z"
        fill="#5F6368"
      />
    </svg>
  );
}

export function PhonePeLogo({ className = 'h-5 w-auto shrink-0' }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="PhonePe">
      {/* PhonePe Purple Circle Badge */}
      <circle cx="12" cy="12" r="11" fill="#5F259F" />
      {/* Crisp White Devanagari Pe inside */}
      <path
        d="M7.5 7h9M14 7v10M7.5 7v4.8c0 1.5 1.2 2.6 2.7 2.6H14M14 7 10 3"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* PhonePe Text */}
      <text
        x="27"
        y="16.5"
        fill="#5F259F"
        fontSize="12.5"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="-0.3px"
      >
        Phone<tspan fill="#1B1C1E">Pe</tspan>
      </text>
    </svg>
  );
}

export function VisaLogo({ className = 'h-4 w-auto shrink-0' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Visa">
      <path d="M18.8 1.2L14.2 14.8H10.1L6.6 4.2C6.4 3.4 6.2 3.1 5.5 2.7C4.1 2 2 1.4 0.2 1L0.4 0.2H8.5C9.6 0.2 10.5 0.9 10.7 2.1L12.5 11.5L16.8 1.2H18.8Z" fill="#1434CB" />
      <path d="M22.1 14.8L19 1.2H22.9L26 14.8H22.1Z" fill="#1434CB" />
      <path d="M34 10.2c0-3.9-5.4-4.1-5.4-5.8 0-.6.5-1.2 1.7-1.4.6-.1 2.2-.2 3.8.6l.7-3C33.8.2 32.6 0 31.1 0 27.4 0 24.8 2 24.8 4.9c0 4.2 5.8 4.4 5.8 6.7 0 .7-.7 1.3-2 1.3-1.5 0-3.4-.7-4.3-1.2l-.7 3c1.1.5 3.1.9 5.1.9 4 0 5.3-2.3 5.3-5.4Z" fill="#1434CB" />
      <path d="M43 14.8h3.6L43.4 1.2h-3.2c-.9 0-1.7.5-2 1.3L32.7 14.8h4.1l.8-2.2h4.9l.5 2.2Zm-4.3-5.2l2.1-5.7 1.2 5.7h-3.3Z" fill="#1434CB" />
    </svg>
  );
}

export function MastercardLogo({ className = 'h-5 w-auto shrink-0' }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 22" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Mastercard">
      <circle cx="12" cy="11" r="9" fill="#EB001B" />
      <circle cx="24" cy="11" r="9" fill="#F79E1B" />
      <path d="M18 4.35A9 9 0 0 0 18 17.65A9 9 0 0 0 18 4.35Z" fill="#FF5F00" />
    </svg>
  );
}

export function RupayLogo({ className = 'h-4 w-auto shrink-0' }: { className?: string }) {
  return (
    <svg viewBox="0 0 62 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="RuPay">
      {/* Ru */}
      <path d="M3 2H9.5C11.8 2 13.5 3.2 13.5 5.5C13.5 7.4 12.2 8.7 10.3 9L14 16H10.5L7.2 9.6H5.8V16H3V2ZM5.8 4.4V7.4H9.3C10.2 7.4 10.8 6.8 10.8 5.9C10.8 5 10.2 4.4 9.3 4.4H5.8Z" fill="#0C2340" />
      <path d="M15.5 6.8H18.2V16H15.5V6.8ZM15.5 3.5H18.2V5.5H15.5V3.5Z" fill="#0C2340" />
      {/* Chevrons */}
      <path d="M23 2L19 16H23.5L27.5 2H23Z" fill="#00A3E0" />
      <path d="M29 2L25 16H29.5L33.5 2H29Z" fill="#F37021" />
      {/* Pay */}
      <path d="M35.5 2H40.5C42.8 2 44.2 3.4 44.2 5.5C44.2 7.6 42.8 9 40.5 9H38.2V16H35.5V2ZM38.2 4.2V6.8H40.3C41.2 6.8 41.7 6.3 41.7 5.5C41.7 4.7 41.2 4.2 40.3 4.2H38.2Z" fill="#0C2340" />
      <path d="M47.8 6.5C49.8 6.5 51.2 7.6 51.5 9.2H49.1C48.9 8.5 48.4 8.1 47.6 8.1C46.5 8.1 45.8 8.9 45.8 10.1C45.8 11.3 46.5 12.1 47.6 12.1C48.4 12.1 48.9 11.7 49.1 11H51.5C51.2 12.6 49.8 13.7 47.8 13.7C45 13.7 43.1 11.9 43.1 10.1C43.1 8.3 45 6.5 47.8 6.5Z" fill="#0C2340" />
      <path d="M53 6.8H55.5L58 13.2L60.5 6.8H63L59.2 16.5L56.8 21H54.2L55.8 17.5L53 6.8Z" fill="#0C2340" />
    </svg>
  );
}

export function PaymentLogosRow({ className = '' }: { className?: string }) {
  const logos = [
    { id: 'upi', name: 'UPI', component: <UpiLogo className="h-4.5 w-auto shrink-0" /> },
    { id: 'gpay', name: 'Google Pay', component: <GPayLogo className="h-4.5 w-auto shrink-0" /> },
    { id: 'phonepe', name: 'PhonePe', component: <PhonePeLogo className="h-4.5 w-auto shrink-0" /> },
    { id: 'visa', name: 'Visa', component: <VisaLogo className="h-3.5 w-auto shrink-0" /> },
    { id: 'mastercard', name: 'Mastercard', component: <MastercardLogo className="h-4.5 w-auto shrink-0" /> },
    { id: 'rupay', name: 'RuPay', component: <RupayLogo className="h-4 w-auto shrink-0" /> },
  ];

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {logos.map((logo) => (
        <div
          key={logo.id}
          className="h-8 min-w-[52px] px-2.5 py-1 bg-white rounded-md flex items-center justify-center shadow-2xs border border-white/10 hover:brightness-105 transition-all select-none shrink-0"
          title={logo.name}
          aria-label={logo.name}
        >
          {logo.component}
        </div>
      ))}
    </div>
  );
}
