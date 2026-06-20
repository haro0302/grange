import { Track } from '@/types/track';
import TrackCard from './TrackCard';

type Props = {
  tracks: Track[];
  currentIndex: number | null;
  isPlaying: boolean;
  onTrackClick: (index: number) => void;
};

export default function TrackList({ tracks, currentIndex, isPlaying, onTrackClick }: Props) {
  return (
    <div className="divide-y divide-grunge-border">
      {tracks.map((track, index) => (
        <TrackCard
          key={track.id}
          track={track}
          isActive={currentIndex === index}
          isPlaying={isPlaying && currentIndex === index}
          onClick={() => onTrackClick(index)}
        />
      ))}
    </div>
  );
}
