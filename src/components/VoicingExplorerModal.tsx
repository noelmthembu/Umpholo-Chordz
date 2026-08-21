import { useMemo, useState } from 'react';
import type { Chord, QualityKey, VoicingCategory, VoicingEntry } from '../types';
import { getJazzVoicingsDatabase, VOICING_CATEGORIES } from '../theory/voicingDatabase';
import { NOTE_NAMES, midiToNoteName } from '../theory/scales';
import { QUALITY_SYMBOLS } from '../theory/chords';
import { buildSingleChordMidi, downloadMidi } from '../midi/midiWriter';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import { Icon } from './Icon';
import { KeyboardVisualizer } from './KeyboardVisualizer';

interface VoicingExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuditionNotes: (midiNotes: number[]) => void;
  onAddChordToTrack?: (chord: Chord) => void;
}

export function VoicingExplorerModal({ isOpen, onClose, onAuditionNotes, onAddChordToTrack }: VoicingExplorerModalProps) {
  const [selectedRoot, setSelectedRoot] = useState<number | 'All'>('All');
  const [selectedQuality, setSelectedQuality] = useState<QualityKey | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<VoicingCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVoicing, setActiveVoicing] = useState<VoicingEntry | null>(null);
  const dialogRef = useAccessibleDialog({ isOpen, onClose });

  const database = useMemo(() => getJazzVoicingsDatabase(), []);
  const filteredVoicings = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return database.filter((voicing) => {
      const matchesRoot = selectedRoot === 'All' || voicing.rootPc === selectedRoot;
      const matchesQuality = selectedQuality === 'All' || voicing.quality === selectedQuality;
      const matchesCategory = selectedCategory === 'All' || voicing.category === selectedCategory;
      const matchesQuery =
        query === '' ||
        voicing.label.toLowerCase().includes(query) ||
        voicing.symbol.toLowerCase().includes(query) ||
        voicing.category.toLowerCase().includes(query) ||
        voicing.description.toLowerCase().includes(query) ||
        voicing.intervals.some((interval) => interval.toLowerCase().includes(query));
      return matchesRoot && matchesQuality && matchesCategory && matchesQuery;
    });
  }, [database, searchQuery, selectedCategory, selectedQuality, selectedRoot]);

  const inspectedVoicing = activeVoicing && filteredVoicings.some((voicing) => voicing.id === activeVoicing.id)
    ? activeVoicing
    : filteredVoicings[0] ?? null;
  const qualities = Object.keys(QUALITY_SYMBOLS) as QualityKey[];

  if (!isOpen) return null;

  const exportVoicing = (voicing: VoicingEntry) => {
    const bytes = buildSingleChordMidi(voicing.midiNotes, 112, 24);
    const safeSymbol = voicing.symbol.replace(/[^a-zA-Z0-9#b_]/g, '_');
    downloadMidi(bytes, `voicing-${voicing.rootName}-${safeSymbol}-${voicing.category.slice(0, 8)}.mid`);
  };

  const insertVoicing = (voicing: VoicingEntry) => {
    if (!onAddChordToTrack) return;
    onAddChordToTrack({
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
    });
  };

  const selectVoicing = (voicing: VoicingEntry) => {
    setActiveVoicing(voicing);
    onAuditionNotes(voicing.midiNotes);
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        className="modal-dialog modal-large voicing-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="voicings-dialog-title"
        aria-describedby="voicings-dialog-description"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="modal-eyebrow">Voicing library</p>
            <h2 id="voicings-dialog-title" className="modal-title">Jazz voicing explorer</h2>
            <p id="voicings-dialog-description" className="modal-description">
              Filter a practical chord vocabulary, inspect the notes, then audition, export, or add a voicing to your progression.
            </p>
          </div>
          <button type="button" className="icon-button modal-close-btn" onClick={onClose} aria-label="Close voicing library">
            <Icon name="close" aria-hidden="true" />
          </button>
        </header>

        <div className="voicing-filters-bar">
          <label className="search-box" htmlFor="voicing-search">
            <Icon name="search" className="search-icon" aria-hidden="true" />
            <span className="sr-only">Search voicings</span>
            <input
              id="voicing-search"
              type="search"
              placeholder="Search a symbol, category, or interval"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="search-input"
            />
          </label>
          <div className="filter-select-group">
            <label><span>Root</span><select value={selectedRoot} onChange={(event) => setSelectedRoot(event.target.value === 'All' ? 'All' : Number(event.target.value))}>
              <option value="All">All keys</option>{NOTE_NAMES.map((note, index) => <option key={note} value={index}>{note}</option>)}
            </select></label>
            <label><span>Quality</span><select value={selectedQuality} onChange={(event) => setSelectedQuality(event.target.value as QualityKey | 'All')}>
              <option value="All">All qualities</option>{qualities.map((quality) => <option key={quality} value={quality}>{QUALITY_SYMBOLS[quality]}</option>)}
            </select></label>
            <label><span>Shape</span><select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value as VoicingCategory | 'All')}>
              <option value="All">All shapes</option>{VOICING_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select></label>
          </div>
        </div>

        {inspectedVoicing ? (
          <div className="voicing-explorer-content">
            <aside className="voicing-inspector-card" aria-label="Selected voicing details">
              <div className="inspector-top">
                <span className="status-label">{inspectedVoicing.category}</span>
                <span className="inspector-span">{inspectedVoicing.spanSemitones} semitone span</span>
              </div>
              <div className="inspector-symbol">{inspectedVoicing.symbol}</div>
              <h3 className="inspector-label">{inspectedVoicing.label}</h3>
              <p className="inspector-desc">{inspectedVoicing.description}</p>
              <div className="inspector-intervals">
                <span className="interval-label">Intervals</span>
                <div>{inspectedVoicing.intervals.map((interval, index) => <span key={`${interval}-${index}`} className="interval-tag">{interval}</span>)}</div>
              </div>
              <div className="inspector-pitches">
                <span className="interval-label">Voiced notes</span>
                <div className="pitch-chips">{inspectedVoicing.midiNotes.map((midi, index) => <span key={`${midi}-${index}`} className="pitch-chip">{midiToNoteName(midi)} <small>{midi}</small></span>)}</div>
              </div>
              <div className="inspector-keyboard"><KeyboardVisualizer activeMidiNotes={inspectedVoicing.midiNotes} rootPc={inspectedVoicing.rootPc} startMidi={36} endMidi={88} /></div>
              <div className="inspector-actions">
                <button type="button" className="btn btn-primary" onClick={() => onAuditionNotes(inspectedVoicing.midiNotes)}><Icon name="play" aria-hidden="true" /> Audition</button>
                {onAddChordToTrack ? <button type="button" className="btn btn-ghost" onClick={() => insertVoicing(inspectedVoicing)}><Icon name="add" aria-hidden="true" /> Add to progression</button> : null}
                <button type="button" className="btn btn-ghost" onClick={() => exportVoicing(inspectedVoicing)}><Icon name="download" aria-hidden="true" /> Export MIDI</button>
              </div>
            </aside>

            <section className="voicings-grid-container" aria-label="Matching voicings">
              <p className="voicings-count-banner" aria-live="polite"><strong>{filteredVoicings.length}</strong> matching voicings</p>
              <div className="voicings-list-scroll">
                <div className="voicings-items-grid">
                  {filteredVoicings.slice(0, 120).map((voicing) => {
                    const isSelected = inspectedVoicing.id === voicing.id;
                    return (
                      <button
                        key={voicing.id}
                        type="button"
                        className={`voicing-item-card ${isSelected ? 'active' : ''}`}
                        onClick={() => selectVoicing(voicing)}
                        aria-pressed={isSelected}
                      >
                        <span className="v-card-header"><span className="v-sym">{voicing.symbol}</span><span className="v-cat-pill">{voicing.category.split(' ')[0]}</span></span>
                        <span className="v-label">{voicing.label}</span>
                        <span className="v-notes-row">{voicing.midiNotes.map((midi) => midiToNoteName(midi)).join(' – ')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="library-empty" role="status"><strong>No voicings match these filters.</strong><span>Broaden a filter or clear the search.</span><button type="button" className="text-button" onClick={() => { setSearchQuery(''); setSelectedRoot('All'); setSelectedQuality('All'); setSelectedCategory('All'); }}>Reset filters</button></div>
        )}

        <footer className="modal-footer">
          <p className="modal-footer-note">The first 120 matches are shown to keep this browser-based library responsive.</p>
          <button type="button" className="btn btn-ghost modal-footer-close" onClick={onClose}>Close library</button>
        </footer>
      </div>
    </div>
  );
}
