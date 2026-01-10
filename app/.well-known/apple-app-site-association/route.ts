import { NextResponse } from 'next/server';

export async function GET() {
  const aasa = {
    applinks: {
      apps: [],
      details: []
    },
    webcredentials: {
      apps: []
    }
  };

  return new NextResponse(JSON.stringify(aasa), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
