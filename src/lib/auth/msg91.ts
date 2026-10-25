/**
 * MSG91 OTP SERVICE ADAPTER FOR DOKIND
 *
 * Implements official MSG91 OTP API v5 integration:
 * - Send OTP:   POST https://control.msg91.com/api/v5/otp
 * - Verify OTP: GET  https://control.msg91.com/api/v5/otp/verify
 * - Resend OTP: GET  https://control.msg91.com/api/v5/otp/retry
 *
 * Supports production API calls with timeouts & structured telemetry,
 * and isolated development/mock testing mode when credentials are not yet configured.
 */

import { normalizePhoneNumber } from './phone';
import { db } from '@/lib/db';

export interface Msg91Config {
  authKey?: string;
  templateId?: string;
  enabled: boolean;
  isDevMode: boolean;
  otpLength: number;
  otpExpiryMinutes: number;
  defaultCountryCode: string;
}

export interface Msg91OtpResult {
  success: boolean;
  message: string;
  type?: 'success' | 'error';
  provider: 'msg91' | 'mock' | 'unconfigured';
  requestId?: string;
  rawResponse?: Record<string, any>;
  statusCode?: number;
}

// In-memory mock store for development and automated testing
interface MockOtpStore {
  [msg91Mobile: string]: {
    otp: string;
    expiresAt: number;
    attempts: number;
    resends: number;
  };
}

const mockStore: MockOtpStore = {};

/**
 * Retrieves sanitized MSG91 configuration from environment variables.
 */
export function getMsg91Config(): Msg91Config {
  const dbKey = db.getDecryptedApiKey('key-msg91-otp') || db.getDecryptedApiKey('key-fast2sms-dlt');
  const authKey = dbKey?.secretKey || process.env.MSG91_AUTH_KEY?.trim() || '';
  const templateId = dbKey?.publicKey || process.env.MSG91_OTP_TEMPLATE_ID?.trim() || '';
  const enabledStr = (process.env.PHONE_OTP_ENABLED || 'false').toLowerCase().trim();
  const enabled = dbKey?.status === 'active' || enabledStr === 'true' || enabledStr === '1';
  const devModeStr = (process.env.MSG91_DEV_MODE || 'auto').toLowerCase().trim();

  // If no authKey is configured, automatically default to dev/mock mode
  const isDevMode =
    devModeStr === 'true' ||
    devModeStr === '1' ||
    (!authKey && process.env.NODE_ENV !== 'production');

  const otpLength = Number(process.env.MSG91_OTP_LENGTH) || 6;
  const otpExpiryMinutes = Number(process.env.MSG91_OTP_EXPIRY_MINUTES) || 10;
  const defaultCountryCode = process.env.MSG91_DEFAULT_COUNTRY_CODE || '91';

  return {
    authKey: authKey || undefined,
    templateId: templateId || undefined,
    enabled,
    isDevMode,
    otpLength,
    otpExpiryMinutes,
    defaultCountryCode,
  };
}

/**
 * Sends an OTP to the given mobile number.
 */
