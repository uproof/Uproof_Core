import {NextResponse} from 'next/server';

export async function POST(request: Request) {
  const formKey = process.env.WEB3FORMS_ACCESS_KEY;

  if (!formKey) {
    return NextResponse.json(
      {error: 'Contact form is not configured yet. Set the Web3Forms key in the environment.'},
      {status: 500}
    );
  }

  const body = await request.json();
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').trim();
  const message = String(body.message || '').trim();
  const subject = String(body.subject || 'New Contact Form Submission from UpRoof Website').trim();

  if (!name || !email || !message) {
    return NextResponse.json({error: 'Missing required fields.'}, {status: 400});
  }

  await fetch(new URL('/api/admin/contact-messages', request.url), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      email,
      phone: phone || undefined,
      subject,
      message,
    }),
  });

  const outbound = new FormData();
  outbound.append('access_key', formKey);
  outbound.append('name', name);
  outbound.append('phone', phone);
  outbound.append('email', email);
  outbound.append('message', message);
  outbound.append('subject', subject);

  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: outbound,
  });

  const contentType = response.headers.get('content-type') || '';
  const result = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '');

  if (!response.ok || typeof result === 'string' || !result?.success) {
    return NextResponse.json(
      {error: 'Failed to send contact message.'},
      {status: 502}
    );
  }

  return NextResponse.json({ok: true});
}