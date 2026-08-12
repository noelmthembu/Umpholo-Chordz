import type { FeelKey, ModeName, QualityKey } from '../types';

/** A chord's root is either a scale degree of the Feel's base mode
 * (diatonic — e.g. "the vi chord"), or an explicit semitone offset from
 * the tonic (chromatic — e.g. a secondary dominant, tritone sub, or
 * passing diminished chord that isn't part of the base scale). */
export type FeelRoot = { deg: number } | { semi: number };

export interface FeelStep {
  root: FeelRoot;
  quality: QualityKey;
}

export interface FeelTemplate {
  label: string;
  steps: FeelStep[];
}

export interface FeelProfile {
  label: string;
  description: string;
  baseScaleMode: ModeName;
  templates: FeelTemplate[];
}

const deg = (d: number, quality: QualityKey): FeelStep => ({ root: { deg: d }, quality });
const chr = (semi: number, quality: QualityKey): FeelStep => ({ root: { semi }, quality });

/**
 * Every template below is written as real functional harmony for its
 * genre — secondary dominants, borrowed/modal-interchange chords, passing
 * diminished 7ths, tritone substitutions, and 12-bar jazz-blues changes —
 * rather than diatonic 7ths picked at random. The artist references
 * describe the general harmonic *language* each feel draws on, not a
 * transcription of any specific recording.
 */
