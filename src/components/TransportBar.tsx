import { Icon } from './Icon';

interface TransportBarProps {
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
}

export function TransportBar({ isPlaying, onPlay, onStop }: TransportBarProps) {
  return (
    <div className="transport" role="group" aria-label="Progression playback">
      <button
        type="button"
        className={`icon-button transport-button ${isPlaying ? 'playing' : ''}`}
        onClick={onPlay}
        aria-label={isPlaying ? 'Restart progression playback' : 'Play progression'}
      >
        <Icon name="play" aria-hidden="true" />
      </button>
      <button type="button" className="icon-button transport-button" onClick={onStop} aria-label="Stop progression playback">
        <Icon name="stop" aria-hidden="true" />
      </button>
    </div>
  );
}
