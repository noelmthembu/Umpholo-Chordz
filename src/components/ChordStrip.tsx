import type { Chord } from '../types';

interface ChordStripProps {
  chords: Chord[];
}

export function ChordStrip({ chords }: ChordStripProps) {
  if (chords.length === 0) {
    return (
      <div className="chord-strip">
        <div className="empty-note">No progression yet — hit "Generate Chords + Freestyle" to begin.</div>
      </div>
    );
  }

  return (
    <div className="chord-strip">
      {chords.map((c, i) => (
        <div className="chord-card" key={i}>
          <div className="deg">
            BAR {i + 1} · deg {c.degree + 1}
          </div>
          <div className="sym display">{c.symbol}</div>
        </div>
      ))}
    </div>
  );
}
