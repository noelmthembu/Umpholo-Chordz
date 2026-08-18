import { useState, useMemo } from 'react';
import type { Chord, PerformedProgression, ProgressionGenre } from '../types';
import {
  PERFORMED_PROGRESSIONS_LIBRARY,
  PROGRESSION_GENRES,
  buildPerformedProgressionChords,
} from '../theory/progressionsLibrary';
import { NOTE_NAMES } from '../theory/scales';
import { buildMidiFile, downloadMidi } from '../midi/midiWriter';

interface ProgressionsLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProgression: (chords: Chord[], bpm: number, rootPc: number) => void;
  onPreviewChords: (chords: Chord[]) => void;
}

export function ProgressionsLibraryModal({
  isOpen,
  onClose,
  onLoadProgression,
  onPreviewChords,
}: ProgressionsLibraryModalProps) {
  const [selectedGenre, setSelectedGenre] = useState<ProgressionGenre | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKeyMap, setSelectedKeyMap] = useState<Record<string, number>>({});

  const filteredProgressions = useMemo(() => {
    return PERFORMED_PROGRESSIONS_LIBRARY.filter((prog) => {
      const matchGenre = selectedGenre === 'All' || prog.genre === selectedGenre;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        prog.title.toLowerCase().includes(q) ||
        prog.description.toLowerCase().includes(q) ||
        prog.genre.toLowerCase().includes(q) ||
        prog.tags.some((t) => t.toLowerCase().includes(q));

      return matchGenre && matchSearch;
    });
  }, [selectedGenre, searchQuery]);

  if (!isOpen) return null;

  const handleKeyChange = (progId: string, rootPc: number) => {
    setSelectedKeyMap((prev) => ({ ...prev, [progId]: rootPc }));
  };

  const getProgRoot = (prog: PerformedProgression) => {
    return selectedKeyMap[prog.id] !== undefined ? selectedKeyMap[prog.id] : prog.defaultRootPc;
  };

  const handleExportSingleMidi = (prog: PerformedProgression) => {
    const rootPc = getProgRoot(prog);
    const chords = buildPerformedProgressionChords(prog, rootPc);
    const bytes = buildMidiFile(chords, {
      bpm: prog.suggestedBpm,
      cascadeMs: 24,
      trackName: `${prog.title} (${NOTE_NAMES[rootPc]})`,
    });
    const cleanTitle = prog.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    downloadMidi(bytes, `${cleanTitle}-${NOTE_NAMES[rootPc]}-${prog.suggestedBpm}bpm.mid`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">150 PERFORMED JAZZ PROGRESSIONS IN MIDI</div>
            <h2 className="modal-title">Master Progression Library</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="modal-toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search 150 progressions by title, artist, standard, or chord..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button type="button" className="search-clear" onClick={() => setSearchQuery('')}>
                ✕
              </button>
            )}
          </div>

          <div className="library-stats-pill">
            Showing <strong>{filteredProgressions.length}</strong> of <strong>150</strong> performed progressions
          </div>
        </div>

        {/* Genre Tabs */}
        <div className="genre-tabs">
          <button
            type="button"
            className={`genre-tab ${selectedGenre === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedGenre('All')}
          >
            All Genres (150)
          </button>
          {PROGRESSION_GENRES.map((g) => {
            const count = PERFORMED_PROGRESSIONS_LIBRARY.filter((p) => p.genre === g).length;
            return (
              <button
                key={g}
                type="button"
                className={`genre-tab ${selectedGenre === g ? 'active' : ''}`}
                onClick={() => setSelectedGenre(g)}
              >
                {g} ({count})
              </button>
            );
          })}
        </div>

        {/* Progressions Grid List */}
        <div className="progressions-scroll-area">
          <div className="progressions-library-grid">
            {filteredProgressions.map((prog) => {
              const currentRoot = getProgRoot(prog);
              const realizedChords = buildPerformedProgressionChords(prog, currentRoot);

              return (
                <div key={prog.id} className="lib-card">
                  <div className="lib-card-header">
                    <span className="lib-genre-badge">{prog.genre}</span>
                    <span className="lib-bpm-tag">{prog.suggestedBpm} BPM</span>
                  </div>

                  <h3 className="lib-card-title">{prog.title}</h3>
                  <p className="lib-card-desc">{prog.description}</p>

                  {/* Transposition & Key Selector */}
                  <div className="lib-key-row">
                    <span className="lib-key-label">Key:</span>
                    <select
                      value={currentRoot}
                      onChange={(e) => handleKeyChange(prog.id, Number(e.target.value))}
                      className="lib-key-select"
                    >
                      {NOTE_NAMES.map((n, i) => (
                        <option key={n} value={i}>
                          {n}
                        </option>
                      ))}
                    </select>

                    <div className="lib-tags">
                      {prog.tags.slice(0, 3).map((t) => (
                        <span key={t} className="lib-tag">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Chord sequence preview */}
                  <div className="lib-chord-chain">
                    {realizedChords.map((c, i) => (
                      <span key={i} className="lib-chord-chip">
                        {c.symbol}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="lib-card-footer">
                    <button
                      type="button"
                      className="btn-lib-action btn-lib-preview"
                      onClick={() => onPreviewChords(realizedChords)}
                      title="Audition with authentic jazz piano touch"
                    >
                      ▶ Audition
                    </button>

                    <button
                      type="button"
                      className="btn-lib-action btn-lib-load"
                      onClick={() => {
                        onLoadProgression(realizedChords, prog.suggestedBpm, currentRoot);
                        onClose();
                      }}
                      title="Load into workspace piano roll & transport"
                    >
                      Load Track
                    </button>

                    <button
                      type="button"
                      className="btn-lib-action btn-lib-midi"
                      onClick={() => handleExportSingleMidi(prog)}
                      title="Download Standard MIDI File (SMF format 1)"
                    >
                      ⬇ MIDI
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <span className="modal-footer-note">
            All 150 progressions are fully voiced with rootless, drop-2, quartal, and upper-structure shapes in SMF Format 1 MIDI.
          </span>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
