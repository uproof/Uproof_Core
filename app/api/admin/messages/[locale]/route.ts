import {NextRequest, NextResponse} from 'next/server';
import {isAdminAuthenticated} from '@/lib/adminAuth';
import fs from 'fs/promises';
import path from 'path';

function filePath(locale: string) {
  return path.join(process.cwd(), 'messages', `${locale}.json`);
}

function validateLocale(locale: string): boolean {
  const validLocales = ['lv', 'en', 'nl-BE'];
  return validLocales.includes(locale);
}

export async function GET(_: NextRequest, {params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  
  // Validate locale to prevent path traversal
  if (!validateLocale(locale)) {
    return NextResponse.json({ok: false, error: 'Invalid locale'}, {status: 400});
  }
  
  try {
    const txt = await fs.readFile(filePath(locale), 'utf8');
    return NextResponse.json({ok: true, messages: JSON.parse(txt)});
  } catch (e) {
    return NextResponse.json({ok: false, error: 'Locale not found'}, {status: 404});
  }
}

export async function PUT(req: NextRequest, {params}: {params: Promise<{locale: string}>}) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ok: false}, {status: 401});
  const {locale} = await params;
  
  // Validate locale to prevent path traversal
  if (!validateLocale(locale)) {
    return NextResponse.json({ok: false, error: 'Invalid locale'}, {status: 400});
  }
  
  const body = await req.json();
  // Basic safeguard: ensure object
  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ok: false, error: 'Invalid payload'}, {status: 400});
  }
  await fs.writeFile(filePath(locale), JSON.stringify(body, null, 2), 'utf8');
  return NextResponse.json({ok: true});
}
