'use client';

import { Track } from '@/types/track';
import Image from 'next/image';

type Props = {
  track: Track;
  isActive: boolean;
  isPlaying: boolean;
  onClick: () => void;
};

export default function TrackCard({ track, isActive, isPlaying, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`
        group flex items-center gap-4 px-4 py-3 cursor-pointer
        border-l-2 transition-colors duration-150
        ${isActive
          ? 'bg-grunge-playing border-grunge-accent'
          : 'bg-grunge-card border-transparent hover:bg-grunge-card-hover'
        }
        ${!track.previewUrl ? 'opacity-60 cursor-default' : ''}
      `}
    >
      <span className="w-8 text-right font-mono text-base font-bold text-grunge-muted shrink-0 select-none">
        {String(track.rank).padStart(2, '0')}
      </span>

      <div className="w-12 h-12 shrink-0 overflow-hidden bg-grunge-rank">
        {track.albumArt && (
          <Image
            src={track.albumArt}
            alt={track.album}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate text-sm ${isActive ? 'text-grunge-accent' : 'text-grunge-text'}`}>
          {track.name}
        </p>
        <p className="text-grunge-muted text-xs truncate mt-0.5">
          {track.artist} · {track.album}
        </p>
      </div>

      <div className="shrink-0 w-6 text-center select-none">
        {!track.previewUrl ? (
          <span className="text-grunge-rank text-xs">—</span>
        ) : isActive && isPlaying ? (
          <span className="text-grunge-accent text-sm">⏸</span>
        ) : (
          <span className={`text-xs transition-colors ${isActive ? 'text-grunge-accent' : 'text-grunge-rank group-hover:text-grunge-accent'}`}>
            ▶
          </span>
        )}
      </div>
    </div>
  );
}
