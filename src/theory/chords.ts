import type { ChordTone, QualityKey } from '../types';
import { NOTE_NAMES, intervalName } from './scales';

/**
 * Semitone offsets from the chord root for each quality, expressed the way
 * a working pianist would voice them (root, 3rd, 5th, 7th, then 9th/11th/13th
 * an octave up as color tones).
 */
export const QUALITY_TONES: Record<QualityKey, number[]> = {
  maj7: [0, 4, 7, 11],
  maj9: [0, 4, 7, 11, 14],
  maj13: [0, 4, 7, 11, 14, 21],
  'maj7#11': [0, 4, 7, 11, 14, 18],
  '6': [0, 4, 7, 9],
  '69': [0, 4, 7, 9, 14],
  madd9: [0, 3, 7, 14],
  m7: [0, 3, 7, 10],
  m9: [0, 3, 7, 10, 14],
  m11: [0, 3, 7, 10, 14, 17],
  m13: [0, 3, 7, 10, 14, 17, 21],
  m6: [0, 3, 7, 9],
  m69: [0, 3, 7, 9, 14],
  mmaj7: [0, 3, 7, 11, 14],
  '7': [0, 4, 7, 10],
  '9': [0, 4, 7, 10, 14],
  '13': [0, 4, 7, 10, 14, 21],
  '7b9': [0, 4, 7, 10, 13],
  '7#9': [0, 4, 7, 10, 15],
  '7alt': [0, 4, 10, 13, 15, 18, 20], // altered dominant (3, b7, b9, #9, #11, b13)
  '7#11': [0, 4, 7, 10, 14, 18],
  '7b13': [0, 4, 10, 14, 20],
  '13b9': [0, 4, 10, 13, 21],
  '9#11': [0, 4, 7, 10, 14, 18],
  '9sus4': [0, 5, 7, 10, 14],
  '7sus4': [0, 5, 7, 10],
  '13sus4': [0, 5, 7, 10, 14, 21],
  '7b9sus4': [0, 5, 7, 10, 13],
  m7b5: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
  aug7: [0, 4, 8, 10],
};

/** Display suffix for each quality, e.g. "maj9", "m7b5", "7#9". */
export const QUALITY_SYMBOLS: Record<QualityKey, string> = {
  maj7: 'maj7',
  maj9: 'maj9',
  maj13: 'maj13',
  'maj7#11': 'maj7(♯11)',
  '6': '6',
  '69': '6/9',
  madd9: 'm(add9)',
  m7: 'm7',
  m9: 'm9',
  m11: 'm11',
  m13: 'm13',
  m6: 'm6',
  m69: 'm6/9',
  mmaj7: 'm(maj7)',
  '7': '7',
  '9': '9',
  '13': '13',
  '7b9': '7(♭9)',
  '7#9': '7(♯9)',
  '7alt': '7alt',
  '7#11': '7(♯11)',
  '7b13': '7(♭13)',
  '13b9': '13(♭9)',
  '9#11': '9(♯11)',
  '9sus4': '9sus4',
  '7sus4': '7sus4',
  '13sus4': '13sus4',
  '7b9sus4': '7(♭9)sus4',
  m7b5: 'm7(♭5)',
  dim7: 'dim7',
  aug7: '7(♯5)',
};

/** Harmonic "family" a quality belongs to */
export type QualityFamily = 'major' | 'minor' | 'dominant' | 'halfdim' | 'dim' | 'sus';

export function qualityFamily(quality: QualityKey): QualityFamily {
  switch (quality) {
    case 'maj7':
    case 'maj9':
    case 'maj13':
    case 'maj7#11':
    case '6':
    case '69':
      return 'major';
    case 'madd9':
    case 'm7':
    case 'm9':
    case 'm11':
    case 'm13':
    case 'm6':
    case 'm69':
    case 'mmaj7':
      return 'minor';
    case '7':
    case '9':
    case '13':
    case '7b9':
    case '7#9':
    case '7alt':
    case '7#11':
    case '7b13':
    case '13b9':
    case '9#11':
    case 'aug7':
      return 'dominant';
    case '9sus4':
    case '7sus4':
    case '13sus4':
    case '7b9sus4':
      return 'sus';
    case 'm7b5':
      return 'halfdim';
    case 'dim7':
      return 'dim';
    default:
      return 'major';
  }
}

/** Build a chord's tones (root + upper structure) from an explicit, named quality */
export function buildQualityChordTones(rootPc: number, quality: QualityKey): { rootPc: number; tones: ChordTone[] } {
  const offsets = QUALITY_TONES[quality] || [0, 4, 7, 10];
  const tones: ChordTone[] = offsets.map((semis) => ({
    pc: (rootPc + semis) % 12,
    semitoneFromRoot: semis,
    role: intervalName(semis),
  }));
  return { rootPc, tones };
}

/** Human-readable chord symbol for an explicit quality, e.g. "Fmaj9", "Dm11". */
export function chordSymbolForQuality(rootPc: number, quality: QualityKey): string {
  const symbol = QUALITY_SYMBOLS[quality] || quality;
  return NOTE_NAMES[rootPc] + symbol;
}
