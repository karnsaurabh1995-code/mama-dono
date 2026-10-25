/**
 * DOKIND PHONE NUMBER NORMALIZATION & VALIDATION UTILITY
 *
 * Provides canonical E.164 normalization, India (+91) primary validation,
 * MSG91 mobile number formatting (digits only with country code, no + prefix),
 * and privacy-preserving masking for UI/logs.
 */

export interface NormalizedPhone {
  isValid: boolean;
  e164: string;           // e.g. "+919876543210"
  countryCode: string;    // e.g. "91"
  nationalNumber: string; // e.g. "9876543210"
  msg91Mobile: string;    // e.g. "919876543210" (MSG91 v5 format: country code + national digits)
  formatted: string;      // e.g. "+91 98765 43210"
  masked: string;         // e.g. "+91 98••• ••210"
  error?: string;
}

/**
 * Normalizes an Indian or international mobile number into canonical formats.
 * Defaults to India (+91) if country code is omitted.
 */
export function normalizePhoneNumber(
  input: string,
  defaultCountryCode = '91'
): NormalizedPhone {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      e164: '',
      countryCode: '',
      nationalNumber: '',
      msg91Mobile: '',
      formatted: '',
      masked: '',
      error: 'Phone number cannot be empty.',
    };
  }

  // Strip all whitespace, hyphens, parentheses, dots
  let cleaned = input.trim().replace(/[\s\-\(\)\.]+/g, '');

  let countryCode = defaultCountryCode.replace(/\D/g, '');
  let nationalNumber = '';

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
    if (cleaned.startsWith('91')) {
      countryCode = '91';
      nationalNumber = cleaned.substring(2);
    } else if (cleaned.startsWith('1')) {
      countryCode = '1';
      nationalNumber = cleaned.substring(1);
    } else if (cleaned.startsWith('44')) {
      countryCode = '44';
      nationalNumber = cleaned.substring(2);
    } else if (cleaned.startsWith('971')) {
      countryCode = '971';
      nationalNumber = cleaned.substring(3);
    } else if (cleaned.startsWith('65')) {
      countryCode = '65';
      nationalNumber = cleaned.substring(2);
    } else {
      // General international: first 2 digits as country code heuristic
      countryCode = cleaned.slice(0, 2);
      nationalNumber = cleaned.slice(2);
    }
  } else if (cleaned.startsWith('0091')) {
    countryCode = '91';
    nationalNumber = cleaned.substring(4);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    // Leading zero trunk prefix for India (e.g. 09876543210)
    countryCode = '91';
    nationalNumber = cleaned.substring(1);
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    countryCode = '91';
    nationalNumber = cleaned.substring(2);
  } else if (cleaned.length === 10) {
    // Standard 10-digit national number (assumed India)
    countryCode = '91';
    nationalNumber = cleaned;
  } else {
    nationalNumber = cleaned;
  }

  // Strip leading non-digits from nationalNumber
  nationalNumber = nationalNumber.replace(/\D/g, '');

  // Validation rules for India (+91)
  if (countryCode === '91') {
    if (nationalNumber.length !== 10) {
      return {
        isValid: false,
        e164: '',
        countryCode: '91',
        nationalNumber,
        msg91Mobile: '',
        formatted: '',
        masked: '',
        error: 'Indian mobile numbers must be exactly 10 digits.',
      };
    }

    // Indian mobile numbers must start with 6, 7, 8, or 9
    const firstDigit = nationalNumber.charAt(0);
    if (!['6', '7', '8', '9'].includes(firstDigit)) {
      return {
        isValid: false,
        e164: '',
        countryCode: '91',
        nationalNumber,
        msg91Mobile: '',
        formatted: '',
        masked: '',
        error: 'Indian mobile numbers must start with 6, 7, 8, or 9.',
      };
    }
  } else {
    // General international length check (7 to 15 digits according to ITU E.164)
    if (nationalNumber.length < 7 || nationalNumber.length > 15) {
      return {
        isValid: false,
        e164: '',
        countryCode,
        nationalNumber,
        msg91Mobile: '',
        formatted: '',
        masked: '',
        error: 'International mobile numbers must be between 7 and 15 digits.',
      };
    }
  }

  const e164 = `+${countryCode}${nationalNumber}`;
  const msg91Mobile = `${countryCode}${nationalNumber}`;

  // Formatted display: e.g. +91 98765 43210
  const formatted =
    countryCode === '91'
      ? `+91 ${nationalNumber.slice(0, 5)} ${nationalNumber.slice(5)}`
      : `+${countryCode} ${nationalNumber}`;

  // Masked display: e.g. +91 98••• ••210
  const masked =
    countryCode === '91'
      ? `+91 ${nationalNumber.slice(0, 2)}••• ••${nationalNumber.slice(-3)}`
      : `+${countryCode} ••••${nationalNumber.slice(-3)}`;

  return {
    isValid: true,
    e164,
    countryCode,
    nationalNumber,
    msg91Mobile,
    formatted,
    masked,
  };
}

/**
 * Sanitizes phone numbers for database equality comparison.
 */
export function arePhonesEqual(phone1?: string, phone2?: string): boolean {
  if (!phone1 || !phone2) return false;
  const n1 = normalizePhoneNumber(phone1);
  const n2 = normalizePhoneNumber(phone2);
  if (!n1.isValid || !n2.isValid) return false;
  return n1.e164 === n2.e164;
}
