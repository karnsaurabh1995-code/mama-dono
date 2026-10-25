import { NextRequest, NextResponse } from 'next/server';
import { isGoogleOAuthConfigured, buildGoogleAuthUrl, generateOAuthState } from '@/lib/auth/google';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const returnUrl = searchParams.get('returnUrl') || '/';

    // If Google OAuth credentials are not configured, return informative response
    if (!isGoogleOAuthConfigured()) {
      const msg = 'Google Sign-In is not yet configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local to enable live Google authentication.';
      // If requested via browser navigation, show styled configuration notice
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head><title>Google Sign-In Setup Required</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
          <body style="font-family: system-ui, sans-serif; background: #FAF9F6; color: #202124; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 16px;">
            <div style="background: white; border: 1px solid #EAE7E2; border-radius: 20px; padding: 32px; max-width: 480px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800;">Google Sign-In Setup Required</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #555B63; margin-bottom: 24px;">
                ${msg}
              </p>
              <div style="background: #F8F9FA; padding: 12px; border-radius: 10px; font-family: monospace; font-size: 12px; text-align: left; margin-bottom: 24px; color: #374151;">
                GOOGLE_CLIENT_ID=your_client_id<br/>
                GOOGLE_CLIENT_SECRET=your_client_secret
              </div>
              <a href="${returnUrl}" style="display: inline-block; background: #EF4949; color: white; padding: 10px 24px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 13px;">Return to dokind</a>
            </div>
          </body>
        </html>`,
        { status: 501, headers: { 'Content-Type': 'text/html' } }
      );
    }

    const origin = req.nextUrl.origin;
    const { state, token } = generateOAuthState(returnUrl);
    const authUrl = buildGoogleAuthUrl(origin, state);

    const response = NextResponse.redirect(authUrl);
    response.cookies.set('dokind_oauth_state', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    return response;
  } catch (err: any) {
    console.error('[API /api/auth/google] Initialization failed:', err.message);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate Google sign-in.' },
      { status: 500 }
    );
  }
}
