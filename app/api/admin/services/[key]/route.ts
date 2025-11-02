import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import fs from 'fs/promises';
import path from 'path';

const SERVICES_CONFIG_FILE = path.join(process.cwd(), 'data', 'services.json');

// Ensure file exists
async function ensureServicesFile() {
  try {
    await fs.access(SERVICES_CONFIG_FILE);
  } catch {
    // Create default services file if it doesn't exist
    const defaultServices = {
      construction: {
        title: 'Roof Construction',
        description: 'Professional roof construction services using premium materials.',
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
    await fs.writeFile(SERVICES_CONFIG_FILE, JSON.stringify(defaultServices, null, 2));
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  // Check admin authentication
  const authenticated = isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    const content = await fs.readFile(SERVICES_CONFIG_FILE, 'utf-8');
    const services = JSON.parse(content);

    // Update the specific service
    if (!services[params.key]) {
      return NextResponse.json(
        { error: `Service key "${params.key}" not found` },
        { status: 404 }
      );
    }

    services[params.key] = {
      title,
      description,
    };

    // Write back to file
    await fs.writeFile(SERVICES_CONFIG_FILE, JSON.stringify(services, null, 2));

    return NextResponse.json({
      success: true,
      service: { key: params.key, ...services[params.key] },
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}
