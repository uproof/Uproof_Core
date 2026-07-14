import {NextRequest, NextResponse} from 'next/server';
import {isSuperadminAuthenticated} from '@/lib/adminAuth';
import {validateCsrfToken} from '@/lib/csrf';
import path from 'path';
import {readJsonFile, writeJsonFile} from '@/lib/jsonFileStore';

const dataPath = path.join(process.cwd(), 'data', 'blog.json');

async function readPosts() {
  return readJsonFile<any[]>(dataPath, []);
}

async function writePosts(posts: any[]) {
  await writeJsonFile(dataPath, posts);
}

export async function GET() {
  const posts = await readPosts();
  return NextResponse.json({ok: true, posts});
}

export async function POST(req: NextRequest) {
  if (!(await isSuperadminAuthenticated())) return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});
  const body = await req.json();
  
  // CSRF protection
  const csrfToken = body._csrf || req.headers.get('x-csrf-token') || '';
  const validCsrf = await validateCsrfToken(csrfToken);
  if (!validCsrf) {
    return NextResponse.json({ok: false, error: 'Invalid CSRF token'}, {status: 403});
  }
  
  const posts = await readPosts();
  const id = (posts.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0) || 0) + 1;
  const newPost = {id, ...body, status: body.status ?? 'published', date: body.date || new Date().toISOString().slice(0, 10)};
  posts.unshift(newPost);
  await writePosts(posts);
  return NextResponse.json({ok: true, post: newPost});
}
