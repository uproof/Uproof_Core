import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { validateCsrfToken } from '@/lib/csrf';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const PROJECTS_FILE = path.join(process.cwd(), 'data', 'projects-admin.json');
const PUBLIC_UPLOADS = path.join(process.cwd(), 'public', 'uploads', 'projects');

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.access(PUBLIC_UPLOADS);
  } catch {
    await fs.mkdir(PUBLIC_UPLOADS, { recursive: true });
  }

  try {
    await fs.access(PROJECTS_FILE);
  } catch {
    await fs.writeFile(PROJECTS_FILE, JSON.stringify([], null, 2));
  }
}

export async function GET() {
  // Require admin auth for reading admin-managed projects
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await ensureDirectories();
    const content = await fs.readFile(PROJECTS_FILE, 'utf-8');
    const projects = JSON.parse(content);
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error reading projects:', error);
    return NextResponse.json({ error: 'Failed to read projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureDirectories();
    const formData = await request.formData();
    
    // CSRF protection
    const csrfToken = (formData.get('_csrf') as string) || request.headers.get('x-csrf-token') || '';
    const validCsrf = await validateCsrfToken(csrfToken);
    if (!validCsrf) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }
    
    const title = formData.get('title') as string;
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;
    const imageFile = formData.get('image') as File | null;

    if (!title || !location || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    let imagePath = '';

    // Handle image upload
    if (imageFile) {
      // Validate file type
      const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
      if (!ALLOWED_TYPES.includes(imageFile.type)) {
        return NextResponse.json(
          { error: 'Only JPEG, PNG, and WebP images are allowed' },
          { status: 400 }
        );
      }
      
      // Validate file size (5MB max)
      const MAX_SIZE = 5 * 1024 * 1024;
      if (imageFile.size > MAX_SIZE) {
        return NextResponse.json(
          { error: 'File size must be less than 5MB' },
          { status: 413 }
        );
      }
      
      const buffer = await imageFile.arrayBuffer();
      const fileName = `${id}.jpg`; // Force .jpg extension regardless of input
      const fullPath = path.join(PUBLIC_UPLOADS, fileName);
      
      await fs.writeFile(fullPath, Buffer.from(buffer));
      imagePath = `/uploads/projects/${fileName}`;
    }

    // Read existing projects
    const content = await fs.readFile(PROJECTS_FILE, 'utf-8');
    const projects = JSON.parse(content);

    const newProject = {
      id,
      title,
      location,
      description,
      image: imagePath || undefined,
      createdAt: new Date().toISOString(),
    };

    projects.push(newProject);
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
