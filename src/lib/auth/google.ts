import crypto from 'crypto';
import { db } from '@/lib/db';

export interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

function getGoogleCredentials() {
  const dbKey = db.getDecryptedApiKey('key-google-oauth');
  const clientId = dbKey?.publicKey || process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = dbKey?.secretKey || process.env.GOOGLE_CLIENT_SECRET || '';
  return { clientId, clientSecret };
}

/**
 * Checks whether Google OAuth credentials are configured in the environment or database
 */
export function isGoogleOAuthConfigured(): boolean {
  const { clientId, clientSecret } = getGoogleCredentials();
  if (!clientId || !clientSecret) return false;
  if (clientId.includes('your_google') || clientSecret.includes('your_google')) return false;
  return true;
}

/**
 * Returns canonical redirect URI for Google OAuth callback
 */
export function getGoogleCallbackUri(origin?: string): string {
  const base =
    origin ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://dokind.org.in' : 'http://localhost:3000');
  return `${base.replace(/\/$/, '')}/api/auth/google/callback`;
}

/**
 * Generates official Google OAuth 2.0 authorization URL with anti-CSRF state and OpenID Connect scope
 */
export function buildGoogleAuthUrl(origin: string, state: string): string {
  const { clientId } = getGoogleCredentials();
  const redirectUri = getGoogleCallbackUri(origin);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchanges Google authorization code for access and ID tokens
 */
export async function exchangeGoogleCodeForTokens(
  code: string,
  origin: string
): Promise<{ accessToken: string; idToken: string }> {
  const { clientId, clientSecret } = getGoogleCredentials();
  const redirectUri = getGoogleCallbackUri(origin);

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google token exchange failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    idToken: data.id_token,
  };
}

/**
 * Fetches verified user identity from Google's OpenID Connect UserInfo endpoint
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Google user profile (${response.status})`);
  }

  const data = await response.json();

  if (!data.email || !data.email_verified) {
    throw new Error('Google account email is missing or not verified.');
  }

  return {
    sub: data.sub,
    email: data.email.toLowerCase().trim(),
    name: data.name || data.email.split('@')[0],
    picture: data.picture,
    email_verified: Boolean(data.email_verified),
  };
}

/**
 * Generates an anti-CSRF state token signed with secret
 */
export function generateOAuthState(returnUrl = '/'): { state: string; token: string } {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const payload = {
    nonce: randomBytes,
    returnUrl: returnUrl.startsWith('/') ? returnUrl : '/',
    timestamp: Date.now(),
  };

  const serialized = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.AUTH_SECRET || 'dokind-oauth-state-secret-2026';
  const sig = crypto.createHmac('sha256', secret).update(serialized).digest('base64url');

  const token = `${serialized}.${sig}`;
  return { state: token, token };
}

/**
 * Validates the state token returned from Google OAuth callback
 */
export function verifyOAuthState(state: string): { valid: boolean; returnUrl: string } {
  try {
    if (!state || !state.includes('.')) {
      return { valid: false, returnUrl: '/' };
    }

    const [serialized, sig] = state.split('.');
    const secret = process.env.AUTH_SECRET || 'dokind-oauth-state-secret-2026';
    const expectedSig = crypto.createHmac('sha256', secret).update(serialized).digest('base64url');

    if (sig !== expectedSig) {
      return { valid: false, returnUrl: '/' };
    }

    const json = Buffer.from(serialized, 'base64url').toString('utf8');
    const payload = JSON.parse(json);

    // Reject state older than 15 minutes
    if (Date.now() - payload.timestamp > 15 * 60 * 1000) {
      return { valid: false, returnUrl: '/' };
    }

    return {
      valid: true,
      returnUrl: payload.returnUrl || '/',
    };
  } catch {
    return { valid: false, returnUrl: '/' };
  }
}
