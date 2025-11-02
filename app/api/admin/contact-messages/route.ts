import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const CONTACT_MESSAGES_FILE = path.join(process.cwd(), 'data', 'contact-messages.json');

async function ensureFile() {
  try {
    await fs.access(CONTACT_MESSAGES_FILE);
  } catch {
    await fs.writeFile(CONTACT_MESSAGES_FILE, JSON.stringify([], null, 2));
  }
}

export async function GET() {
  try {
    await ensureFile();
    const content = await fs.readFile(CONTACT_MESSAGES_FILE, 'utf-8');
    const messages = JSON.parse(content);
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
    const content = await fs.readFile(CONTACT_MESSAGES_FILE, 'utf-8');
    const messages = JSON.parse(content);

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
    await fs.writeFile(CONTACT_MESSAGES_FILE, JSON.stringify(messages, null, 2));

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error('Error creating contact message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}
