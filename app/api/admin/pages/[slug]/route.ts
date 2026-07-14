import { NextRequest, NextResponse } from 'next/server';
import { isSuperadminAuthenticated } from '@/lib/adminAuth';
import path from 'path';
import {readJsonFile, writeJsonFile} from '@/lib/jsonFileStore';

const PAGES_FILE = path.join(process.cwd(), 'data', 'pages.json');

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authenticated = await isSuperadminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Read existing pages
    const pages = await readJsonFile<any[]>(PAGES_FILE, []);
    const { slug } = await params;
    const pageIndex = pages.findIndex((p: any) => p.slug === slug);

    if (pageIndex === -1) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    const updated = {
      ...pages[pageIndex],
      title,
      content,
      updatedAt: new Date().toISOString(),
    };

    pages[pageIndex] = updated;
    await writeJsonFile(PAGES_FILE, pages);

    return NextResponse.json({ page: updated });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}
