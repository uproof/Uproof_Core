import {NextRequest, NextResponse} from 'next/server';
import {isSuperadminAuthenticated} from '@/lib/adminAuth';
import path from 'path';
import {readJsonFile, writeJsonFile} from '@/lib/jsonFileStore';

const LOCALE_MESSAGE_FILES: Record<'lv' | 'en' | 'nl-BE', string> = {
  lv: path.join(process.cwd(), 'messages', 'lv.json'),
  en: path.join(process.cwd(), 'messages', 'en.json'),
  'nl-BE': path.join(process.cwd(), 'messages', 'nl-BE.json'),
};

function filePath(locale: string) {
  return LOCALE_MESSAGE_FILES[locale as keyof typeof LOCALE_MESSAGE_FILES];
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
    const messages = await readJsonFile(filePath(locale), {});
    return NextResponse.json({ok: true, messages});
  } catch (e) {
    return NextResponse.json({ok: false, error: 'Locale not found'}, {status: 404});
  }
}

export async function PUT(req: NextRequest, {params}: {params: Promise<{locale: string}>}) {
  if (!(await isSuperadminAuthenticated())) return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});
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
  await writeJsonFile(filePath(locale), body);
  return NextResponse.json({ok: true});
}
