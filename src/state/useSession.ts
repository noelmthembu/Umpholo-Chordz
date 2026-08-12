import { useCallback, useRef, useState } from 'react';
import type { Chord, GenerationParams } from '../types';
import { generateProgression } from '../theory/progressions';
import { NOTE_NAMES } from '../theory/scales';

export interface SessionApi {
  chords: Chord[];
  log: string[];
  generateChords: (params: GenerationParams) => Chord[];
}

const MAX_LOG_LINES = 8;

export function useSession(): SessionApi {
  const [chords, setChords] = useState<Chord[]>([]);
  const [log, setLog] = useState<string[]>([]);

  // Non-repetition memory persists for the whole session (not React state,
  // since updates don't need to trigger re-renders).
  const usedProgressions = useRef<Set<string>>(new Set());

  const pushLog = useCallback((msg: string) => {
    setLog((prev) => [msg, ...prev].slice(0, MAX_LOG_LINES));
  }, []);

  const generateChords = useCallback(
    (params: GenerationParams) => {
      const next = generateProgression(params, usedProgressions.current);
      setChords(next);
      pushLog(
        `Generated ${params.bars}-bar ${params.mode} progression in ${NOTE_NAMES[params.rootPc]} (${params.style}) — [${next
          .map((c) => c.symbol)
          .join(' \u2013 ')}]`
      );
      return next;
    },
    [pushLog]
  );

  return { chords, log, generateChords };
}
