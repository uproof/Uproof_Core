import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import fs from 'fs/promises';
import path from 'path';

const PROJECTS_FILE = path.join(process.cwd(), 'data', 'projects-admin.json');
const PUBLIC_UPLOADS = path.join(process.cwd(), 'public', 'uploads', 'projects');

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authenticated = isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
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
    const projectIndex = projects.findIndex((p: any) => p.id === params.id);

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
      // Delete old image if exists
      if (project.image) {
        try {
          const oldPath = path.join(process.cwd(), 'public', project.image);
          await fs.unlink(oldPath);
        } catch {
          // Ignore if file doesn't exist
        }
      }

      const buffer = await imageFile.arrayBuffer();
      const ext = imageFile.name.split('.').pop() || 'jpg';
      const fileName = `${params.id}.${ext}`;
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authenticated = isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Read existing projects
    const content = await fs.readFile(PROJECTS_FILE, 'utf-8');
    const projects = JSON.parse(content);
    const projectIndex = projects.findIndex((p: any) => p.id === params.id);

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
        const imagePath = path.join(process.cwd(), 'public', project.image);
        await fs.unlink(imagePath);
      } catch {
        // Ignore if file doesn't exist
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
