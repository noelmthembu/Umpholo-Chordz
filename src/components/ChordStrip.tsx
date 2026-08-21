import type { Chord } from '../types';
import { midiToNoteName } from '../theory/scales';

interface ChordStripProps {
  chords: Chord[];
  activeChordIndex?: number | null;
  onAuditionChord?: (chord: Chord) => void;
  onMoveChord?: (fromIndex: number, toIndex: number) => void;
  onRemoveChord?: (index: number) => void;
  onRevoiceChord?: (index: number) => void;
}

function noteGroups(chord: Chord): { bass: number[]; upper: number[] } {
  const bass = chord.bassMidiNotes?.length ? chord.bassMidiNotes : chord.midiNotes.slice(0, 1);
  const upper = chord.upperMidiNotes?.length ? chord.upperMidiNotes : chord.midiNotes.slice(bass.length);
  return { bass, upper };
}

export function ChordStrip({
  chords,
  activeChordIndex,
  onAuditionChord,
  onMoveChord,
  onRemoveChord,
  onRevoiceChord,
}: ChordStripProps) {
  if (chords.length === 0) {
    return (
      <div className="chord-strip">
        <div className="empty-note">No progression yet — hit "Generate Chords" or choose from the 150 Presets.</div>
      </div>
    );
  }

  return (
    <div className="chord-strip" aria-label="Chord progression arranger">
      {chords.map((chord, index) => {
        const isActive = activeChordIndex === index;
        const category = chord.voicingCategory ? chord.voicingCategory.split(' ')[0] : 'Voicing';
        const { bass, upper } = noteGroups(chord);

        return (
          <article className={`chord-card ${isActive ? 'active-playing' : ''}`} key={`${chord.symbol}-${index}`}>
            <button
              type="button"
              className="chord-card-main"
              onClick={() => onAuditionChord?.(chord)}
              aria-label={`Audition bar ${index + 1}: ${chord.symbol}`}
              title="Audition this chord"
            >
              <div className="deg">
                BAR {index + 1} {chord.degree >= 0 ? `· deg ${chord.degree + 1}` : ''}
              </div>
              <div className="sym display">{chord.symbol}</div>

              {chord.voicingLabel && (
                <div className="chord-voicing-badge" title={chord.voicingLabel}>
                  {category}
                </div>
              )}

              <div className="chord-register-preview">
                <span><strong>Bass</strong> {bass.map(midiToNoteName).join(' ')}</span>
                <span><strong>RH</strong> {upper.map(midiToNoteName).join(' ')}</span>
              </div>
            </button>

            <div className="chord-arranger" role="group" aria-label={`Arrange bar ${index + 1}: ${chord.symbol}`}>
              <button
                type="button"
                className="arrange-control"
                onClick={() => onMoveChord?.(index, index - 1)}
                disabled={index === 0}
                aria-label={`Move ${chord.symbol} left`}
                title="Move left"
              >
                ←
              </button>
              <button
                type="button"
                className="arrange-control revoice-control"
                onClick={() => onRevoiceChord?.(index)}
                aria-label={`Revoice ${chord.symbol}`}
                title="Choose another voice-led full piano shape"
              >
                Voice
              </button>
              <button
                type="button"
                className="arrange-control"
                onClick={() => onMoveChord?.(index, index + 1)}
                disabled={index === chords.length - 1}
                aria-label={`Move ${chord.symbol} right`}
                title="Move right"
              >
                →
              </button>
              <button
                type="button"
                className="arrange-control remove-control"
                onClick={() => onRemoveChord?.(index)}
                aria-label={`Remove ${chord.symbol}`}
                title="Remove chord"
              >
                ×
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
