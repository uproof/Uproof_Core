import { NextRequest, NextResponse } from 'next/server';
import { isSuperadminAuthenticated } from '@/lib/adminAuth';
import path from 'path';
import {readJsonFile, writeJsonFile} from '@/lib/jsonFileStore';

const PAGES_FILE = path.join(process.cwd(), 'data', 'pages.json');

async function ensurePagesFile() {
  try {
    await import('fs/promises').then((fs) => fs.access(PAGES_FILE));
  } catch {
    const defaultPages = [
      {
        slug: 'about',
        title: 'About Us',
        content: 'Welcome to our roofing services. We provide professional roofing solutions for residential and commercial properties.',
      },
      {
        slug: 'contact',
        title: 'Contact Us',
        content: 'Get in touch with us for a free quote. Call us or fill out the contact form on our website.',
      },
    ];
    await writeJsonFile(PAGES_FILE, defaultPages);
  }
}

export async function GET() {
  // Require admin auth for admin pages feed
  const authenticated = await isSuperadminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await ensurePagesFile();
    const pages = await readJsonFile(PAGES_FILE, []);
    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Error reading pages:', error);
    return NextResponse.json({ error: 'Failed to read pages' }, { status: 500 });
  }
}
