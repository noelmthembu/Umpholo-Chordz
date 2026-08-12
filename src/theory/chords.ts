import type { ChordTone, QualityKey } from '../types';
import { NOTE_NAMES } from './scales';

/**
 * Semitone offsets from the chord root for each quality, expressed the way
 * a working pianist would voice them (root, 3rd, 5th, 7th, then 9th/11th/13th
 * an octave up as color tones). This replaces blind "stack a 3rd every 2
 * scale steps" generation — every quality here is a real, named chord type
 * (dominant 7, half-diminished, altered dominant, sus, added 6th, etc.)
 * rather than whatever the scale happens to produce.
 */
export const QUALITY_TONES: Record<QualityKey, number[]> = {
  maj7: [0, 4, 7, 11],
  maj9: [0, 4, 7, 11, 14],
  '6': [0, 4, 7, 9],
  '69': [0, 4, 7, 9, 14],
  madd9: [0, 4, 7, 14],
  m7: [0, 3, 7, 10],
  m9: [0, 3, 7, 10, 14],
  m11: [0, 3, 7, 10, 14, 17],
  m6: [0, 3, 7, 9],
  '7': [0, 4, 7, 10],
  '9': [0, 4, 7, 10, 14],
  '13': [0, 4, 7, 10, 14, 17, 21],
  '7b9': [0, 4, 7, 10, 13],
  '7#9': [0, 4, 7, 10, 15],
  '7alt': [0, 4, 7, 10, 13, 18], // altered dominant (b9, #11 as a practical approximation of the b9/#9/#11/b13 "alt" sound)
  '9sus4': [0, 5, 7, 10, 14],
  '7sus4': [0, 5, 7, 10],
  m7b5: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
};

/** Display suffix for each quality, e.g. "maj9", "m7b5", "7#9". */
export const QUALITY_SYMBOLS: Record<QualityKey, string> = {
  maj7: 'maj7',
  maj9: 'maj9',
  '6': '6',
  '69': '6/9',
  madd9: '(add9)',
  m7: 'm7',
  m9: 'm9',
  m11: 'm11',
  m6: 'm6',
  '7': '7',
  '9': '9',
  '13': '13',
  '7b9': '7\u266d9',
  '7#9': '7\u266f9',
  '7alt': '7alt',
  '9sus4': '9sus4',
  '7sus4': '7sus4',
  m7b5: 'm7\u266d5',
  dim7: 'dim7',
};

/** Harmonic "family" a quality belongs to — used to pick appropriate extra
 * color tones so any added tension still fits the chord's function instead
 * of clashing with it (e.g. only dominants get a b9/#9). */
export type QualityFamily = 'major' | 'minor' | 'dominant' | 'halfdim' | 'dim';

export function qualityFamily(quality: QualityKey): QualityFamily {
  switch (quality) {
    case 'maj7':
    case 'maj9':
    case '6':
    case '69':
    case 'madd9':
      return 'major';
    case 'm7':
    case 'm9':
    case 'm11':
    case 'm6':
      return 'minor';
    case '7':
    case '9':
    case '13':
    case '7b9':
    case '7#9':
    case '7alt':
    case '9sus4':
    case '7sus4':
      return 'dominant';
    case 'm7b5':
      return 'halfdim';
    case 'dim7':
      return 'dim';
    default:
      return 'major';
  }
}

/** Build a chord's tones (root + upper structure) from an explicit,
 * named quality rather than a diatonic stack. */
export function buildQualityChordTones(rootPc: number, quality: QualityKey): { rootPc: number; tones: ChordTone[] } {
  const offsets = QUALITY_TONES[quality];
  const tones = offsets.map((semis) => ({ pc: (rootPc + semis) % 12, semitoneFromRoot: semis }));
  return { rootPc, tones };
}

/** Human-readable chord symbol for an explicit quality, e.g. "Fmaj9", "Dm11". */
export function chordSymbolForQuality(rootPc: number, quality: QualityKey): string {
  return NOTE_NAMES[rootPc] + QUALITY_SYMBOLS[quality];
}
