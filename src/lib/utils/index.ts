import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number into the Indian numbering system (e.g., ₹1,50,000)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format compact numbers for India (e.g., ₹1.5 L, ₹2 Cr)
 */
export function formatINRCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}k`;
  }
  return `₹${amount}`;
}

/**
 * Calculate funding percentage safely
 */
export function calculatePercentage(raised: number, goal: number): number {
  if (!goal || goal <= 0) return 0;
  const pct = Math.round((raised / goal) * 100);
  return pct;
}

/**
 * Format dates in Indian English format (e.g., 24 Oct 2026)
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Format relative time (e.g. 5 minutes ago)
 */
export function formatTimeAgo(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateString);
}

/**
 * Validate Indian PAN format (5 letters, 4 digits, 1 letter)
 */
export function isValidPAN(pan: string): boolean {
  if (!pan) return false;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.trim().toUpperCase());
}

/**
 * Generate 80G tax receipt number
 */
export function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `SEVA-80G-${year}-${randomPart}`;
}

/**
 * Mask email or phone for privacy
 */
export function maskContact(contact: string): string {
  if (!contact) return '';
  if (contact.includes('@')) {
    const [user, domain] = contact.split('@');
    if (user.length <= 2) return `${user}***@${domain}`;
    return `${user.slice(0, 2)}***${user.slice(-1)}@${domain}`;
  }
  if (contact.length >= 10) {
    return `${contact.slice(0, 2)}******${contact.slice(-2)}`;
  }
  return '******';
}


/**
 * Validates and sanitizes a return URL to prevent open redirect vulnerabilities.
 * Only allows relative paths on the same origin (starting with a single '/').
 */
export function getSafeReturnUrl(rawUrl: string | null | undefined, defaultUrl = '/admin'): string {
  if (!rawUrl || typeof rawUrl !== 'string') return defaultUrl;
  const trimmed = rawUrl.trim();
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/\\') ||
    trimmed.includes(':')
  ) {
    return defaultUrl;
  }
  return trimmed;
}
