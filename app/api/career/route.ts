import {NextResponse} from 'next/server';

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/rtf',
]);

export async function POST(request: Request) {
  const tallyApiKey = process.env.TALLY_API_KEY;

  if (!tallyApiKey) {
    return NextResponse.json(
      {error: 'Career form is not configured yet. Set the Tally API key in the environment.'},
      {status: 500}
    );
  }

  const incoming = await request.formData();
  const cv = incoming.get('cv');

  if (!(cv instanceof File)) {
    return NextResponse.json({error: 'A CV file is required.'}, {status: 400});
  }

  if (!allowedMimeTypes.has(cv.type) || cv.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      {error: 'CV must be a PDF, DOC, or DOCX file up to 10 MB.'},
      {status: 400}
    );
  }

  const outbound = new FormData();
  const captchaResponse = String(incoming.get('h-captcha-response') || '');

  if (!captchaResponse) {
    return NextResponse.json({error: 'Please complete the captcha verification.'}, {status: 400});
  }

  // Add all form fields to Tally submission
  outbound.append('fullName', String(incoming.get('fullName') || ''));
  outbound.append('email', String(incoming.get('email') || ''));
  outbound.append('phone', String(incoming.get('phone') || ''));
  outbound.append('location', String(incoming.get('location') || ''));
  outbound.append('experience', String(incoming.get('experience') || ''));
  outbound.append('message', String(incoming.get('message') || ''));
  outbound.append('cv', cv, cv.name);

  const response = await fetch('https://api.tally.so/forms/zxLx4q/submissions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tallyApiKey}`,
    },
    body: outbound,
  });

  const contentType = response.headers.get('content-type') || '';
  const result = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '');

  if (!response.ok) {
    console.error('Tally API error:', result);
    return NextResponse.json(
      {error: typeof result === 'string' ? 'Failed to submit career application.' : result?.message || 'Failed to submit career application.'},
      {status: 502}
    );
  }

  return NextResponse.json({ok: true});
}