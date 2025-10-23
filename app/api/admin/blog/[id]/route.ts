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

export async function PUT(req: NextRequest, {params}: {params: {id: string}}) {
  if (!isAdminAuthenticated()) return NextResponse.json({ok: false}, {status: 401});
  const body = await req.json();
  const id = Number(params.id);
  const posts = await readPosts();
  const idx = posts.findIndex(p => Number(p.id) === id);
  if (idx === -1) return NextResponse.json({ok: false, error: 'Not found'}, {status: 404});
  posts[idx] = {...posts[idx], ...body, id};
  await writePosts(posts);
  return NextResponse.json({ok: true, post: posts[idx]});
}

export async function DELETE(_: NextRequest, {params}: {params: {id: string}}) {
  if (!isAdminAuthenticated()) return NextResponse.json({ok: false}, {status: 401});
  const id = Number(params.id);
  const posts = await readPosts();
  const next = posts.filter(p => Number(p.id) !== id);
  await writePosts(next);
  return NextResponse.json({ok: true});
}
