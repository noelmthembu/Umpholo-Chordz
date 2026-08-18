import { useState } from 'react';
import type { Chord, InstrumentKey, ModulationSuggestion } from '../types';
import { NOTE_NAMES } from '../theory/scales';
import { getSuggestedModulations } from '../theory/modulations';
import { buildMidiFile, downloadMidi } from '../midi/midiWriter';

interface ModulationsPanelProps {
  currentRootPc: number;
  bpm: number;
  chordInstrument: InstrumentKey;
  onPreviewChords: (chords: Chord[]) => void;
  onAppendChords: (chords: Chord[]) => void;
  onSetRootKey?: (rootPc: number) => void;
}

export function ModulationsPanel({
  currentRootPc,
  bpm,
  onPreviewChords,
  onAppendChords,
  onSetRootKey,
}: ModulationsPanelProps) {
  const rootName = NOTE_NAMES[currentRootPc];
  const modulations = getSuggestedModulations(currentRootPc);
  const [selectedModId, setSelectedModId] = useState<string | null>(null);

  const handleExportModulationMidi = (mod: ModulationSuggestion) => {
    const bytes = buildMidiFile(mod.transitionChords, {
      bpm,
      cascadeMs: 24,
      trackName: `Modulation: ${mod.title}`,
    });
    const filename = `modulation-${rootName}-to-${mod.targetKeyName}-${Date.now()}.mid`;
    downloadMidi(bytes, filename);
  };

  return (
    <div className="modulations-section panel">
      <div className="modulations-header">
        <div>
          <div className="mod-eyebrow">HARMONIC INTELLIGENCE</div>
          <h2 className="mod-title">Suggested Modulations &amp; Reharmonizations</h2>
        </div>
        <div className="current-key-pill">
          Current Key: <strong>{rootName} Major / Jazz Tonic</strong>
        </div>
      </div>

      <p className="hint">
        Intelligent voice-led transition pathways to smoothly modulate or reharmonize from {rootName}. Preview any modulation in real-time or append its chords directly into your progression.
      </p>

      <div className="modulations-grid">
        {modulations.map((mod) => {
          const isSelected = selectedModId === mod.id;

          return (
            <div
              key={mod.id}
              className={`mod-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedModId(mod.id)}
            >
              <div className="mod-card-top">
                <span className="mod-concept-tag">{mod.harmonicConcept}</span>
                <span className="mod-target-key">Target: {mod.targetKeyName}</span>
              </div>

              <h4 className="mod-card-title">{mod.title}</h4>
              <p className="mod-explanation">{mod.explanation}</p>

              {/* Chords preview strip */}
              <div className="mod-chord-pills">
                {mod.transitionChords.map((c, i) => (
                  <span key={i} className="mod-chord-pill">
                    {c.symbol}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mod-card-actions">
                <button
                  type="button"
                  className="btn-mod-action btn-mod-play"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreviewChords(mod.transitionChords);
                  }}
                  title="Preview audio of this modulation transition"
                >
                  ▶ Preview
                </button>

                <button
                  type="button"
                  className="btn-mod-action btn-mod-append"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAppendChords(mod.transitionChords);
                    if (onSetRootKey) onSetRootKey(mod.targetRootPc);
                  }}
                  title="Append these transition chords to the active progression"
                >
                  ＋ Append to Track
                </button>

                <button
                  type="button"
                  className="btn-mod-action btn-mod-midi"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportModulationMidi(mod);
                  }}
                  title="Export this modulation transition as a MIDI file"
                >
                  ⬇ MIDI
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
