import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface AuthFeedbackProps {
  type: 'error' | 'success' | 'info';
  message: string;
  className?: string;
}

export function AuthFeedback({ type, message, className = '' }: AuthFeedbackProps) {
  if (!message) return null;

  if (type === 'error') {
    return (
      <div
        role="alert"
        className={`flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs animate-in fade-in ${className}`}
      >
        <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
        <span className="leading-relaxed">{message}</span>
      </div>
    );
  }

  if (type === 'success') {
    return (
      <div
        role="status"
        className={`flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs animate-in fade-in ${className}`}
      >
        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
        <span className="leading-relaxed">{message}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      className={`flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs animate-in fade-in ${className}`}
    >
      <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}