export const FEEL_PROFILES: Record<FeelKey, FeelProfile> = {
  minor: {
    label: 'Minor',
    description: 'Natural-minor Amapiano loop — i–VI–III–VII style vamps, with an optional harmonic-minor V7 for a real minor cadence.',
    baseScaleMode: 'Aeolian',
    templates: [
      { label: 'i-VI-III-VII loop', steps: [deg(0, 'm9'), deg(5, 'maj9'), deg(2, 'maj9'), deg(6, '9')] },
      { label: 'i-iv-VII-III loop', steps: [deg(0, 'm11'), deg(3, 'm9'), deg(6, '9'), deg(2, 'maj9')] },
      { label: 'i-v-VI-iv loop', steps: [deg(0, 'm9'), deg(4, 'm7'), deg(5, 'maj9'), deg(3, 'm9')] },
      // minor ii°-V7-i cadence, borrowing the raised-7th harmonic-minor dominant
      { label: 'minor ii-V-i cadence', steps: [deg(1, 'm7b5'), deg(4, '7b9'), deg(0, 'm9'), deg(0, 'm9')] },
    ],
  },
  major: {
    label: 'Major',
    description: 'Warm major-key soul-pop movement — I–vi–ii–V circles and vi–IV–I–V loops.',
    baseScaleMode: 'Major',
    templates: [
      { label: 'I-vi-ii-V', steps: [deg(0, 'maj9'), deg(5, 'm9'), deg(1, 'm9'), deg(4, '13')] },
      { label: 'I-IV-ii-V', steps: [deg(0, 'maj9'), deg(3, 'maj9'), deg(1, 'm9'), deg(4, '9')] },
      { label: 'vi-IV-I-V loop', steps: [deg(5, 'm9'), deg(3, 'maj9'), deg(0, 'maj9'), deg(4, '9')] },
      { label: 'I-iii-vi-IV', steps: [deg(0, '69'), deg(2, 'm7'), deg(5, 'm9'), deg(3, 'maj9')] },
    ],
  },
  soulful: {
    label: 'Soulful',
    description: 'Private School Piano register (Kabza De Small, Kelvin Momo) — spacious Dorian minor-7 harmony with a brightened dominant IV, rootless extended voicings.',
    baseScaleMode: 'Dorian',
    templates: [
      { label: 'i-IV-bVII-i (Dorian vamp)', steps: [deg(0, 'm11'), deg(3, '13'), deg(6, 'maj9'), deg(0, 'm9')] },
      { label: 'i-v-IV-i', steps: [deg(0, 'm9'), deg(4, 'm11'), deg(3, '9'), deg(0, 'm9')] },
      { label: 'ii-i-IV-bVII', steps: [deg(1, 'm7b5'), deg(0, 'm11'), deg(3, '13'), deg(6, 'maj9')] },
      { label: 'bIII-IV-i-i', steps: [deg(2, 'maj9'), deg(3, '9'), deg(0, 'm11'), deg(0, 'm9')] },
    ],
  },
  jazzy: {
    label: 'Jazzy',
    description: 'ii–V–I chains with secondary dominants and a tritone substitution — bebop/jazz-standard chord movement.',
    baseScaleMode: 'Major',
    templates: [
      { label: 'ii-V-I-VI (secondary dominant turnaround)', steps: [deg(1, 'm9'), deg(4, '13'), deg(0, 'maj9'), deg(5, '7#9')] },
      { label: 'ii-bII7(tritone sub)-I-VI', steps: [deg(1, 'm11'), chr(1, '7b9'), deg(0, 'maj9'), deg(5, '7')] },
      { label: 'iii-VI-ii-Valt', steps: [deg(2, 'm7'), deg(5, '7#9'), deg(1, 'm9'), deg(4, '7alt')] },
      { label: 'I-VI-ii-V', steps: [deg(0, 'maj9'), deg(5, '7b9'), deg(1, 'm9'), deg(4, '13')] },
    ],
  },
  gospel: {
    label: 'Gospel',
    description: 'I–vi–ii–V circle-of-fifths movement with a chromatic passing diminished 7th and a plagal IV–I "amen" cadence.',
    baseScaleMode: 'Major',
    templates: [
      // I, #Idim7 (chromatic passing diminished), ii, V — classic gospel passing move
      { label: 'I-#Idim7-ii-V', steps: [deg(0, 'maj9'), chr(1, 'dim7'), deg(1, 'm9'), deg(4, '13')] },
      { label: 'I-vi-ii-V circle', steps: [deg(0, 'maj9'), deg(5, 'm7'), deg(1, 'm9'), deg(4, '9')] },
      { label: 'IV-I plagal (amen) + ii-V', steps: [deg(3, 'maj9'), deg(0, '69'), deg(1, 'm9'), deg(4, '13')] },
      {
        label: '8-bar gospel walk',
        steps: [
          deg(0, 'maj9'), deg(2, 'm7'), deg(5, 'm9'), deg(1, 'm9'),
          deg(4, '13'), deg(0, 'maj9'), deg(3, 'maj9'), deg(0, '69'),
        ],
      },
    ],
  },
  rnb: {
    label: 'R&B',
    description: 'Neo-soul modal-interchange loops — a borrowed minor iv against the major tonic, quartal-friendly extended chords.',
    baseScaleMode: 'Major',
    templates: [
      { label: 'I-iii-vi-IV neo-soul loop', steps: [deg(0, 'maj9'), deg(2, 'm7'), deg(5, 'm9'), deg(3, 'maj9')] },
      // borrowed iv (modal interchange from the parallel minor)
      { label: 'I-iv(borrowed)-I-V9sus', steps: [deg(0, 'maj7'), chr(5, 'm7'), deg(0, 'maj9'), deg(4, '9sus4')] },
      { label: 'vi-ii-V-I', steps: [deg(5, 'm9'), deg(1, 'm11'), deg(4, '9'), deg(0, 'maj9')] },
      { label: 'I-V/vi-vi-IV', steps: [deg(0, '69'), deg(2, '7'), deg(5, 'm9'), deg(3, 'maj9')] },
    ],
  },
  jazzblues: {
    label: 'Jazz Blues',
    description: '12-bar jazz-blues changes — dominant 7ths throughout, a chromatic passing diminished in bar 6, and a VI7–ii turnaround, in the tradition of bebop blues heads.',
    baseScaleMode: 'Mixolydian',
    templates: [
      {
        label: '12-bar jazz blues',
        steps: [
          deg(0, '9'),               // I7   (bar 1)
          deg(3, '9'),                // IV7  (bar 2)
          deg(0, '9'),                // I7   (bar 3)
          deg(0, '7b9'),               // I7   (bar 4)
          deg(3, '9'),                // IV7  (bar 5)
          chr(6, 'dim7'),              // #IVdim7 passing (bar 6)
          deg(0, '9'),                // I7   (bar 7)
          deg(5, '7#9'),               // VI7 secondary dominant (bar 8)
          deg(1, 'm9'),                // ii   (bar 9)
          deg(4, '7alt'),              // V7alt (bar 10)
          deg(0, '13'),                // I7   (bar 11)
          deg(5, '7b9'),               // VI7 -> turnaround back to I (bar 12)
        ],
      },
    ],
  },
};

/** Resolve a FeelRoot to an absolute pitch class for a given tonic + scale. */
export function feelRootPc(tonicPc: number, scale: number[], root: FeelRoot): number {
  if ('semi' in root) return (tonicPc + root.semi + 12) % 12;
  return scale[((root.deg % 7) + 7) % 7];
}
