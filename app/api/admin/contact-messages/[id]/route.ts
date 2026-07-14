import { NextRequest, NextResponse } from 'next/server';
import { isSuperadminAuthenticated } from '@/lib/adminAuth';
import path from 'path';
import {readJsonFile, writeJsonFile} from '@/lib/jsonFileStore';

const CONTACT_MESSAGES_FILE = path.join(process.cwd(), 'data', 'contact-messages.json');

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isSuperadminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { read } = body;

    // Read existing messages
    const messages = await readJsonFile<any[]>(CONTACT_MESSAGES_FILE, []);
    const { id } = await params;
    const messageIndex = messages.findIndex((m: any) => m.id === id);

    if (messageIndex === -1) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    messages[messageIndex].read = read;
    await writeJsonFile(CONTACT_MESSAGES_FILE, messages);

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
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isSuperadminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Read existing messages
    const messages = await readJsonFile<any[]>(CONTACT_MESSAGES_FILE, []);
    const { id } = await params;
    const messageIndex = messages.findIndex((m: any) => m.id === id);

    if (messageIndex === -1) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Remove message
    messages.splice(messageIndex, 1);
    await writeJsonFile(CONTACT_MESSAGES_FILE, messages);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
