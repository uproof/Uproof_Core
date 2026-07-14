import { NextRequest, NextResponse } from 'next/server';
import { isSuperadminAuthenticated } from '@/lib/adminAuth';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {readJsonFile, writeJsonFile} from '@/lib/jsonFileStore';

const CONTACT_MESSAGES_FILE = path.join(process.cwd(), 'data', 'contact-messages.json');

async function ensureFile() {
  try {
    await import('fs/promises').then((fs) => fs.access(CONTACT_MESSAGES_FILE));
  } catch {
    await writeJsonFile(CONTACT_MESSAGES_FILE, []);
  }
}

export async function GET() {
  // Require admin auth for reading contact messages (PII)
  const authenticated = await isSuperadminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await ensureFile();
    const messages = await readJsonFile<any[]>(CONTACT_MESSAGES_FILE, []);
    return NextResponse.json({
      messages: messages.sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    });
  } catch (error) {
    console.error('Error reading contact messages:', error);
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for contact form submissions (prevent spam)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimit = await checkRateLimit(`contact-${ip}`, RATE_LIMITS.CONTACT);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

    await ensureFile();
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Read existing messages
    const messages = await readJsonFile<any[]>(CONTACT_MESSAGES_FILE, []);

    const newMessage = {
      id: uuidv4(),
      name,
      email,
      phone: phone || undefined,
      subject,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };

    messages.push(newMessage);
    await writeJsonFile(CONTACT_MESSAGES_FILE, messages);

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error('Error creating contact message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}
