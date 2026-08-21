import type { Chord } from '../types';
import { midiToNoteName } from '../theory/scales';

interface ChordStripProps {
  chords: Chord[];
  activeChordIndex?: number | null;
  onAuditionChord?: (chord: Chord) => void;
}

export function ChordStrip({ chords, activeChordIndex, onAuditionChord }: ChordStripProps) {
  if (chords.length === 0) {
    return (
      <div className="chord-strip">
        <div className="empty-note">No progression yet — hit "Generate Chords" or choose from the 150 Presets.</div>
      </div>
    );
  }

  return (
    <div className="chord-strip">
      {chords.map((c, i) => {
        const isActive = activeChordIndex === i;
        const cat = c.voicingCategory ? c.voicingCategory.split(' ')[0] : 'Voicing';

        return (
          <button
            type="button"
            className={`chord-card ${isActive ? 'active-playing' : ''}`}
            key={i}
            onClick={() => onAuditionChord?.(c)}
            aria-label={`Audition bar ${i + 1}: ${c.symbol}`}
          >
            <div className="deg">
              BAR {i + 1} {c.degree >= 0 ? `· deg ${c.degree + 1}` : ''}
            </div>
            <div className="sym display">{c.symbol}</div>

            {c.voicingLabel && (
              <div className="chord-voicing-badge" title={c.voicingLabel}>
                {cat}
              </div>
            )}

            <div className="chord-notes-preview">
              {c.midiNotes.map((m) => midiToNoteName(m)).join(' ')}
            </div>
          </button>
        );
      })}
    </div>
  );
}
