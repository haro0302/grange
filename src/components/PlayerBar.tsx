'use client';

import { Track } from '@/types/track';
import Image from 'next/image';

type Props = {
  track: Track;
  isPlaying: boolean;
  onToggle: () => void;
};

export default function PlayerBar({ track, isPlaying, onToggle }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-grunge-card border-t border-grunge-border px-4 py-3 flex items-center gap-4 z-50">
      <div className="w-10 h-10 shrink-0 overflow-hidden bg-grunge-rank">
        {track.albumArt && (
          <Image
            src={track.albumArt}
            alt={track.album}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-grunge-accent text-sm font-medium truncate">{track.name}</p>
        <p className="text-grunge-muted text-xs truncate">{track.artist}</p>
      </div>

      <div className="shrink-0 flex items-center gap-3">
        <span className="text-grunge-muted font-mono text-xs tracking-widest uppercase select-none">
          30s preview
        </span>
        <button
          onClick={onToggle}
          className="text-grunge-accent font-mono text-lg w-8 text-center hover:text-grunge-text transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>
    </div>
  );
}
