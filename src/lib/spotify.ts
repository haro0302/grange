import { Track } from '@/types/track';

const GRUNGE_ARTISTS = [
  'nirvana', 'pearl jam', 'soundgarden', 'alice in chains',
  'stone temple pilots', 'mudhoney', 'screaming trees', 'dinosaur jr',
  'l7', 'hole', 'bush', 'silverchair', 'foo fighters', 'live',
  'candlebox', 'smashing pumpkins', 'blind melon', 'mad season',
  'temple of the dog', 'chris cornell', 'eddie vedder', 'layne staley',
];

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  preview_url: string | null;
  external_urls: { spotify: string };
  popularity: number;
}

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) throw new Error(`Spotify auth failed: ${res.status}`);

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken!;
}

function isGrungeArtist(artistName: string): boolean {
  const lower = artistName.toLowerCase();
  return GRUNGE_ARTISTS.some(a => lower.includes(a) || a.includes(lower));
}

export async function getGrungeTracks(year: number): Promise<Track[]> {
  const token = await getAccessToken();
  const headers = { Authorization: `Bearer ${token}` };

  const url = `https://api.spotify.com/v1/search?q=grunge+year:${year}&type=track&limit=50`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Spotify search failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  const items: SpotifyTrack[] = data.tracks?.items ?? [];

  const known: SpotifyTrack[] = [];
  const others: SpotifyTrack[] = [];

  const seen = new Set<string>();
  for (const track of items) {
    if (seen.has(track.id)) continue;
    seen.add(track.id);

    const hasGrungeArtist = track.artists.some(a => isGrungeArtist(a.name));
    if (hasGrungeArtist) known.push(track);
    else others.push(track);
  }

  const sorted = [
    ...known.sort((a, b) => b.popularity - a.popularity),
    ...others.sort((a, b) => b.popularity - a.popularity),
  ].slice(0, 20);

  return sorted.map((track, index) => ({
    rank: index + 1,
    id: track.id,
    name: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    album: track.album.name,
    albumArt: track.album.images[1]?.url ?? track.album.images[0]?.url ?? '',
    previewUrl: track.preview_url,
    externalUrl: track.external_urls.spotify,
  }));
}
