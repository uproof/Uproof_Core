import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import fs from 'fs/promises';
import path from 'path';

const PAGES_FILE = path.join(process.cwd(), 'data', 'pages.json');

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const authenticated = isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    const fileContent = await fs.readFile(PAGES_FILE, 'utf-8');
    const pages = JSON.parse(fileContent);
    const pageIndex = pages.findIndex((p: any) => p.slug === params.slug);

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
    await fs.writeFile(PAGES_FILE, JSON.stringify(pages, null, 2));

    return NextResponse.json({ page: updated });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}