export async function sendMsg91Otp(params: {
  mobile: string;
  otpLength?: number;
  otpExpiryMinutes?: number;
  ip?: string;
}): Promise<Msg91OtpResult> {
  const config = getMsg91Config();
  const norm = normalizePhoneNumber(params.mobile, config.defaultCountryCode);

  if (!norm.isValid) {
    return {
      success: false,
      message: norm.error || 'Invalid mobile number format.',
      provider: 'unconfigured',
    };
  }

  const length = params.otpLength || config.otpLength;
  const expiry = params.otpExpiryMinutes || config.otpExpiryMinutes;

  // Real MSG91 Provider Flow
  if (config.authKey && config.templateId && !config.isDevMode) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const endpoint = new URL('https://control.msg91.com/api/v5/otp');
      endpoint.searchParams.set('template_id', config.templateId);
      endpoint.searchParams.set('mobile', norm.msg91Mobile);
      endpoint.searchParams.set('otp_length', length.toString());
      endpoint.searchParams.set('otp_expiry', expiry.toString());

      const res = await fetch(endpoint.toString(), {
        method: 'POST',
        headers: {
          authkey: config.authKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          app_name: 'dokind',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));

      // In MSG91 API v5, success returns: { type: "success", message: "..." }
      if (res.ok && data?.type === 'success') {
        return {
          success: true,
          message: data.message || 'OTP sent successfully via SMS.',
          type: 'success',
          provider: 'msg91',
          requestId: data.request_id || undefined,
          statusCode: res.status,
        };
      }

      const errorMessage =
        data?.message ||
        (res.status === 401
          ? 'Invalid MSG91 Authentication Key.'
          : 'Failed to trigger OTP delivery. Please check configuration.');

      return {
        success: false,
        message: errorMessage,
        type: 'error',
        provider: 'msg91',
        statusCode: res.status,
      };
    } catch (err: any) {
      const isTimeout = err?.name === 'AbortError';
      return {
        success: false,
        message: isTimeout
          ? 'MSG91 gateway timeout. Please try again in a few moments.'
          : 'Network error connecting to MSG91 service.',
        provider: 'msg91',
      };
    }
  }

  // Development / Mock Flow (Safe Local Testing)
  // Generates a mock OTP stored in memory for 10 minutes
  const mockCode = Math.floor(100000 + Math.random() * 900000).toString().slice(0, length);
  mockStore[norm.msg91Mobile] = {
    otp: mockCode,
    expiresAt: Date.now() + expiry * 60 * 1000,
    attempts: 0,
    resends: 0,
  };

  // Structured operational log without logging secret authkeys
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DOKIND MSG91 MOCK] Sent OTP "${mockCode}" to ${norm.masked} (Expires in ${expiry}m)`);
  }

  return {
    success: true,
    message: 'OTP triggered successfully (Development Simulation Mode).',
    type: 'success',
    provider: 'mock',
    // In dev mode, return mock code strictly in non-production for testing utilities
    requestId: `mock-${Date.now()}`,
    rawResponse: process.env.NODE_ENV !== 'production' ? { devOtpHint: mockCode } : undefined,
  };
}

/**
 * Verifies an OTP code submitted by the user.
 */
export async function verifyMsg91Otp(params: {
  mobile: string;
  otp: string;
  ip?: string;
}): Promise<Msg91OtpResult> {
  const config = getMsg91Config();
  const norm = normalizePhoneNumber(params.mobile, config.defaultCountryCode);

  if (!norm.isValid) {
    return {
      success: false,
      message: 'Invalid mobile number format.',
      provider: 'unconfigured',
    };
  }

  const cleanOtp = params.otp.trim().replace(/\D/g, '');
  if (!cleanOtp) {
    return {
      success: false,
      message: 'Please provide a valid numeric OTP code.',
      provider: 'unconfigured',
    };
  }

  // Real MSG91 Provider Flow
  if (config.authKey && !config.isDevMode) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const endpoint = new URL('https://control.msg91.com/api/v5/otp/verify');
      endpoint.searchParams.set('mobile', norm.msg91Mobile);
      endpoint.searchParams.set('otp', cleanOtp);

      const res = await fetch(endpoint.toString(), {
        method: 'GET',
        headers: {
          authkey: config.authKey,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));

      // MSG91 v5 returns 200 with type: "success" when verified,
      // or type: "error" with messages like "OTP not match", "OTP expired".
      if (res.ok && data?.type === 'success') {
        return {
          success: true,
          message: data.message || 'OTP verified successfully.',
          type: 'success',
          provider: 'msg91',
          statusCode: res.status,
        };
      }

      return {
        success: false,
        message: data?.message || 'Invalid or expired OTP code. Please try again.',
        type: 'error',
        provider: 'msg91',
        statusCode: res.status,
      };
    } catch (err: any) {
      const isTimeout = err?.name === 'AbortError';
      return {
        success: false,
        message: isTimeout
          ? 'Verification request timed out. Please try again.'
          : 'Network error connecting to MSG91 service.',
        provider: 'msg91',
      };
    }
  }

  // Development / Mock Flow
  const challenge = mockStore[norm.msg91Mobile];
  if (!challenge) {
    return {
      success: false,
      message: 'No active OTP challenge found. Please request a new code.',
      provider: 'mock',
    };
  }

  if (Date.now() > challenge.expiresAt) {
    delete mockStore[norm.msg91Mobile];
    return {
      success: false,
      message: 'OTP code has expired. Please request a new one.',
      provider: 'mock',
    };
  }

  challenge.attempts += 1;
  if (challenge.attempts > 5) {
    delete mockStore[norm.msg91Mobile];
    return {
      success: false,
      message: 'Maximum verification attempts exceeded. Please request a new OTP.',
      provider: 'mock',
    };
  }

  if (challenge.otp !== cleanOtp) {
    return {
      success: false,
      message: 'Incorrect OTP code. Please check and try again.',
      provider: 'mock',
    };
  }

  // Verified cleanly -> consume challenge
  delete mockStore[norm.msg91Mobile];

  return {
    success: true,
    message: 'OTP verified successfully (Development Mode).',
    type: 'success',
    provider: 'mock',
  };
}

/**
 * Resends an existing OTP code to the user.
 */
export async function retryMsg91Otp(params: {
  mobile: string;
  retryType?: 'text' | 'voice';
  ip?: string;
}): Promise<Msg91OtpResult> {
  const config = getMsg91Config();
  const norm = normalizePhoneNumber(params.mobile, config.defaultCountryCode);

  if (!norm.isValid) {
    return {
      success: false,
      message: 'Invalid mobile number format.',
      provider: 'unconfigured',
    };
  }

  const retryChannel = params.retryType || 'text';

  // Real MSG91 Provider Flow
  if (config.authKey && !config.isDevMode) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const endpoint = new URL('https://control.msg91.com/api/v5/otp/retry');
      endpoint.searchParams.set('authkey', config.authKey);
      endpoint.searchParams.set('mobile', norm.msg91Mobile);
      endpoint.searchParams.set('retrytype', retryChannel);

      const res = await fetch(endpoint.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.type === 'success') {
        return {
          success: true,
          message: data.message || 'OTP resent successfully.',
          type: 'success',
          provider: 'msg91',
          statusCode: res.status,
        };
      }

      return {
        success: false,
        message: data?.message || 'Failed to resend OTP. You may have reached the maximum retry limit.',
        type: 'error',
        provider: 'msg91',
        statusCode: res.status,
      };
    } catch (err: any) {
      const isTimeout = err?.name === 'AbortError';
      return {
        success: false,
        message: isTimeout
          ? 'Resend request timed out. Please try again.'
          : 'Network error connecting to MSG91 service.',
        provider: 'msg91',
      };
    }
  }

  // Development / Mock Flow
  const challenge = mockStore[norm.msg91Mobile];
  if (!challenge) {
    return {
      success: false,
      message: 'No active OTP challenge to resend. Please initiate a new request.',
      provider: 'mock',
    };
  }

  challenge.resends += 1;
  if (challenge.resends > 3) {
    return {
      success: false,
      message: 'Maximum resend limit reached for this session.',
      provider: 'mock',
    };
  }

  // Refresh expiry by 10 minutes on resend
  challenge.expiresAt = Date.now() + config.otpExpiryMinutes * 60 * 1000;

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DOKIND MSG91 MOCK] Resent OTP "${challenge.otp}" to ${norm.masked}`);
  }

  return {
    success: true,
    message: 'OTP resent successfully (Development Mode).',
    type: 'success',
    provider: 'mock',
    rawResponse: process.env.NODE_ENV !== 'production' ? { devOtpHint: challenge.otp } : undefined,
  };
}

/**
 * Diagnostic helper to get configuration status safely (never reveals authkey).
 */
export function getMsg91Status() {
  const config = getMsg91Config();
  return {
    isConfigured: Boolean(config.authKey && config.templateId),
    isEnabled: config.enabled,
    isDevMode: config.isDevMode,
    hasAuthKey: Boolean(config.authKey),
    hasTemplateId: Boolean(config.templateId),
    otpLength: config.otpLength,
    otpExpiryMinutes: config.otpExpiryMinutes,
    defaultCountryCode: config.defaultCountryCode,
  };
}
