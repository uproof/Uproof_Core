import {NextRequest, NextResponse} from 'next/server';
import {isSuperadminAuthenticated} from '@/lib/adminAuth';
import path from 'path';
import {readJsonFile, writeJsonFile} from '@/lib/jsonFileStore';

const dataPath = path.join(process.cwd(), 'data', 'blog.json');

async function readPosts() {
  return readJsonFile<any[]>(dataPath, []);
}

async function writePosts(posts: any[]) {
  await writeJsonFile(dataPath, posts);
}

export async function PUT(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
  if (!(await isSuperadminAuthenticated())) return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});
  const body = await req.json();
  const {id: idParam} = await params;
  const id = Number(idParam);
  const posts = await readPosts();
  const idx = posts.findIndex(p => Number(p.id) === id);
  if (idx === -1) return NextResponse.json({ok: false, error: 'Not found'}, {status: 404});
  posts[idx] = {...posts[idx], ...body, id};
  await writePosts(posts);
  return NextResponse.json({ok: true, post: posts[idx]});
}

export async function DELETE(_: NextRequest, {params}: {params: Promise<{id: string}>}) {
  if (!(await isSuperadminAuthenticated())) return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});
  const {id: idParam} = await params;
  const id = Number(idParam);
  const posts = await readPosts();
  const next = posts.filter(p => Number(p.id) !== id);
  await writePosts(next);
  return NextResponse.json({ok: true});
}
