import { NextRequest, NextResponse } from 'next/server';
import { getGrungeTracks } from '@/lib/itunes';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get('year');
  const year = yearParam ? parseInt(yearParam, 10) : 1994;

  if (isNaN(year) || year < 1990 || year > 2002) {
    return NextResponse.json({ error: 'Invalid year. Must be between 1990 and 2002.' }, { status: 400 });
  }

  try {
    const tracks = await getGrungeTracks(year);
    return NextResponse.json(tracks);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch tracks from Spotify.' }, { status: 500 });
  }
}
