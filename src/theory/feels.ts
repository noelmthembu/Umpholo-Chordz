import type { FeelKey, ModeName, QualityKey } from '../types';

export type FeelRoot = { deg: number } | { semi: number };

export interface FeelStep {
  root: FeelRoot;
  quality: QualityKey;
  lengthBeats?: number;
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

const deg = (d: number, quality: QualityKey, lengthBeats?: number): FeelStep => ({ root: { deg: d }, quality, lengthBeats });
const chr = (semi: number, quality: QualityKey, lengthBeats?: number): FeelStep => ({ root: { semi }, quality, lengthBeats });

export const FEEL_PROFILES: Record<FeelKey, FeelProfile> = {
  minor: {
    label: 'Minor Jazz / Amapiano',
    description: 'Natural-minor loop — i–VI–III–VII vamps with altered minor ii–V–i cadences and rich 11ths.',
    baseScaleMode: 'Aeolian',
    templates: [
      { label: 'i-VI-III-VII loop', steps: [deg(0, 'm9'), deg(5, 'maj9'), deg(2, 'maj9'), deg(6, '9')] },
      { label: 'i-iv-VII-III loop', steps: [deg(0, 'm11'), deg(3, 'm9'), deg(6, '9'), deg(2, 'maj9')] },
      { label: 'i-v-VI-iv loop', steps: [deg(0, 'm9'), deg(4, 'm7'), deg(5, 'maj9'), deg(3, 'm9')] },
      { label: 'minor ii-V-i cadence', steps: [deg(1, 'm7b5'), deg(4, '7alt'), deg(0, 'm9'), deg(0, 'm11')] },
    ],
  },
  major: {
    label: 'Major Soul / Jazz',
    description: 'Warm major-key soul-pop & jazz movement — I–vi–ii–V circles and iii–VI–ii–V turnarounds.',
    baseScaleMode: 'Major',
    templates: [
      { label: 'I-vi-ii-V turnaround', steps: [deg(0, 'maj9'), deg(5, 'm9'), deg(1, 'm9'), deg(4, '13')] },
      { label: 'I-IV-ii-V soul circle', steps: [deg(0, 'maj9'), deg(3, 'maj9'), deg(1, 'm9'), deg(4, '9')] },
      { label: 'vi-IV-I-V loop', steps: [deg(5, 'm9'), deg(3, 'maj9'), deg(0, 'maj9'), deg(4, '9')] },
      { label: 'I-iii-vi-IV', steps: [deg(0, '69'), deg(2, 'm7'), deg(5, 'm9'), deg(3, 'maj9')] },
    ],
  },
  soulful: {
    label: 'Soulful Private School',
    description: 'Private School Piano register (Kabza De Small, Kelvin Momo) — spacious Dorian minor-7/11 harmony with brightened dominant IV.',
    baseScaleMode: 'Dorian',
    templates: [
      { label: 'i-IV-bVII-i (Dorian vamp)', steps: [deg(0, 'm11'), deg(3, '13'), deg(6, 'maj9'), deg(0, 'm9')] },
      { label: 'i-v-IV-i deep vibe', steps: [deg(0, 'm9'), deg(4, 'm11'), deg(3, '9'), deg(0, 'm9')] },
      { label: 'ii-i-IV-bVII', steps: [deg(1, 'm7b5'), deg(0, 'm11'), deg(3, '13'), deg(6, 'maj9')] },
      { label: 'bIII-IV-i-i', steps: [deg(2, 'maj9'), deg(3, '9'), deg(0, 'm11'), deg(0, 'm9')] },
    ],
  },
  jazzy: {
    label: 'Bebop & Standards',
    description: 'ii–V–I chains with secondary dominants, tritone substitutions, and altered turns in the Evans/Parker tradition.',
    baseScaleMode: 'Major',
    templates: [
      { label: 'ii-V-I-VI (secondary dominant turnaround)', steps: [deg(1, 'm9'), deg(4, '13'), deg(0, 'maj9'), deg(5, '7#9')] },
      { label: 'ii-bII7(tritone sub)-I-VI', steps: [deg(1, 'm11'), chr(1, '7#11'), deg(0, 'maj9'), deg(5, '7b9')] },
      { label: 'iii-VI-ii-Valt', steps: [deg(2, 'm7'), deg(5, '7#9'), deg(1, 'm9'), deg(4, '7alt')] },
      { label: 'I-VI-ii-V', steps: [deg(0, 'maj9'), deg(5, '7b9'), deg(1, 'm9'), deg(4, '13')] },
    ],
  },
  gospel: {
    label: 'Gospel Jazz & Praise',
    description: '7–3–6–2–5–1 circle movement, passing diminished chords, and plagal IV–I "amen" worship cadences.',
    baseScaleMode: 'Major',
    templates: [
      { label: '7-3-6-2-5-1 shout turnaround', steps: [deg(6, 'm7b5'), deg(2, '7#9'), deg(5, 'm9'), deg(1, 'm9'), deg(4, '13sus4'), deg(0, '69')] },
      { label: 'I-#Idim7-ii-V church walk', steps: [deg(0, 'maj9'), chr(1, 'dim7'), deg(1, 'm9'), deg(4, '13')] },
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
    label: 'Neo-Soul & R&B',
    description: 'Neo-soul modal-interchange loops, borrowed minor iv chords, quartal clusters, and Dilla laid-back pocket.',
    baseScaleMode: 'Major',
    templates: [
      { label: 'I-iii-vi-IV neo-soul loop', steps: [deg(0, 'maj9'), deg(2, 'm7'), deg(5, 'm9'), deg(3, 'maj9')] },
      { label: 'I-iv(borrowed)-I-V9sus', steps: [deg(0, 'maj7'), chr(5, 'm9'), deg(0, 'maj9'), deg(4, '9sus4')] },
      { label: 'vi-ii-V-I velvet', steps: [deg(5, 'm11'), deg(1, 'm11'), deg(4, '9'), deg(0, 'maj9')] },
      { label: 'I-V/vi-vi-IV', steps: [deg(0, '69'), deg(2, '7'), deg(5, 'm9'), deg(3, 'maj9')] },
    ],
  },
  jazzblues: {
    label: '12-Bar Jazz Blues',
    description: 'Bird Blues & Hard Bop changes — dominant 7ths throughout, passing #IVdim7, and secondary dominant turnarounds.',
    baseScaleMode: 'Mixolydian',
    templates: [
      {
        label: '12-bar jazz blues',
        steps: [
          deg(0, '9'),
          deg(3, '9'),
          deg(0, '9'),
          deg(0, '7b9'),
          deg(3, '9'),
          chr(6, 'dim7'),
          deg(0, '9'),
          deg(5, '7#9'),
          deg(1, 'm9'),
          deg(4, '7alt'),
          deg(0, '13'),
          deg(5, '7b9'),
        ],
      },
    ],
  },
  modaljazz: {
    label: 'Modal Jazz (Tyner / Hancock)',
    description: 'Miles Davis / McCoy Tyner / Wayne Shorter quartal modal shifts and suspended 4th voicings.',
    baseScaleMode: 'Dorian',
    templates: [
      { label: 'Maiden Voyage sus4 cycle', steps: [deg(0, '9sus4'), chr(3, '9sus4'), chr(1, '9sus4'), chr(10, '9sus4')] },
      { label: 'So What quartal shift', steps: [deg(0, 'm11'), deg(0, 'm11'), chr(1, 'm11'), deg(0, 'm11')] },
      { label: 'Speak No Evil mystery', steps: [deg(0, 'm11'), chr(1, 'maj7#11'), chr(6, 'm11'), chr(7, '7alt')] },
    ],
  },
  bossanova: {
    label: 'Bossa Nova (Jobim)',
    description: 'Antonio Carlos Jobim syncopated bossa chords with delicate chromatic alterations and lush 6/9 sonorities.',
    baseScaleMode: 'Major',
    templates: [
      { label: 'Ipanema major-dominant glide', steps: [deg(0, 'maj9'), chr(2, '7#11'), deg(1, 'm9'), chr(1, '7#11')] },
      { label: 'Corcovado minor ii-V-I', steps: [deg(1, 'm9'), chr(1, 'dim7'), deg(1, 'm9'), deg(4, '13')] },
      { label: 'Wave major-diminished wave', steps: [deg(0, 'maj9'), chr(11, 'dim7'), deg(1, 'm9'), deg(4, '13')] },
    ],
  },
  coltrane: {
    label: 'Coltrane Changes (Giant Steps)',
    description: 'John Coltrane major-third 3-tonic cycles and chromatic mediant substitutions.',
    baseScaleMode: 'Major',
    templates: [
      { label: 'Giant Steps 3-tonic matrix', steps: [deg(0, 'maj7'), chr(3, '7'), chr(8, 'maj7'), chr(11, '7'), chr(4, 'maj7'), chr(7, '7')] },
      { label: 'Countdown reharm matrix', steps: [deg(1, 'm7'), chr(5, '7'), chr(10, 'maj7'), chr(1, '7'), chr(6, 'maj7'), chr(9, '7'), deg(0, 'maj9')] },
      { label: 'Central Park West mediants', steps: [deg(0, 'maj9'), chr(8, 'maj9'), chr(4, 'maj9'), deg(0, 'maj9')] },
    ],
  },
  ballad: {
    label: 'Impressionist Ballad (Bill Evans)',
    description: 'Slow, rubato, expressive impressionist voicings with rich #11s, altered 9ths, and singing lead notes.',
    baseScaleMode: 'Major',
    templates: [
      { label: 'Blue in Green circular ballad', steps: [deg(0, 'maj7#11'), chr(9, '7alt'), deg(1, 'm9'), chr(1, '7alt')] },
      { label: 'Peace Horace Silver / Evans', steps: [deg(0, 'maj7#11'), chr(11, '7alt'), chr(4, 'm9'), chr(9, '7b9'), deg(1, 'm11'), deg(4, '13b9')] },
      { label: 'My Foolish Heart tender walk', steps: [deg(0, 'maj9'), deg(5, 'm9'), deg(1, 'm7b5'), deg(4, '7alt'), deg(0, '69')] },
    ],
  },
  bebopprivate: {
    label: 'Bebop / Hard Bop Fire',
    description: 'High-speed bebop changes with Barry Harris 6th-diminished and drop-2 punchy piano stabs.',
    baseScaleMode: 'Major',
    templates: [
      { label: 'Confirmation Parker changes', steps: [deg(0, 'maj7'), chr(4, 'm7b5'), chr(9, '7b9'), chr(2, 'm9'), chr(7, '7alt'), chr(0, 'm9'), chr(5, '13')] },
      { label: 'Scrapple from the Apple', steps: [deg(1, 'm9'), deg(4, '13'), deg(1, 'm9'), deg(4, '13'), deg(0, '69')] },
      { label: 'Rhythm Changes fast A-section', steps: [deg(0, '69'), deg(5, '7b9'), deg(1, 'm9'), deg(4, '13'), deg(2, 'm7'), deg(5, '7alt'), deg(1, 'm9'), deg(4, '7b9')] },
    ],
  },
};

export function feelRootPc(tonicPc: number, scale: number[], root: FeelRoot): number {
  if ('semi' in root) return (tonicPc + root.semi + 12) % 12;
  return scale[((root.deg % 7) + 7) % 7];
}
