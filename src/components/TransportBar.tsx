interface TransportBarProps {
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
}

export function TransportBar({ isPlaying, onPlay, onStop }: TransportBarProps) {
  return (
    <div className="transport">
      <button className={isPlaying ? 'playing' : ''} onClick={onPlay} title="Play">
        ▶
      </button>
      <button onClick={onStop} title="Stop">
        ■
      </button>
    </div>
  );
}
