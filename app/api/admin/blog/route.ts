import {NextRequest, NextResponse} from 'next/server';
import {isAdminAuthenticated} from '@/lib/adminAuth';
import fs from 'fs/promises';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'blog.json');

async function readPosts() {
  const txt = await fs.readFile(dataPath, 'utf8');
  return JSON.parse(txt) as any[];
}

async function writePosts(posts: any[]) {
  await fs.writeFile(dataPath, JSON.stringify(posts, null, 2), 'utf8');
}

export async function GET() {
  const posts = await readPosts();
  return NextResponse.json({ok: true, posts});
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated()) return NextResponse.json({ok: false}, {status: 401});
  const body = await req.json();
  const posts = await readPosts();
  const id = (posts.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0) || 0) + 1;
  const newPost = {id, ...body, status: body.status ?? 'published', date: body.date || new Date().toISOString().slice(0, 10)};
  posts.unshift(newPost);
  await writePosts(posts);
  return NextResponse.json({ok: true, post: newPost});
}
