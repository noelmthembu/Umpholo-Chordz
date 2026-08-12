import type { ModeName } from '../types';

export const NOTE_NAMES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const;

export const MODES: Record<ModeName, number[]> = {
  Major: [0, 2, 4, 5, 7, 9, 11],
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Phrygian: [0, 1, 3, 5, 7, 8, 10],
  Lydian: [0, 2, 4, 6, 7, 9, 11],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10],
  Aeolian: [0, 2, 3, 5, 7, 8, 10],
  Locrian: [0, 1, 3, 5, 6, 8, 10],
};

export const MODE_NAMES = Object.keys(MODES) as ModeName[];

/** Build the 7 diatonic pitch classes (0-11) for a root + mode. */
export function scalePitchClasses(rootPc: number, modeName: ModeName): number[] {
  return MODES[modeName].map((iv) => (rootPc + iv) % 12);
}

export function pcToMidi(pc: number, octave: number): number {
  return pc + (octave + 1) * 12;
}
