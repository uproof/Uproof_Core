import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {createGoogleAuthorizationUrl, createGoogleOAuthClient, createOAuthState, gmailStateCookie} from '@/lib/googleGmail';

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  try {
    const origin = new URL(request.url).origin;
    const state = createOAuthState();
    const client = createGoogleOAuthClient(origin);
    const response = NextResponse.redirect(createGoogleAuthorizationUrl(client, state));
    response.cookies.set(gmailStateCookie, state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 600,
    });
    return response;
  } catch (error) {
    return NextResponse.json({ok: false, error: error instanceof Error ? error.message : 'Google OAuth is not configured'}, {status: 503});
  }
}
