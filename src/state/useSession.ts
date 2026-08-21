import { useCallback, useRef, useState } from 'react';
import type { Chord, GenerationParams } from '../types';
import { generateProgression } from '../theory/progressions';
import { NOTE_NAMES } from '../theory/scales';
import { buildPianoVoicing } from '../theory/pianoVoicing';

export interface SessionApi {
  chords: Chord[];
  log: string[];
  generateChords: (params: GenerationParams) => Chord[];
  setChordsList: (chords: Chord[], logMsg?: string) => void;
  appendChordsList: (chords: Chord[], logMsg?: string) => void;
  addSingleChord: (chord: Chord) => void;
  moveChord: (fromIndex: number, toIndex: number) => void;
  removeChord: (index: number) => void;
  revoiceChord: (index: number) => void;
  pushLog: (msg: string) => void;
}

const MAX_LOG_LINES = 10;

function normalizeChordTimeline(chords: Chord[]): Chord[] {
  let nextBeat = 0;
  return chords.map((chord) => {
    const normalized = { ...chord, startBeat: nextBeat };
    nextBeat += chord.lengthBeats;
    return normalized;
  });
}

function chordUpperNotes(chord: Chord): number[] {
  if (chord.upperMidiNotes?.length) return chord.upperMidiNotes;
  const bassCount = chord.bassMidiNotes?.length ?? 1;
  return chord.midiNotes.slice(bassCount);
}

function chordBassNote(chord: Chord): number | null {
  return chord.bassMidiNotes?.[0] ?? chord.midiNotes[0] ?? null;
}

export function useSession(): SessionApi {
  const [chords, setChords] = useState<Chord[]>([]);
  const [log, setLog] = useState<string[]>([
    'System initialized with 1,500+ jazz voicings & 150 performed progressions.',
  ]);

  const usedProgressions = useRef<Set<string>>(new Set());

  const pushLog = useCallback((msg: string) => {
    setLog((prev) => [msg, ...prev].slice(0, MAX_LOG_LINES));
  }, []);

  const generateChords = useCallback(
    (params: GenerationParams) => {
      const next = generateProgression(params, usedProgressions.current);
      setChords(next);
      pushLog(
        `Generated ${next.length}-chord ${params.mode} progression in ${NOTE_NAMES[params.rootPc]} (${params.style}) — [${next
          .map((c) => c.symbol)
          .join(' – ')}]`
      );
      return next;
    },
    [pushLog]
  );

  const setChordsList = useCallback(
    (newChords: Chord[], logMsg?: string) => {
      setChords(normalizeChordTimeline(newChords));
      if (logMsg) {
        pushLog(logMsg);
      } else {
        pushLog(`Loaded progression — [${newChords.map((c) => c.symbol).join(' – ')}]`);
      }
    },
    [pushLog]
  );

  const appendChordsList = useCallback(
    (appended: Chord[], logMsg?: string) => {
      setChords((prev) => normalizeChordTimeline([...prev, ...appended]));
      pushLog(logMsg || `Appended ${appended.length} chords: [${appended.map((c) => c.symbol).join(' – ')}]`);
    },
    [pushLog]
  );

  const addSingleChord = useCallback(
    (single: Chord) => {
      setChords((prev) => normalizeChordTimeline([...prev, single]));
      pushLog(`Inserted voicing: ${single.symbol} (${single.voicingLabel || 'Jazz Voicing'})`);
    },
    [pushLog]
  );

  const moveChord = useCallback(
    (fromIndex: number, toIndex: number) => {
      setChords((prev) => {
        if (fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length || fromIndex === toIndex) {
          return prev;
        }
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return normalizeChordTimeline(next);
      });
      pushLog(`Moved bar ${fromIndex + 1} to bar ${toIndex + 1}.`);
    },
    [pushLog]
  );

  const removeChord = useCallback(
    (index: number) => {
      setChords((prev) => {
        if (index < 0 || index >= prev.length) return prev;
        return normalizeChordTimeline(prev.filter((_, chordIndex) => chordIndex !== index));
      });
      pushLog(`Removed chord from bar ${index + 1}.`);
    },
    [pushLog]
  );

  const revoiceChord = useCallback(
    (index: number) => {
      setChords((prev) => {
        const chord = prev[index];
        if (!chord?.quality) return prev;

        const previous = prev[index - 1];
        const existingUpper = chordUpperNotes(chord);
        const anchor = existingUpper[Math.floor(existingUpper.length / 2)] ?? 62;
        const rebuilt = buildPianoVoicing({
          rootPc: chord.rootPc,
          quality: chord.quality,
          anchor,
          previousUpperMidis: previous ? chordUpperNotes(previous) : [],
          previousBassMidi: previous ? chordBassNote(previous) : null,
          preferredCategory: chord.voicingCategory,
          densityBias: 0.7,
          variation: (chord.voicingVariant ?? 0) + 1,
        });
        const next = [...prev];
        next[index] = {
          ...chord,
          midiNotes: rebuilt.midiNotes,
          bassMidiNotes: rebuilt.bassMidiNotes,
          upperMidiNotes: rebuilt.upperMidiNotes,
          voicingLabel: rebuilt.shapeLabel,
          voicingCategory: rebuilt.category,
          voicingVariant: (chord.voicingVariant ?? 0) + 1,
        };
        return next;
      });
      pushLog(`Revoiced bar ${index + 1} with a new full piano shape.`);
    },
    [pushLog]
  );

  return {
    chords,
    log,
    generateChords,
    setChordsList,
    appendChordsList,
    addSingleChord,
    moveChord,
    removeChord,
    revoiceChord,
    pushLog,
  };
}
