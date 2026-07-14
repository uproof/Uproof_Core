import { NextRequest, NextResponse } from 'next/server';
import { isSuperadminAuthenticated } from '@/lib/adminAuth';
import path from 'path';
import {readJsonFile, writeJsonFile} from '@/lib/jsonFileStore';

const SERVICES_CONFIG_FILE = path.join(process.cwd(), 'data', 'services.json');

// Ensure file exists
async function ensureServicesFile() {
  try {
    await import('fs/promises').then((fs) => fs.access(SERVICES_CONFIG_FILE));
  } catch {
    // Create default services file if it doesn't exist
    const defaultServices = {
      construction: {
        title: 'Roof Construction',
        description: 'Professional roof construction services using premium materials.',
      },
      roofStructure: {
        title: 'Roof Structure Installation',
        description: 'Installation of prefabricated roof trusses and timber roof structures.',
      },
      painting: {
        title: 'Roof Painting',
        description: 'High-quality roof painting to extend lifespan and enhance appearance.',
      },
      maintenance: {
        title: 'Roof Maintenance',
        description: 'Regular maintenance to prevent leaks and extend roof life.',
      },
      metalProfile: {
        title: 'Metal Profile Installation',
        description: 'Modern metal profile roofing for durability and style.',
      },
      tiledRoof: {
        title: 'Tiled Roofs',
        description: 'Premium tile roofing options for protection and aesthetics.',
      },
      skylights: {
        title: 'Skylights Installation',
        description: 'Add natural light with professional skylight installation.',
      },
      gutterSystem: {
        title: 'Gutter Systems',
        description: 'Efficient gutter and drainage system installation and repair.',
      },
      snowRemoval: {
        title: 'Snow Removal',
        description: 'Safe snow removal services to protect your roof.',
      },
      leafCleaning: {
        title: 'Leaf Cleaning',
        description: 'Professional leaf and debris removal from gutters and roof.',
      },
    };
    await writeJsonFile(SERVICES_CONFIG_FILE, defaultServices);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  // Check admin authentication
  const authenticated = await isSuperadminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await ensureServicesFile();
    const body = await request.json();
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Read current services
    const services = await readJsonFile<Record<string, {title: string; description: string}>>(SERVICES_CONFIG_FILE, {});

    const { key } = await params;

    // Update the specific service
    if (!services[key]) {
      return NextResponse.json(
        { error: `Service key "${key}" not found` },
        { status: 404 }
      );
    }

    services[key] = {
      title,
      description,
    };

    // Write back to file
    await writeJsonFile(SERVICES_CONFIG_FILE, services);

    return NextResponse.json({
      success: true,
      service: { key, ...services[key] },
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}
