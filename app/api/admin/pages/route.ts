import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import fs from 'fs/promises';
import path from 'path';

const PAGES_FILE = path.join(process.cwd(), 'data', 'pages.json');

async function ensurePagesFile() {
  try {
    await fs.access(PAGES_FILE);
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
    await fs.writeFile(PAGES_FILE, JSON.stringify(defaultPages, null, 2));
  }
}

export async function GET() {
  try {
    await ensurePagesFile();
    const content = await fs.readFile(PAGES_FILE, 'utf-8');
    const pages = JSON.parse(content);
    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Error reading pages:', error);
    return NextResponse.json({ pages: [] });
  }
}
