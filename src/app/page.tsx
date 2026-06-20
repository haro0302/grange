'use client';

import { useState, useEffect, useRef } from 'react';
import { Track } from '@/types/track';
import YearSelector from '@/components/YearSelector';
import TrackList from '@/components/TrackList';
import PlayerBar from '@/components/PlayerBar';

function findNextPlayable(tracks: Track[], fromIndex: number): number | null {
  for (let i = fromIndex + 1; i < tracks.length; i++) {
    if (tracks[i].previewUrl) return i;
  }
  return null;
}

export default function Home() {
  const [year, setYear] = useState(1994);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setCurrentIndex(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    fetch(`/api/tracks?year=${year}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then((data: Track[]) => {
        setTracks(data);
        setLoading(false);
      })
      .catch(() => {
        setError('楽曲の取得に失敗しました。');
        setLoading(false);
      });
  }, [year]);

  function playAt(index: number) {
    const track = tracks[index];
    if (!track) return;

    if (!track.previewUrl) {
      const next = findNextPlayable(tracks, index);
      if (next !== null) playAt(next);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    audio.src = track.previewUrl;
    audio.play().catch(() => {});
    setCurrentIndex(index);
    setIsPlaying(true);
  }

  function handleTrackClick(index: number) {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentIndex === index) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().catch(() => {});
        setIsPlaying(true);
      }
      return;
    }

    playAt(index);
  }

  function handleEnded() {
    if (currentIndex === null) return;
    const next = findNextPlayable(tracks, currentIndex);
    if (next !== null) {
      playAt(next);
    } else {
      setCurrentIndex(null);
      setIsPlaying(false);
    }
  }

  return (
    <main className="min-h-screen bg-grunge-bg text-grunge-text pb-24">
      <header className="border-b border-grunge-border px-6 py-5">
        <p className="text-grunge-muted font-mono text-xs tracking-widest uppercase mb-1">
          Rock Essentials 1990–2002
        </p>
        <h1 className="text-grunge-accent font-mono text-xl tracking-wide">
          年代別 90sロック名曲 Top 20
        </h1>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <YearSelector year={year} onChange={setYear} />

        {loading && (
          <div className="text-center text-grunge-muted font-mono text-sm tracking-widest py-20">
            Loading...
          </div>
        )}

        {error && !loading && (
          <div className="text-center text-grunge-muted font-mono text-sm py-20">
            {error}
          </div>
        )}

        {!loading && !error && tracks.length === 0 && (
          <div className="text-center text-grunge-muted font-mono text-sm tracking-widest py-20">
            No tracks found for {year}.
          </div>
        )}

        {!loading && !error && tracks.length > 0 && (
          <TrackList
            tracks={tracks}
            currentIndex={currentIndex}
            isPlaying={isPlaying}
            onTrackClick={handleTrackClick}
          />
        )}
      </div>

      {currentIndex !== null && tracks[currentIndex] && (
        <PlayerBar
          track={tracks[currentIndex]}
          isPlaying={isPlaying}
          onToggle={() => handleTrackClick(currentIndex)}
        />
      )}

      <audio ref={audioRef} onEnded={handleEnded} />
    </main>
  );
}
