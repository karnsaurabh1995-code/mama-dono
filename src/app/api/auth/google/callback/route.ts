import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  verifyOAuthState,
  exchangeGoogleCodeForTokens,
  fetchGoogleUserInfo,
} from '@/lib/auth/google';
import { setServerSession } from '@/lib/auth/server';
import { User } from '@/lib/types';
import { INITIAL_SUPER_ADMIN_ACCOUNTS, DEMO_USERS } from '@/lib/auth/constants';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    // Handle user denial on Google consent page
    if (errorParam) {
      console.warn('[Google OAuth] User cancelled or Google returned error:', errorParam);
      return NextResponse.redirect(new URL('/?auth_error=google_cancelled', req.nextUrl.origin));
    }

    if (!code || !state) {
      return NextResponse.json(
        { success: false, error: 'Missing code or state parameters from Google authorization.' },
        { status: 400 }
      );
    }

    // 1. Anti-CSRF verification against cookie
    const stateCookie = req.cookies.get('dokind_oauth_state')?.value;
    if (!stateCookie || stateCookie !== state) {
      return NextResponse.json(
        { success: false, error: 'Security validation failed (CSRF state mismatch or expired). Please try signing in again.' },
        { status: 400 }
      );
    }

    const { valid, returnUrl } = verifyOAuthState(state);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'OAuth state is invalid or expired.' },
        { status: 400 }
      );
    }

    // 2. Exchange authorization code for Google access token
    const origin = req.nextUrl.origin;
    const { accessToken } = await exchangeGoogleCodeForTokens(code, origin);

    // 3. Fetch verified user identity from Google OpenID Connect
    const googleUser = await fetchGoogleUserInfo(accessToken);
    const normEmail = googleUser.email.toLowerCase().trim();

    // 4. Match with existing account or create new user
    let user: User | undefined = db.getUserByEmail(normEmail);

    // Check designated super admins
    if (!user && db.isDesignatedSuperAdmin(normEmail)) {
      user = INITIAL_SUPER_ADMIN_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === normEmail
      );
    }

    // Check demo users
    if (!user) {
      user = Object.values(DEMO_USERS).find(
        (u) => u.email.toLowerCase() === normEmail
      );
    }

    if (!user) {
      // Create new verified donor account
      const newUser: User = {
        id: `usr-g-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: googleUser.name,
        email: normEmail,
        avatarUrl: googleUser.picture || '',
        role: 'donor',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      db.createUser(newUser);
      user = newUser;
    } else if (googleUser.picture && !user.avatarUrl) {
      user.avatarUrl = googleUser.picture;
    }

    // 5. Establish secure session cookie
    await setServerSession(user);

    // 6. Redirect user back to destination
    const destination = returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/';
    const redirectResponse = NextResponse.redirect(new URL(destination, req.nextUrl.origin));
    redirectResponse.cookies.delete('dokind_oauth_state');

    return redirectResponse;
  } catch (err: any) {
    console.error('[API /api/auth/google/callback] Callback failure:', err.message);
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(err.message || 'google_callback_failed')}`, req.nextUrl.origin)
    );
  }
}
