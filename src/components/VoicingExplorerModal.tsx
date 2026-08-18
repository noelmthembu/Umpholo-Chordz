import { useState, useMemo } from 'react';
import type { Chord, QualityKey, VoicingCategory, VoicingEntry } from '../types';
import {
  getJazzVoicingsDatabase,
  VOICING_CATEGORIES,
} from '../theory/voicingDatabase';
import { NOTE_NAMES, midiToNoteName } from '../theory/scales';
import { QUALITY_SYMBOLS } from '../theory/chords';
import { buildSingleChordMidi, downloadMidi } from '../midi/midiWriter';
import { KeyboardVisualizer } from './KeyboardVisualizer';

interface VoicingExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuditionNotes: (midiNotes: number[]) => void;
  onAddChordToTrack?: (chord: Chord) => void;
}

export function VoicingExplorerModal({
  isOpen,
  onClose,
  onAuditionNotes,
  onAddChordToTrack,
}: VoicingExplorerModalProps) {
  const [selectedRoot, setSelectedRoot] = useState<number | 'All'>('All');
  const [selectedQuality, setSelectedQuality] = useState<QualityKey | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<VoicingCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVoicing, setActiveVoicing] = useState<VoicingEntry | null>(null);

  const database = useMemo(() => getJazzVoicingsDatabase(), []);

  const filteredVoicings = useMemo(() => {
    return database.filter((v) => {
      const matchRoot = selectedRoot === 'All' || v.rootPc === selectedRoot;
      const matchQuality = selectedQuality === 'All' || v.quality === selectedQuality;
      const matchCat = selectedCategory === 'All' || v.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        q === '' ||
        v.label.toLowerCase().includes(q) ||
        v.symbol.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.intervals.some((iv) => iv.toLowerCase().includes(q));

      return matchRoot && matchQuality && matchCat && matchQuery;
    });
  }, [database, selectedRoot, selectedQuality, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const currentInspected = activeVoicing || filteredVoicings[0] || database[0];

  const handleExportMidi = (voicing: VoicingEntry) => {
    const bytes = buildSingleChordMidi(voicing.midiNotes, 112, 24);
    const cleanSym = voicing.symbol.replace(/[^a-zA-Z0-9#b_]/g, '_');
    downloadMidi(bytes, `voicing-${voicing.rootName}-${cleanSym}-${voicing.category.slice(0, 8)}.mid`);
  };

  const handleInsertChord = (voicing: VoicingEntry) => {
    if (!onAddChordToTrack) return;
    const chord: Chord = {
      degree: 1,
      rootPc: voicing.rootPc,
      quality: voicing.quality,
      tones: [],
      symbol: voicing.symbol,
      midiNotes: voicing.midiNotes,
      startBeat: 0,
      lengthBeats: 4,
      voicingLabel: voicing.label,
      voicingCategory: voicing.category,
    };
    onAddChordToTrack(chord);
  };

  const qualities = Object.keys(QUALITY_SYMBOLS) as QualityKey[];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">1,500+ UNIQUE JAZZ CHORD VOICINGS</div>
            <h2 className="modal-title">Jazz Voicing Inspector &amp; Library</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="voicing-filters-bar">
          <div className="search-box" style={{ flex: 1.2 }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search 1,500+ voicings by formula, symbol (e.g. 7#9, 13#11, So What, Drop-2)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-select-group">
            <select
              value={selectedRoot}
              onChange={(e) => setSelectedRoot(e.target.value === 'All' ? 'All' : Number(e.target.value))}
              className="voicing-filter-select"
            >
              <option value="All">All Keys ({NOTE_NAMES.length})</option>
              {NOTE_NAMES.map((n, i) => (
                <option key={n} value={i}>
                  Key: {n}
                </option>
              ))}
            </select>

            <select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value as QualityKey | 'All')}
              className="voicing-filter-select"
            >
              <option value="All">All Qualities ({qualities.length})</option>
              {qualities.map((q) => (
                <option key={q} value={q}>
                  {QUALITY_SYMBOLS[q]}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as VoicingCategory | 'All')}
              className="voicing-filter-select"
            >
              <option value="All">All Categories ({VOICING_CATEGORIES.length})</option>
              {VOICING_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content: Split Inspector & Grid */}
        <div className="voicing-explorer-content">
          {/* Left Column: Active Voicing Inspector */}
          {currentInspected && (
            <div className="voicing-inspector-card">
              <div className="inspector-top">
                <span className="inspector-badge">{currentInspected.category}</span>
                <span className="inspector-span">{currentInspected.spanSemitones} st span</span>
              </div>

              <div className="inspector-symbol">{currentInspected.symbol}</div>
              <h3 className="inspector-label">{currentInspected.label}</h3>
              <p className="inspector-desc">{currentInspected.description}</p>

              {/* Intervals tags */}
              <div className="inspector-intervals">
                <span className="interval-label">Intervals:</span>
                {currentInspected.intervals.map((iv, idx) => (
                  <span key={idx} className="interval-tag">
                    {iv}
                  </span>
                ))}
              </div>

              {/* Pitch Classes & MIDI numbers */}
              <div className="inspector-pitches">
                <span className="interval-label">Voiced Notes:</span>
                <div className="pitch-chips">
                  {currentInspected.midiNotes.map((m, idx) => (
                    <span key={idx} className="pitch-chip">
                      {midiToNoteName(m)} <small>({m})</small>
                    </span>
                  ))}
                </div>
              </div>

              {/* Piano Keyboard Visualizer */}
              <div className="inspector-keyboard">
                <KeyboardVisualizer
                  activeMidiNotes={currentInspected.midiNotes}
                  rootPc={currentInspected.rootPc}
                  startMidi={36}
                  endMidi={88}
                />
              </div>

              {/* Inspector Actions */}
              <div className="inspector-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onAuditionNotes(currentInspected.midiNotes)}
                >
                  ▶ Audition Voicing
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => handleExportMidi(currentInspected)}
                >
                  ⬇ Single Chord MIDI
                </button>
                {onAddChordToTrack && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => handleInsertChord(currentInspected)}
                  >
                    ＋ Insert in Track
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Right Column: Voicings Grid List */}
          <div className="voicings-grid-container">
            <div className="voicings-count-banner">
              Found <strong>{filteredVoicings.length}</strong> matching jazz voicings
            </div>

            <div className="voicings-list-scroll">
              <div className="voicings-items-grid">
                {filteredVoicings.slice(0, 120).map((v) => {
                  const isCurrent = currentInspected?.id === v.id;

                  return (
                    <div
                      key={v.id}
                      className={`voicing-item-card ${isCurrent ? 'active' : ''}`}
                      onClick={() => {
                        setActiveVoicing(v);
                        onAuditionNotes(v.midiNotes);
                      }}
                    >
                      <div className="v-card-header">
                        <span className="v-sym">{v.symbol}</span>
                        <span className="v-cat-pill">{v.category.split(' ')[0]}</span>
                      </div>
                      <div className="v-label">{v.label}</div>
                      <div className="v-notes-row">
                        {v.midiNotes.map((m) => midiToNoteName(m)).join(' – ')}
                      </div>
                      <div className="v-item-actions">
                        <button
                          type="button"
                          className="btn-mini-play"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAuditionNotes(v.midiNotes);
                          }}
                        >
                          ▶ Play
                        </button>
                        <button
                          type="button"
                          className="btn-mini-midi"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportMidi(v);
                          }}
                        >
                          ⬇ MIDI
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <span className="modal-footer-note">
            Over 1,500 physically playable, hand-crafted jazz pianist voicings ready for export to any DAW (Logic, Ableton, FL Studio, Pro Tools, Cubase).
          </span>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
