import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

async function ensureSettingsFile() {
  try {
    await fs.access(SETTINGS_FILE);
  } catch {
    const defaultSettings = {
      companyName: 'UpRoof Roofing Services',
      companyAddress: '123 Main Street, Your City',
      companyPhone: '+1 (555) 000-0000',
      companyEmail: 'info@uproof.com',
      companyDescription: 'Professional roofing services for residential and commercial properties.',
      seoTitle: 'Professional Roofing Services | UpRoof',
      seoDescription: 'High-quality roofing installation, repair, and maintenance services.',
      seoKeywords: 'roofing, roof repair, roof installation, professional roofing',
      socialFacebook: '',
      socialInstagram: '',
      socialLinkedIn: '',
      socialTwitter: '',
    };
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
  }
}

export async function GET() {
  try {
    await ensureSettingsFile();
    const content = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const settings = JSON.parse(content);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error reading settings:', error);
    return NextResponse.json({ settings: {} });
  }
}

export async function PATCH(request: NextRequest) {
  const authenticated = isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureSettingsFile();
    const body = await request.json();

    // Validate required fields
    if (!body.companyName || !body.companyEmail || !body.companyPhone) {
      return NextResponse.json(
        { error: 'Company name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Write settings
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(body, null, 2));

    return NextResponse.json({ settings: body });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
