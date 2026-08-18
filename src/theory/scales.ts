import type { ModeName } from '../types';

export const NOTE_NAMES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const;

export const ENHARMONIC_NAMES: Record<number, { sharp: string; flat: string }> = {
  0: { sharp: 'C', flat: 'C' },
  1: { sharp: 'C#', flat: 'Db' },
  2: { sharp: 'D', flat: 'D' },
  3: { sharp: 'D#', flat: 'Eb' },
  4: { sharp: 'E', flat: 'E' },
  5: { sharp: 'F', flat: 'F' },
  6: { sharp: 'F#', flat: 'Gb' },
  7: { sharp: 'G', flat: 'G' },
  8: { sharp: 'G#', flat: 'Ab' },
  9: { sharp: 'A', flat: 'A' },
  10: { sharp: 'A#', flat: 'Bb' },
  11: { sharp: 'B', flat: 'B' },
};

export const MODES: Record<ModeName, number[]> = {
  Major: [0, 2, 4, 5, 7, 9, 11],
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Phrygian: [0, 1, 3, 5, 7, 8, 10],
  Lydian: [0, 2, 4, 6, 7, 9, 11],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10],
  Aeolian: [0, 2, 3, 5, 7, 8, 10],
  Locrian: [0, 1, 3, 5, 6, 8, 10],
  MelodicMinor: [0, 2, 3, 5, 7, 9, 11],
  HarmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  Altered: [0, 1, 3, 4, 6, 8, 10],
  Diminished: [0, 2, 3, 5, 6, 8, 9, 11],
};

export const MODE_NAMES = Object.keys(MODES) as ModeName[];

/** Build the diatonic pitch classes (0-11) for a root + mode. */
export function scalePitchClasses(rootPc: number, modeName: ModeName): number[] {
  return MODES[modeName].map((iv) => (rootPc + iv) % 12);
}

export function pcToMidi(pc: number, octave: number): number {
  return pc + (octave + 1) * 12;
}

export function midiToNoteName(midi: number): string {
  const pc = midi % 12;
  const oct = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[pc]}${oct}`;
}

export function intervalName(semitones: number): string {
  const map: Record<number, string> = {
    0: 'R',
    1: 'b9',
    2: '9',
    3: 'b3',
    4: '3',
    5: '11/4',
    6: '#11/b5',
    7: '5',
    8: 'b13/#5',
    9: '13/6',
    10: 'b7',
    11: '7',
    12: 'R(8va)',
    13: 'b9',
    14: '9',
    15: '#9',
    16: '3',
    17: '11',
    18: '#11',
    19: '5',
    20: 'b13',
    21: '13',
    22: 'b7',
    23: '7',
    24: 'R(15ma)',
  };
  return map[semitones % 24] || `${semitones}st`;
}
