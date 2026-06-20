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

const ROCK_ARTISTS = [
  // Core grunge
  'Nirvana', 'Pearl Jam', 'Soundgarden', 'Alice in Chains',
  'Stone Temple Pilots', 'Mudhoney', 'Hole', 'Bush',
  'Silverchair', 'Foo Fighters', 'Screaming Trees', 'Mad Season',
  'Candlebox', 'Blind Melon', 'Temple of the Dog',
  // Alternative rock
  'Smashing Pumpkins', 'Rage Against the Machine', 'Beck',
  'Nine Inch Nails', 'Radiohead', 'Red Hot Chili Peppers',
  'Green Day', 'Weezer', 'Garbage', 'Soul Asylum',
  'Live', 'Collective Soul', 'Toadies', 'Sonic Youth',
  'Pixies', 'PJ Harvey', 'Mazzy Star', 'The Breeders',
  'Alanis Morissette', 'Filter', 'Tool', 'Everclear',
  'Offspring', 'Sublime', 'No Doubt', 'Counting Crows',
  'Veruca Salt', 'Dinosaur Jr', 'Liz Phair',
  // Early 90s
  "Jane's Addiction", 'Ministry', 'Primus', 'Afghan Whigs',
  'Babes in Toyland', 'Helmet', 'Pavement', 'Sebadoh',
  'Belly', 'Buffalo Tom', 'Throwing Muses', 'Guided By Voices',
  'Urge Overkill', 'Meat Puppets', 'Built to Spill',
  'Faith No More', 'Social Distortion', 'The Replacements',
  'Living Colour', 'My Bloody Valentine', 'Dinosaur Jr',
  // Late 90s
  'Matchbox Twenty', 'Third Eye Blind', 'Goo Goo Dolls',
  'Semisonic', 'Harvey Danger', 'Our Lady Peace', 'Fastball',
  'Incubus', 'Deftones', 'Placebo', 'Elastica', 'Oasis',
  // 2000s
  'The Strokes', 'The White Stripes', 'Queens of the Stone Age',
  'System of a Down', 'Audioslave', 'Linkin Park',
  'Jimmy Eat World', 'Default', 'Lifehouse', 'Fuel',
  'Puddle of Mudd', 'Creed', 'Nickelback', 'Staind',
];

async function searchByArtist(artist: string): Promise<ITunesTrack[]> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&attribute=artistTerm&entity=song&limit=50&country=US`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    const artistLower = artist.toLowerCase();
    return (data.results ?? []).filter(
      (t: ITunesTrack) => t.artistName.toLowerCase() === artistLower
    );
  } catch {
    return [];
  }
}

export async function getGrungeTracks(year: number): Promise<Track[]> {
  const allResults = await Promise.all(ROCK_ARTISTS.map(a => searchByArtist(a)));

  const seenIds = new Set<number>();
  const seenArtists = new Set<string>();
  const tracks: ITunesTrack[] = [];

  for (const results of allResults) {
    for (const track of results) {
      if (!track.trackId || seenIds.has(track.trackId)) continue;
      if (!track.releaseDate) continue;
      const releaseYear = new Date(track.releaseDate).getFullYear();
      if (releaseYear !== year) continue;

      const artistKey = track.artistName.toLowerCase();
      if (seenArtists.has(artistKey)) continue;

      seenIds.add(track.trackId);
      seenArtists.add(artistKey);
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
