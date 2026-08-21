import { useMemo, useState } from 'react';
import type { Chord, PerformedProgression, ProgressionGenre } from '../types';
import {
  PERFORMED_PROGRESSIONS_LIBRARY,
  PROGRESSION_GENRES,
  buildPerformedProgressionChords,
} from '../theory/progressionsLibrary';
import { NOTE_NAMES } from '../theory/scales';
import { buildMidiFile, downloadMidi } from '../midi/midiWriter';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import { Icon } from './Icon';

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
  const dialogRef = useAccessibleDialog({ isOpen, onClose });

  const filteredProgressions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return PERFORMED_PROGRESSIONS_LIBRARY.filter((progression) => {
      const matchesGenre = selectedGenre === 'All' || progression.genre === selectedGenre;
      const matchesSearch =
        query === '' ||
        progression.title.toLowerCase().includes(query) ||
        progression.description.toLowerCase().includes(query) ||
        progression.genre.toLowerCase().includes(query) ||
        progression.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesGenre && matchesSearch;
    });
  }, [searchQuery, selectedGenre]);

  if (!isOpen) return null;

  const getProgressionRoot = (progression: PerformedProgression) =>
    selectedKeyMap[progression.id] ?? progression.defaultRootPc;

  const exportProgression = (progression: PerformedProgression) => {
    const rootPc = getProgressionRoot(progression);
    const chords = buildPerformedProgressionChords(progression, rootPc);
    const bytes = buildMidiFile(chords, {
      bpm: progression.suggestedBpm,
      cascadeMs: 24,
      trackName: `${progression.title} (${NOTE_NAMES[rootPc]})`,
    });
    const fileStem = progression.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    downloadMidi(bytes, `${fileStem}-${NOTE_NAMES[rootPc]}-${progression.suggestedBpm}bpm.mid`);
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        className="modal-dialog modal-large"
        role="dialog"
        aria-modal="true"
        aria-labelledby="progressions-dialog-title"
        aria-describedby="progressions-dialog-description"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="modal-eyebrow">Progression library</p>
            <h2 id="progressions-dialog-title" className="modal-title">Performed progressions</h2>
            <p id="progressions-dialog-description" className="modal-description">
              Search, transpose, audition, or load a fully voiced progression into the workspace.
            </p>
          </div>
          <button type="button" className="icon-button modal-close-btn" onClick={onClose} aria-label="Close progression library">
            <Icon name="close" aria-hidden="true" />
          </button>
        </header>

        <div className="modal-toolbar">
          <label className="search-box" htmlFor="progression-search">
            <Icon name="search" className="search-icon" aria-hidden="true" />
            <span className="sr-only">Search progressions</span>
            <input
              id="progression-search"
              type="search"
              placeholder="Search by title, genre, or harmonic idea"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="search-input"
            />
            {searchQuery ? (
              <button
                type="button"
                className="icon-button search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear progression search"
              >
                <Icon name="close" aria-hidden="true" />
              </button>
            ) : null}
          </label>
          <p className="library-stats" aria-live="polite">
            <strong>{filteredProgressions.length}</strong> of {PERFORMED_PROGRESSIONS_LIBRARY.length} progressions
          </p>
        </div>

        <div className="genre-tabs" role="group" aria-label="Filter progression genre">
          <button
            type="button"
            className={`genre-tab ${selectedGenre === 'All' ? 'active' : ''}`}
            aria-pressed={selectedGenre === 'All'}
            onClick={() => setSelectedGenre('All')}
          >
            All genres
          </button>
          {PROGRESSION_GENRES.map((genre) => (
            <button
              key={genre}
              type="button"
              className={`genre-tab ${selectedGenre === genre ? 'active' : ''}`}
              aria-pressed={selectedGenre === genre}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="progressions-scroll-area">
          {filteredProgressions.length === 0 ? (
            <div className="library-empty" role="status">
              <strong>No progressions match this search.</strong>
              <span>Try a genre, chord quality, or a shorter keyword.</span>
              <button type="button" className="text-button" onClick={() => { setSearchQuery(''); setSelectedGenre('All'); }}>
                Reset filters
              </button>
            </div>
          ) : (
            <div className="progressions-library-grid">
              {filteredProgressions.map((progression) => {
                const rootPc = getProgressionRoot(progression);
                const chords = buildPerformedProgressionChords(progression, rootPc);
                const keySelectId = `progression-key-${progression.id}`;

                return (
                  <article key={progression.id} className="lib-card">
                    <div className="lib-card-header">
                      <span className="status-label">{progression.genre}</span>
                      <span className="lib-bpm-tag">{progression.suggestedBpm} BPM</span>
                    </div>
                    <div>
                      <h3 className="lib-card-title">{progression.title}</h3>
                      <p className="lib-card-desc">{progression.description}</p>
                    </div>
                    <div className="lib-key-row">
                      <label className="lib-key-label" htmlFor={keySelectId}>Transpose to</label>
                      <select
                        id={keySelectId}
                        value={rootPc}
                        onChange={(event) => setSelectedKeyMap((previous) => ({ ...previous, [progression.id]: Number(event.target.value) }))}
                        className="lib-key-select"
                      >
                        {NOTE_NAMES.map((note, index) => <option key={note} value={index}>{note}</option>)}
                      </select>
                    </div>
                    <div className="lib-chord-chain" aria-label={`Chord sequence: ${chords.map((chord) => chord.symbol).join(', ')}`}>
                      {chords.map((chord, index) => <span key={`${chord.symbol}-${index}`} className="lib-chord-chip">{chord.symbol}</span>)}
                    </div>
                    <div className="lib-card-footer">
                      <button type="button" className="btn-lib-action btn-lib-preview" onClick={() => onPreviewChords(chords)}>
                        <Icon name="play" aria-hidden="true" /> Audition
                      </button>
                      <button
                        type="button"
                        className="btn-lib-action btn-lib-load"
                        onClick={() => { onLoadProgression(chords, progression.suggestedBpm, rootPc); onClose(); }}
                      >
                        Load
                      </button>
                      <button type="button" className="icon-button btn-lib-midi" onClick={() => exportProgression(progression)} aria-label={`Export ${progression.title} as MIDI`}>
                        <Icon name="download" aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <footer className="modal-footer">
          <p className="modal-footer-note">Each progression includes a playable voicing and can be transposed before loading or export.</p>
          <button type="button" className="btn btn-ghost modal-footer-close" onClick={onClose}>Close library</button>
        </footer>
      </div>
    </div>
  );
}
