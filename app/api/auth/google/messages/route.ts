import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {createGoogleOAuthClient, gmailTokenCookie, listGmailMessages, unprotectGoogleTokens} from '@/lib/googleGmail';

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  const protectedTokens = request.cookies.get(gmailTokenCookie)?.value;
  const tokens = protectedTokens ? unprotectGoogleTokens(protectedTokens) : null;
  if (!tokens) {
    return NextResponse.json({ok: false, error: 'Connect a Google account first'}, {status: 401});
  }

  try {
    const messages = await listGmailMessages(createGoogleOAuthClient(new URL(request.url).origin), tokens);
    return NextResponse.json({ok: true, messageCount: messages.length, messages});
  } catch (error) {
    return NextResponse.json({ok: false, error: error instanceof Error ? error.message : 'Gmail request failed'}, {status: 502});
  }
}
