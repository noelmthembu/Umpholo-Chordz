import { useCallback, useRef, useState } from 'react';
import type { Chord, GenerationParams } from '../types';
import { generateProgression } from '../theory/progressions';
import { NOTE_NAMES } from '../theory/scales';

export interface SessionApi {
  chords: Chord[];
  log: string[];
  generateChords: (params: GenerationParams) => Chord[];
  setChordsList: (chords: Chord[], logMsg?: string) => void;
  appendChordsList: (chords: Chord[], logMsg?: string) => void;
  addSingleChord: (chord: Chord) => void;
  pushLog: (msg: string) => void;
}

const MAX_LOG_LINES = 10;

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
      setChords(newChords);
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
      setChords((prev) => {
        const lastBeat = prev.length > 0 ? prev[prev.length - 1].startBeat + prev[prev.length - 1].lengthBeats : 0;
        const shifted = appended.map((c, i) => ({
          ...c,
          startBeat: lastBeat + i * c.lengthBeats,
        }));
        const combined = [...prev, ...shifted];
        pushLog(logMsg || `Appended ${appended.length} chords: [${appended.map((c) => c.symbol).join(' – ')}]`);
        return combined;
      });
    },
    [pushLog]
  );

  const addSingleChord = useCallback(
    (single: Chord) => {
      setChords((prev) => {
        const lastBeat = prev.length > 0 ? prev[prev.length - 1].startBeat + prev[prev.length - 1].lengthBeats : 0;
        const newChord = { ...single, startBeat: lastBeat };
        const combined = [...prev, newChord];
        pushLog(`Inserted voicing: ${single.symbol} (${single.voicingLabel || 'Jazz Voicing'})`);
        return combined;
      });
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
    pushLog,
  };
}
