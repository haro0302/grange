'use client';

import { useState, useEffect, useRef } from 'react';
import { Track } from '@/types/track';
import YearSelector from '@/components/YearSelector';
import TrackList from '@/components/TrackList';
import PlayerBar from '@/components/PlayerBar';

const FADE_MS = 800;

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
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // refs to avoid stale closures in async/event handlers
  const tracksRef = useRef<Track[]>([]);
  const currentIndexRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);
  const isFadingOutRef = useRef(false);

  useEffect(() => { tracksRef.current = tracks; }, [tracks]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setCurrentIndex(null);
    setIsPlaying(false);
    stopFade();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.volume = 1;
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

  function stopFade() {
    if (fadeRef.current) {
      clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
  }

  function fadeOut(audio: HTMLAudioElement): Promise<void> {
    stopFade();
    return new Promise(resolve => {
      if (audio.paused || audio.volume === 0) { resolve(); return; }
      const steps = 20;
      const stepMs = FADE_MS / steps;
      const startVol = audio.volume;
      let step = 0;
      fadeRef.current = setInterval(() => {
        step++;
        audio.volume = Math.max(0, startVol * (1 - step / steps));
        if (step >= steps) {
          stopFade();
          audio.volume = 0;
          resolve();
        }
      }, stepMs);
    });
  }

  function fadeIn(audio: HTMLAudioElement): Promise<void> {
    stopFade();
    audio.volume = 0;
    return new Promise(resolve => {
      const steps = 20;
      const stepMs = FADE_MS / steps;
      let step = 0;
      fadeRef.current = setInterval(() => {
        step++;
        audio.volume = Math.min(1, step / steps);
        if (step >= steps) {
          stopFade();
          audio.volume = 1;
          resolve();
        }
      }, stepMs);
    });
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || !isPlayingRef.current || isFadingOutRef.current) return;
    if (isNaN(audio.duration)) return;

    const timeLeft = audio.duration - audio.currentTime;
    if (timeLeft <= FADE_MS / 1000 + 0.1) {
      isFadingOutRef.current = true;
      fadeOut(audio);
    }
  }

  async function playAt(index: number, trackList: Track[]) {
    const track = trackList[index];
    if (!track) return;

    if (!track.previewUrl) {
      const next = findNextPlayable(trackList, index);
      if (next !== null) playAt(next, trackList);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    isFadingOutRef.current = false;

    if (!audio.paused) {
      await fadeOut(audio);
      audio.pause();
    }

    audio.src = track.previewUrl;
    audio.play().catch(() => {});
    setCurrentIndex(index);
    setIsPlaying(true);
    await fadeIn(audio);
  }

  async function handleTrackClick(index: number) {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentIndexRef.current === index) {
      if (isPlayingRef.current) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().catch(() => {});
        setIsPlaying(true);
      }
      return;
    }

    await playAt(index, tracksRef.current);
  }

  async function handleEnded() {
    const list = tracksRef.current;
    const idx = currentIndexRef.current;
    if (idx === null) return;

    isFadingOutRef.current = false;

    const next = findNextPlayable(list, idx);
    if (next !== null) {
      const audio = audioRef.current;
      const track = list[next];
      if (!audio || !track?.previewUrl) return;

      // Already faded out by timeupdate — just switch and fade in
      audio.src = track.previewUrl;
      audio.volume = 0;
      audio.play().catch(() => {});
      setCurrentIndex(next);
      setIsPlaying(true);
      await fadeIn(audio);
    } else {
      if (audioRef.current) audioRef.current.volume = 1;
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

      <audio ref={audioRef} onEnded={handleEnded} onTimeUpdate={handleTimeUpdate} />
    </main>
  );
}
