import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { validateCsrfToken } from '@/lib/csrf';
import fs from 'fs/promises';
import path from 'path';

const PROJECTS_FILE = path.join(process.cwd(), 'data', 'projects-admin.json');
const PUBLIC_UPLOADS = path.join(process.cwd(), 'public', 'uploads', 'projects');

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
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

    // Read existing projects
    const content = await fs.readFile(PROJECTS_FILE, 'utf-8');
    const projects = JSON.parse(content);
    const projectIndex = projects.findIndex((p: any) => p.id === id);

    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const project = projects[projectIndex];
    let imagePath = project.image;

      // Handle new image upload
    if (imageFile) {
      // Validate new file
      const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
      if (!ALLOWED_TYPES.includes(imageFile.type)) {
        return NextResponse.json(
          { error: 'Only JPEG, PNG, and WebP images are allowed' },
          { status: 400 }
        );
      }
      
      const MAX_SIZE = 5 * 1024 * 1024;
      if (imageFile.size > MAX_SIZE) {
        return NextResponse.json(
          { error: 'File size must be less than 5MB' },
          { status: 413 }
        );
      }
      
      // Delete old image if exists
      if (project.image) {
        try {
          // Validate old path before deletion
          if (!validateImagePath(project.image)) {
            throw new Error('Invalid old image path');
          }
          const oldPath = path.join(process.cwd(), 'public', project.image);
          const normalizedPath = path.normalize(oldPath);
          const baseDir = path.normalize(path.join(process.cwd(), 'public'));
          
          // Ensure the path is within the public directory
          if (!normalizedPath.startsWith(baseDir)) {
            throw new Error('Invalid image path');
          }
          
          await fs.unlink(normalizedPath);
        } catch (e) {
          // Ignore if file doesn't exist or path is invalid
          console.error('Error deleting old image:', e);
        }
      }

      const buffer = await imageFile.arrayBuffer();
      const fileName = `${id}.jpg`; // Force .jpg extension
      const fullPath = path.join(PUBLIC_UPLOADS, fileName);
      
      await fs.writeFile(fullPath, Buffer.from(buffer));
      imagePath = `/uploads/projects/${fileName}`;
    }

    const updated = {
      ...project,
      title,
      location,
      description,
      image: imagePath || undefined,
      updatedAt: new Date().toISOString(),
    };

    projects[projectIndex] = updated;
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));

    return NextResponse.json({ project: updated });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

function validateImagePath(imagePath: string | undefined): boolean {
  if (!imagePath) return true;
  // Ensure path is under /uploads/projects/ only
  const normalized = path.normalize(imagePath);
  return normalized.startsWith('/uploads/projects/') && !normalized.includes('..');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Read existing projects
    const { id } = await params;
    
    // CSRF protection for DELETE
    const csrfToken = request.headers.get('x-csrf-token') || '';
    const validCsrf = await validateCsrfToken(csrfToken);
    if (!validCsrf) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }
    
    const content = await fs.readFile(PROJECTS_FILE, 'utf-8');
    const projects = JSON.parse(content);
    const projectIndex = projects.findIndex((p: any) => p.id === id);

    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const project = projects[projectIndex];

    // Delete image if exists
    if (project.image) {
      try {
        // Validate path to prevent directory traversal
        const imagePath = path.join(process.cwd(), 'public', project.image);
        const normalizedPath = path.normalize(imagePath);
        const baseDir = path.normalize(path.join(process.cwd(), 'public'));
        
        // Ensure the path is within the public directory
        if (!normalizedPath.startsWith(baseDir)) {
          throw new Error('Invalid image path');
        }
        
        await fs.unlink(normalizedPath);
      } catch (e) {
        // Ignore if file doesn't exist or path is invalid
        console.error('Error deleting image:', e);
      }
    }

    // Remove project from list
    projects.splice(projectIndex, 1);
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
