import { Track } from '@/types/track';

interface ITunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl?: string;
  trackViewUrl: string;
  releaseDate: string;
}

const GRUNGE_ARTISTS = [
  'Nirvana', 'Pearl Jam', 'Soundgarden', 'Alice in Chains',
  'Stone Temple Pilots', 'Mudhoney', 'Hole', 'Bush',
  'Silverchair', 'Foo Fighters', 'Screaming Trees', 'Mad Season',
];

async function searchByTerm(term: string): Promise<ITunesTrack[]> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=50&country=US`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
  } catch {
    return [];
  }
}

export async function getGrungeTracks(year: number): Promise<Track[]> {
  const searchTerms = [...GRUNGE_ARTISTS, 'grunge'];

  const allResults = await Promise.all(searchTerms.map(t => searchByTerm(t)));

  const seenIds = new Set<number>();
  const seenNames = new Set<string>();
  const tracks: ITunesTrack[] = [];

  for (const results of allResults) {
    for (const track of results) {
      if (!track.trackId || seenIds.has(track.trackId)) continue;
      if (!track.releaseDate) continue;
      const releaseYear = new Date(track.releaseDate).getFullYear();
      if (releaseYear !== year) continue;

      const key = `${track.artistName.toLowerCase()}::${track.trackName.toLowerCase()}`;
      if (seenNames.has(key)) continue;

      seenIds.add(track.trackId);
      seenNames.add(key);
      tracks.push(track);
    }
  }

  return tracks.slice(0, 20).map((track, index) => ({
    rank: index + 1,
    id: String(track.trackId),
    name: track.trackName,
    artist: track.artistName,
    album: track.collectionName ?? '',
    albumArt: track.artworkUrl100
      ? track.artworkUrl100.replace('100x100bb', '300x300bb')
      : '',
    previewUrl: track.previewUrl ?? null,
    externalUrl: track.trackViewUrl ?? '',
  }));
}
