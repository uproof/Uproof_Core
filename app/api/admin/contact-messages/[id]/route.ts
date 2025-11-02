import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import fs from 'fs/promises';
import path from 'path';

const CONTACT_MESSAGES_FILE = path.join(process.cwd(), 'data', 'contact-messages.json');

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authenticated = isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { read } = body;

    // Read existing messages
    const content = await fs.readFile(CONTACT_MESSAGES_FILE, 'utf-8');
    const messages = JSON.parse(content);
    const messageIndex = messages.findIndex((m: any) => m.id === params.id);

    if (messageIndex === -1) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    messages[messageIndex].read = read;
    await fs.writeFile(CONTACT_MESSAGES_FILE, JSON.stringify(messages, null, 2));

    return NextResponse.json({ message: messages[messageIndex] });
  } catch (error) {
    console.error('Error updating contact message:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authenticated = isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Read existing messages
    const content = await fs.readFile(CONTACT_MESSAGES_FILE, 'utf-8');
    const messages = JSON.parse(content);
    const messageIndex = messages.findIndex((m: any) => m.id === params.id);

    if (messageIndex === -1) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Remove message
    messages.splice(messageIndex, 1);
    await fs.writeFile(CONTACT_MESSAGES_FILE, JSON.stringify(messages, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
