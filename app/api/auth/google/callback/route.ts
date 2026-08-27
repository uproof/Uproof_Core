import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {createGoogleOAuthClient, gmailStateCookie, gmailTokenCookie, listGmailMessages, protectGoogleTokens} from '@/lib/googleGmail';

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const savedState = request.cookies.get(gmailStateCookie)?.value;
  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.json({ok: false, error: 'Invalid Google OAuth state'}, {status: 400});
  }

  try {
    const origin = new URL(request.url).origin;
    const client = createGoogleOAuthClient(origin);
    const {tokens} = await client.getToken(code);
    const messages = await listGmailMessages(client, tokens as Record<string, unknown>);
    const response = NextResponse.json({ok: true, messageCount: messages.length, messages});
    response.cookies.set(gmailTokenCookie, protectGoogleTokens(tokens as Record<string, unknown>), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.delete(gmailStateCookie);
    return response;
  } catch (error) {
    return NextResponse.json({ok: false, error: error instanceof Error ? error.message : 'Gmail authorization failed'}, {status: 502});
  }
}
