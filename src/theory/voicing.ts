/**
 * voicing.ts
 *
 * Professional jazz piano voicing engine modelled on the recorded output
 * and published pedagogy of Bill Evans, Herbie Hancock, McCoy Tyner,
 * Barry Harris, Kenny Barron, and Robert Glasper.
 *
 * Covers:
 *   - Mark Levine "The Jazz Piano Book" Rootless A & B forms
 *   - Drop-2, Drop-3, and Drop-2 & 4 inversions
 *   - Quartal / So What 4th-chords (McCoy Tyner / Kenny Barron)
 *   - Upper Structure Triads (USII, USbV, USbVI, USVI, USbIII) over Dominants
 *   - Barry Harris 6th-Diminished voicings
 *   - Modern Neo-Soul clusters (Robert Glasper)
 *   - Kenny Barron open fifths & fourths
 */

import type { CascadeDirection, QualityKey, VoicingCategory } from '../types';

export interface VoicingShape {
  offsets: number[]; // semitones from root, strictly ascending
  label: string;
  category: VoicingCategory;
  description?: string;
}

/** MIDI note with the given pitch-class (0-11) closest to `target`. */
export function closestMidiForPc(pc: number, target: number): number {
  const base = target - ((((target - pc) % 12) + 12) % 12);
  return [base - 12, base, base + 12].reduce((best, n) =>
    Math.abs(n - target) < Math.abs(best - target) ? n : best
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Master Jazz Voicing Shape Library
// ─────────────────────────────────────────────────────────────────────────────

export const JAZZ_VOICING_SHAPES: Record<QualityKey, VoicingShape[]> = {
  // ── MAJOR ─────────────────────────────────────────────────────────────────
  maj7: [
    { offsets: [4, 11, 14, 18], label: 'maj7 A: 3-7-9-#11', category: 'Rootless A (Evans/Levine)' },
    { offsets: [11, 16, 19, 26], label: 'maj7 B: 7-3-5-9', category: 'Rootless B (Evans/Levine)' },
    { offsets: [4, 7, 11, 14], label: 'maj7 Drop-2 Root Pos: 3-5-7-9', category: 'Drop-2 Open Voicing' },
    { offsets: [7, 11, 14, 16], label: 'maj7 Drop-2 1st Inv: 5-7-9-3', category: 'Drop-2 Open Voicing' },
    { offsets: [11, 14, 16, 19], label: 'maj7 Drop-2 2nd Inv: 7-9-3-5', category: 'Drop-2 Open Voicing' },
    { offsets: [4, 11, 14], label: 'maj7 Shell: 3-7-9', category: 'Red Garland Shell & Stab' },
    { offsets: [4, 9, 11, 14], label: 'maj7 Modern Cluster: 3-6-7-9', category: 'Modern Cluster & Neo-Soul' },
    { offsets: [11, 16, 21, 26], label: 'maj7 Quartal Spread: 7-3-6-9', category: 'Quartal / So What (Tyner/Glasper)' },
  ],

  maj9: [
    { offsets: [4, 11, 14, 21], label: 'maj9 A: 3-7-9-13', category: 'Rootless A (Evans/Levine)' },
    { offsets: [11, 14, 16, 21], label: 'maj9 B: 7-9-3-13', category: 'Rootless B (Evans/Levine)' },
    { offsets: [4, 11, 18, 21], label: 'maj9 Lydian: 3-7-#11-13', category: 'Rootless A (Evans/Levine)' },
    { offsets: [14, 16, 21, 23], label: 'maj9 Drop-3 Open: 9-3-13-7', category: 'Drop-3 Warm Voicing' },
    { offsets: [4, 7, 11, 14, 21], label: 'maj9 Barron 5-Note: 3-5-7-9-13', category: 'Kenny Barron Open 4ths/5ths' },
    { offsets: [4, 14, 16, 21], label: 'maj9 Neo-Soul Cluster: 3-9-3-13', category: 'Modern Cluster & Neo-Soul' },
  ],

  maj13: [
    { offsets: [4, 11, 14, 21], label: 'maj13 A: 3-7-9-13', category: 'Rootless A (Evans/Levine)' },
    { offsets: [11, 14, 16, 21], label: 'maj13 B: 7-9-3-13', category: 'Rootless B (Evans/Levine)' },
    { offsets: [4, 9, 11, 14, 21], label: 'maj13 6/9 Stack: 3-6-7-9-13', category: 'Barry Harris 6th-Diminished' },
    { offsets: [11, 16, 21, 26, 28], label: 'maj13 Open Concert: 7-3-6-9-3', category: 'Kenny Barron Open 4ths/5ths' },
  ],

  'maj7#11': [
    { offsets: [4, 11, 14, 18], label: 'maj7#11 A: 3-7-9-#11', category: 'Rootless A (Evans/Levine)' },
    { offsets: [11, 16, 18, 21], label: 'maj7#11 B: 7-3-#11-13', category: 'Rootless B (Evans/Levine)' },
    { offsets: [4, 18, 23, 26], label: 'maj7#11 UST II: 3-#11-7-9', category: 'Upper Structure Triad (UST)' },
    { offsets: [4, 11, 18, 21], label: 'maj7#11 Lydian Spread: 3-7-#11-13', category: 'Drop-2 Open Voicing' },
  ],

  '6': [
    { offsets: [4, 7, 9, 14], label: '6 Close: 3-5-6-9', category: 'Drop-2 Open Voicing' },
    { offsets: [9, 14, 16], label: '6 Sparse: 6-9-3', category: 'Red Garland Shell & Stab' },
    { offsets: [4, 9, 14, 16], label: '6 Barry Harris: 3-6-9-3', category: 'Barry Harris 6th-Diminished' },
  ],

  '69': [
    { offsets: [4, 7, 9, 14], label: '6/9 Evans Classic: 3-5-6-9', category: 'Rootless A (Evans/Levine)' },
    { offsets: [9, 14, 16, 19], label: '6/9 Herbie Open: 6-9-3-5', category: 'Rootless B (Evans/Levine)' },
    { offsets: [4, 9, 14, 18], label: '6/9 Glasper Modern: 3-6-9-#11', category: 'Modern Cluster & Neo-Soul' },
    { offsets: [4, 9, 14, 16, 19], label: '6/9 5-Note Spread: 3-6-9-3-5', category: 'Kenny Barron Open 4ths/5ths' },
  ],

  madd9: [
    { offsets: [3, 7, 14], label: 'madd9 Open: b3-5-9', category: 'Red Garland Shell & Stab' },
    { offsets: [3, 7, 14, 15], label: 'madd9 Cluster: b3-5-9-b3', category: 'Modern Cluster & Neo-Soul' },
    { offsets: [14, 15, 19], label: 'madd9 Close: 9-b3-5', category: 'Drop-2 Open Voicing' },
  ],

  // ── MINOR ─────────────────────────────────────────────────────────────────
  m7: [
    { offsets: [3, 10, 14, 17], label: 'm7 A: b3-b7-9-11', category: 'Rootless A (Evans/Levine)' },
    { offsets: [10, 15, 17, 19], label: 'm7 B: b7-b3-11-5', category: 'Rootless B (Evans/Levine)' },
    { offsets: [3, 7, 10, 14], label: 'm7 Drop-2 Root Pos: b3-5-b7-9', category: 'Drop-2 Open Voicing' },
    { offsets: [7, 10, 14, 15], label: 'm7 Drop-2 1st Inv: 5-b7-9-b3', category: 'Drop-2 Open Voicing' },
    { offsets: [10, 14, 15, 19], label: 'm7 Drop-2 2nd Inv: b7-9-b3-5', category: 'Drop-2 Open Voicing' },
    { offsets: [3, 10, 14], label: 'm7 Shell: b3-b7-9', category: 'Red Garland Shell & Stab' },
    { offsets: [10, 15, 22, 26], label: 'm7 So What Open: b7-b3-b7-9', category: 'Quartal / So What (Tyner/Glasper)' },
  ],

  m9: [
    { offsets: [3, 10, 14, 17], label: 'm9 Evans: b3-b7-9-11', category: 'Rootless A (Evans/Levine)' },
    { offsets: [10, 14, 15, 19], label: 'm9 Herbie: b7-9-b3-5', category: 'Rootless B (Evans/Levine)' },
    { offsets: [14, 15, 19, 22], label: 'm9 Glasper: 9-b3-5-b7', category: 'Modern Cluster & Neo-Soul' },
    { offsets: [3, 7, 10, 14, 17], label: 'm9 5-Voice Rich: b3-5-b7-9-11', category: 'Kenny Barron Open 4ths/5ths' },
    { offsets: [10, 15, 19, 26], label: 'm9 Drop-3 Warm: b7-b3-5-9', category: 'Drop-3 Warm Voicing' },
  ],

  m11: [
    { offsets: [3, 10, 14, 17], label: 'm11 Evans Dorian: b3-b7-9-11', category: 'Rootless A (Evans/Levine)' },
    { offsets: [17, 22, 26, 27], label: 'm11 McCoy Quartal: 11-b7-9-b3', category: 'Quartal / So What (Tyner/Glasper)' },
    { offsets: [5, 10, 15, 19, 26], label: 'm11 So What Complete: 4-b7-b3-5-9', category: 'Quartal / So What (Tyner/Glasper)' },
    { offsets: [10, 14, 17, 22], label: 'm11 Glasper 4th Stack: b7-9-11-b7', category: 'Modern Cluster & Neo-Soul' },
    { offsets: [3, 10, 14, 17, 21], label: 'm11 Extended Dorian 13: b3-b7-9-11-13', category: 'Kenny Barron Open 4ths/5ths' },
  ],

  m13: [
    { offsets: [3, 10, 14, 21], label: 'm13 A: b3-b7-9-13', category: 'Rootless A (Evans/Levine)' },
    { offsets: [10, 14, 15, 21], label: 'm13 B: b7-9-b3-13', category: 'Rootless B (Evans/Levine)' },
    { offsets: [3, 9, 14, 17], label: 'm13 Dorian Cluster: b3-6-9-11', category: 'Modern Cluster & Neo-Soul' },
  ],

  m6: [
    { offsets: [3, 9, 14, 19], label: 'm6 Evans Modal: b3-6-9-5', category: 'Rootless A (Evans/Levine)' },
    { offsets: [9, 14, 15, 19], label: 'm6 Herbie Inversion: 6-9-b3-5', category: 'Rootless B (Evans/Levine)' },
    { offsets: [3, 7, 9, 14], label: 'm6 Barry Harris Minor 6: b3-5-6-9', category: 'Barry Harris 6th-Diminished' },
  ],

  m69: [
    { offsets: [3, 7, 9, 14], label: 'm6/9 Close: b3-5-6-9', category: 'Barry Harris 6th-Diminished' },
    { offsets: [9, 14, 15, 19], label: 'm6/9 Open: 6-9-b3-5', category: 'Drop-2 Open Voicing' },
    { offsets: [3, 9, 14, 17], label: 'm6/9 Glasper: b3-6-9-11', category: 'Modern Cluster & Neo-Soul' },
  ],

  mmaj7: [
    { offsets: [3, 11, 14, 17], label: 'm(maj7) Evans Melodic: b3-7-9-11', category: 'Rootless A (Evans/Levine)' },
    { offsets: [11, 14, 15, 19], label: 'm(maj7) B-form: 7-9-b3-5', category: 'Rootless B (Evans/Levine)' },
    { offsets: [3, 7, 11, 14], label: 'm(maj7) Close Drop-2: b3-5-7-9', category: 'Drop-2 Open Voicing' },
  ],

  // ── DOMINANT ──────────────────────────────────────────────────────────────
  '7': [
    { offsets: [4, 10, 14, 21], label: '7 A: 3-b7-9-13', category: 'Rootless A (Evans/Levine)' },
    { offsets: [10, 14, 16, 21], label: '7 B: b7-9-3-13', category: 'Rootless B (Evans/Levine)' },
    { offsets: [4, 10, 14, 18], label: '7#11 Lydian Dom: 3-b7-9-#11', category: 'Altered & Symmetrical Dominant' },
    { offsets: [4, 10, 14], label: '7 Shell: 3-b7-9', category: 'Red Garland Shell & Stab' },
    { offsets: [10, 16, 21, 26], label: '7 Drop-2 Open: b7-3-13-9', category: 'Drop-2 Open Voicing' },
  ],

  '9': [
    { offsets: [4, 10, 14, 21], label: '9 Evans: 3-b7-9-13', category: 'Rootless A (Evans/Levine)' },
    { offsets: [10, 14, 16, 21], label: '9 Herbie: b7-9-3-13', category: 'Rootless B (Evans/Levine)' },
    { offsets: [4, 7, 10, 14], label: '9 Drop-2 Close: 3-5-b7-9', category: 'Drop-2 Open Voicing' },
    { offsets: [14, 16, 21, 22], label: '9 Glasper: 9-3-13-b7', category: 'Modern Cluster & Neo-Soul' },
    { offsets: [10, 16, 21, 26], label: '9 Quartal Dominant: b7-3-13-9', category: 'Quartal / So What (Tyner/Glasper)' },
  ],

  '13': [
    { offsets: [4, 10, 14, 21], label: '13 A: 3-b7-9-13', category: 'Rootless A (Evans/Levine)' },
    { offsets: [10, 14, 16, 21], label: '13 B: b7-9-3-13', category: 'Rootless B (Evans/Levine)' },
    { offsets: [4, 10, 18, 21], label: '13#11 UST II: 3-b7-#11-13', category: 'Upper Structure Triad (UST)' },
    { offsets: [10, 14, 21, 28], label: '13 Open Concert: b7-9-13-3', category: 'Kenny Barron Open 4ths/5ths' },
    { offsets: [4, 21, 22, 26], label: '13 Glasper: 3-13-b7-9', category: 'Modern Cluster & Neo-Soul' },
  ],

  '7b9': [
    { offsets: [4, 10, 13, 21], label: '7b9 Evans: 3-b7-b9-13', category: 'Rootless A (Evans/Levine)' },
    { offsets: [10, 13, 16, 21], label: '7b9 Herbie: b7-b9-3-13', category: 'Rootless B (Evans/Levine)' },
    { offsets: [4, 10, 13, 18], label: '7b9#11 UST bV: 3-b7-b9-#11', category: 'Upper Structure Triad (UST)' },
    { offsets: [10, 13, 16, 18], label: '7b9#11 Diminished: b7-b9-3-#11', category: 'Altered & Symmetrical Dominant' },
    { offsets: [4, 10, 13, 15], label: '7b9#9 Barry Harris: 3-b7-b9-#9', category: 'Barry Harris 6th-Diminished' },
  ],

  '7#9': [
    { offsets: [4, 10, 15, 21], label: '7#9 Evans: 3-b7-#9-13', category: 'Rootless A (Evans/Levine)' },
    { offsets: [10, 15, 16, 20], label: '7#9b13 UST bVI: b7-#9-3-b13', category: 'Upper Structure Triad (UST)' },
    { offsets: [4, 10, 15, 20], label: '7#9b13 Evans Altered: 3-b7-#9-b13', category: 'Altered & Symmetrical Dominant' },
    { offsets: [10, 15, 16, 18], label: '7#9#11 Glasper: b7-#9-3-#11', category: 'Modern Cluster & Neo-Soul' },
  ],

  '7alt': [
    { offsets: [4, 10, 13, 20], label: '7alt A: 3-b7-b9-b13', category: 'Rootless A (Evans/Levine)' },
    { offsets: [10, 13, 16, 20], label: '7alt B: b7-b9-3-b13', category: 'Rootless B (Evans/Levine)' },
    { offsets: [4, 10, 15, 18], label: '7alt C: 3-b7-#9-#11', category: 'Altered & Symmetrical Dominant' },
    { offsets: [10, 15, 18, 20], label: '7alt D: b7-#9-#11-b13', category: 'Altered & Symmetrical Dominant' },
    { offsets: [4, 13, 20, 22], label: '7alt Glasper: 3-b9-b13-b7', category: 'Modern Cluster & Neo-Soul' },
    { offsets: [4, 10, 15, 20, 25], label: '7alt UST bVI Full: 3-b7-#9-b13-#9', category: 'Upper Structure Triad (UST)' },
  ],

  '7#11': [
    { offsets: [4, 10, 14, 18], label: '7#11 Lydian Dominant A: 3-b7-9-#11', category: 'Rootless A (Evans/Levine)' },
    { offsets: [10, 14, 16, 18], label: '7#11 Lydian Dominant B: b7-9-3-#11', category: 'Rootless B (Evans/Levine)' },
    { offsets: [4, 10, 18, 21], label: '7#11 UST II: 3-b7-#11-13', category: 'Upper Structure Triad (UST)' },
  ],

  '7b13': [
    { offsets: [4, 10, 14, 20], label: '7b13 A: 3-b7-9-b13', category: 'Rootless A (Evans/Levine)' },
    { offsets: [10, 14, 16, 20], label: '7b13 B: b7-9-3-b13', category: 'Rootless B (Evans/Levine)' },
    { offsets: [4, 10, 15, 20], label: '7b13 UST bVI: 3-b7-#9-b13', category: 'Upper Structure Triad (UST)' },
  ],

  '13b9': [
    { offsets: [4, 10, 13, 21], label: '13b9 Evans: 3-b7-b9-13', category: 'Rootless A (Evans/Levine)' },
    { offsets: [10, 13, 16, 21], label: '13b9 Herbie: b7-b9-3-13', category: 'Rootless B (Evans/Levine)' },
    { offsets: [4, 10, 21, 25], label: '13b9 UST VI: 3-b7-13-b9', category: 'Upper Structure Triad (UST)' },
  ],

  '9#11': [
    { offsets: [4, 10, 14, 18], label: '9#11 A: 3-b7-9-#11', category: 'Rootless A (Evans/Levine)' },
    { offsets: [10, 14, 16, 18], label: '9#11 B: b7-9-3-#11', category: 'Rootless B (Evans/Levine)' },
    { offsets: [4, 14, 18, 22], label: '9#11 Quartal Dom: 3-9-#11-b7', category: 'Quartal / So What (Tyner/Glasper)' },
  ],

  // ── SUSPENDED ─────────────────────────────────────────────────────────────
  '9sus4': [
    { offsets: [5, 10, 14, 17], label: '9sus4 Herbie Quartal: 4-b7-9-11', category: 'Quartal / So What (Tyner/Glasper)' },
    { offsets: [10, 14, 17, 22], label: '9sus4 Evans Open: b7-9-4-b7', category: 'Rootless B (Evans/Levine)' },
    { offsets: [5, 10, 14, 19], label: '9sus4 Drop-2: 4-b7-9-5', category: 'Drop-2 Open Voicing' },
    { offsets: [5, 10, 14], label: '9sus4 Shell: 4-b7-9', category: 'Red Garland Shell & Stab' },
  ],

  '7sus4': [
    { offsets: [5, 10, 14], label: '7sus4 Glasper: 4-b7-9', category: 'Modern Cluster & Neo-Soul' },
    { offsets: [5, 10, 17], label: '7sus4 Quartal Stack: 4-b7-11', category: 'Quartal / So What (Tyner/Glasper)' },
    { offsets: [10, 14, 17], label: '7sus4 Inversion: b7-9-4', category: 'Drop-2 Open Voicing' },
  ],

  '13sus4': [
    { offsets: [5, 10, 14, 21], label: '13sus4 A: 4-b7-9-13', category: 'Rootless A (Evans/Levine)' },
    { offsets: [10, 14, 17, 21], label: '13sus4 B: b7-9-11-13', category: 'Rootless B (Evans/Levine)' },
    { offsets: [5, 10, 14, 19, 21], label: '13sus4 Barron 5-Note: 4-b7-9-5-13', category: 'Kenny Barron Open 4ths/5ths' },
  ],

  '7b9sus4': [
    { offsets: [5, 10, 13, 17], label: '7b9sus4 Quartal: 4-b7-b9-11', category: 'Quartal / So What (Tyner/Glasper)' },
    { offsets: [10, 13, 17, 21], label: '7b9sus4 Phrygian: b7-b9-11-13', category: 'Altered & Symmetrical Dominant' },
  ],

  // ── HALF-DIMINISHED & DIMINISHED ──────────────────────────────────────────
  m7b5: [
    { offsets: [3, 6, 10, 14], label: 'm7b5 Evans ii°: b3-b5-b7-9', category: 'Rootless A (Evans/Levine)' },
    { offsets: [10, 15, 17, 18], label: 'm7b5 Herbie B: b7-b3-11-b5', category: 'Rootless B (Evans/Levine)' },
    { offsets: [3, 6, 10, 15], label: 'm7b5 Drop-2 Root Pos: b3-b5-b7-b3', category: 'Drop-2 Open Voicing' },
    { offsets: [6, 10, 15, 18], label: 'm7b5 Drop-2 1st Inv: b5-b7-b3-b5', category: 'Drop-2 Open Voicing' },
    { offsets: [10, 15, 18, 22], label: 'm7b5 Drop-2 2nd Inv: b7-b3-b5-b7', category: 'Drop-2 Open Voicing' },
    { offsets: [3, 6, 10, 14, 17], label: 'm7b5 Locrian Natural 9: b3-b5-b7-9-11', category: 'Kenny Barron Open 4ths/5ths' },
  ],

  dim7: [
    { offsets: [3, 6, 9, 14], label: 'dim7 Evans Passing: b3-b5-bb7-9', category: 'Rootless A (Evans/Levine)' },
    { offsets: [9, 15, 18, 21], label: 'dim7 Barry Harris 6-Dim: bb7-b3-b5-bb7', category: 'Barry Harris 6th-Diminished' },
    { offsets: [3, 6, 9, 12], label: 'dim7 Close: b3-b5-bb7-R', category: 'Drop-2 Open Voicing' },
    { offsets: [6, 9, 15, 18], label: 'dim7 Symmetric: b5-bb7-b3-b5', category: 'Drop-2 Open Voicing' },
  ],

  aug7: [
    { offsets: [4, 8, 10, 14], label: 'aug7 Whole Tone A: 3-#5-b7-9', category: 'Altered & Symmetrical Dominant' },
    { offsets: [10, 14, 16, 20], label: 'aug7 Whole Tone B: b7-9-3-#5', category: 'Altered & Symmetrical Dominant' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Upper Structure Triad Builder
// ─────────────────────────────────────────────────────────────────────────────

export interface UpperStructureDef {
  name: string;
  triadRootOffset: number; // semitones relative to dominant root
  triadQuality: 'maj' | 'min';
  colorTensions: string;
}

export const UPPER_STRUCTURE_TRIADS: UpperStructureDef[] = [
  { name: 'US II (Major triad on 2nd)', triadRootOffset: 2, triadQuality: 'maj', colorTensions: '9, #11, 13 (Lydian Dominant)' },
  { name: 'US bV (Major triad on b5)', triadRootOffset: 6, triadQuality: 'maj', colorTensions: 'b5/#11, b7, b9' },
  { name: 'US bVI (Major triad on b6)', triadRootOffset: 8, triadQuality: 'maj', colorTensions: 'b13, 1, #9 (Altered)' },
  { name: 'US VI (Major triad on 6th)', triadRootOffset: 9, triadQuality: 'maj', colorTensions: '13, b9, 3 (Diminished Dom)' },
  { name: 'US bIII (Major triad on b3)', triadRootOffset: 3, triadQuality: 'maj', colorTensions: '#9, 5, b7' },
  { name: 'US bII (Major triad on b2)', triadRootOffset: 1, triadQuality: 'maj', colorTensions: 'b9, 11, b13' },
  { name: 'US #IV dim (Diminished triad on #4)', triadRootOffset: 6, triadQuality: 'min', colorTensions: '#11, 13, b9' },
];

/** Build specific UST notes in right hand with 3rd & 7th guide tones in left hand */
export function buildUpperStructureVoicing(
  rootPc: number,
  ust: UpperStructureDef,
  octave = 4
): number[] {
  const rootMidi = rootPc + (octave + 1) * 12;
  const guide3 = rootMidi + 4;
  const guide7 = rootMidi + 10;

  const triadRoot = (rootPc + ust.triadRootOffset) % 12;
  const triadRootMidi = closestMidiForPc(triadRoot, rootMidi + 14);

  const triad3 = triadRootMidi + (ust.triadQuality === 'maj' ? 4 : 3);
  const triad5 = triadRootMidi + 7;

  return [guide3, guide7, triadRootMidi, triad3, triad5].sort((a, b) => a - b);
}

// ─────────────────────────────────────────────────────────────────────────────
// Jazz Voicing Engine
// ─────────────────────────────────────────────────────────────────────────────

export interface JazzVoicingResult {
  midiNotes: number[];
  shapeLabel: string;
  category: VoicingCategory;
}

/**
 * jazzVoicing()
 * Selects and places the best voicing shape for a given chord quality.
 */
export function jazzVoicing(
  rootPc: number,
  quality: QualityKey,
  anchor: number,
  prevUpperMidis: number[] = [],
  preferredCategory?: VoicingCategory
): JazzVoicingResult {
  const shapes = JAZZ_VOICING_SHAPES[quality] || JAZZ_VOICING_SHAPES.maj7;

  const filteredShapes = preferredCategory
    ? shapes.filter((s) => s.category === preferredCategory)
    : shapes;

  const activeShapes = filteredShapes.length > 0 ? filteredShapes : shapes;

  const LOW = 48; // C3
  const HIGH = 88; // E6

  interface Candidate {
    notes: number[];
    shape: VoicingShape;
  }

  const candidates: Candidate[] = [];

  for (const shape of activeShapes) {
    for (const octShift of [-12, 0, 12]) {
      const rootMidi = closestMidiForPc(rootPc, anchor) + octShift;
      const placed = shape.offsets.map((o) => rootMidi + o);
      if (placed[0] >= LOW && placed[placed.length - 1] <= HIGH) {
        candidates.push({ notes: placed, shape });
      }
    }
  }

  if (candidates.length === 0) {
    const rootMidi = closestMidiForPc(rootPc, anchor);
    const placed = activeShapes[0].offsets.map((o) => rootMidi + o);
    return {
      midiNotes: placed,
      shapeLabel: activeShapes[0].label,
      category: activeShapes[0].category,
    };
  }

  if (prevUpperMidis.length === 0) {
    const med = (v: number[]) => v[Math.floor(v.length / 2)];
    const best = candidates.reduce((b, cand) =>
      Math.abs(med(cand.notes) - anchor) < Math.abs(med(b.notes) - anchor) ? cand : b
    );
    return {
      midiNotes: best.notes,
      shapeLabel: best.shape.label,
      category: best.shape.category,
    };
  }

  // Voice leading cost
  const vlCost = (notes: number[]): number =>
    notes.reduce((sum, note) => {
      const nearest = prevUpperMidis.reduce((b, p) =>
        Math.abs(p - note) < Math.abs(b - note) ? p : b,
        prevUpperMidis[0]
      );
      return sum + Math.abs(nearest - note);
    }, 0);

  const best = candidates.reduce((b, cand) =>
    vlCost(cand.notes) < vlCost(b.notes) ? cand : b
  );

  return {
    midiNotes: best.notes,
    shapeLabel: best.shape.label,
    category: best.shape.category,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Real Jazz Pianist Performance & Velocity Modeling
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Per-voice velocity shaped exactly like a master jazz pianist's touch:
 *
 *   - Bass Note: Grounded, warm, clear fundamental without mud (~74–82%)
 *   - Guide Tones (3 & 7): Inner harmonic warmth, slightly recessed (~78–86%)
 *   - Melody / Lead Voice (Top note): Sings above the cluster (~94–100%)
 *   - Dynamic phrasing arc across progression beats.
 */
export function chordVelocities(
  midiNotes: number[],
  baseVelocity = 0.78,
  handBalance: 'balanced' | 'leadSing' | 'bassSolid' | 'warmTrio' = 'leadSing'
): number[] {
  if (midiNotes.length === 0) return [];
  if (midiNotes.length === 1) return [baseVelocity];

  // Natural dynamic micro-variation (±6%)
  const chordDynamic = baseVelocity * (0.94 + Math.random() * 0.12);
  const n = midiNotes.length;
  const jitter = () => (Math.random() - 0.5) * 0.05;

  return midiNotes.map((_, i) => {
    let scalar = 0.82;
    if (i === 0) {
      scalar = handBalance === 'bassSolid' ? 0.88 : 0.76;
    } else if (i === n - 1) {
      scalar = handBalance === 'leadSing' ? 1.00 : 0.92;
    } else {
      scalar = handBalance === 'warmTrio' ? 0.88 : 0.82;
    }

    return Math.min(1.0, Math.max(0.25, chordDynamic * scalar + jitter()));
  });
}

/**
 * Cascade Knob onset offsets (seconds) for natural strum feel.
 * Supports:
 *   - 'ease' (Pianist Roll): Exponential ease-in from bass to treble
 *   - 'up': Linear bottom to top strum
 *   - 'down': Top to bottom roll
 *   - 'flam': Split two-hand attack (LH bass first, RH cluster instant)
 */
export function calculateCascadeOffsets(
  noteCount: number,
  spreadMs: number, // 0 to 80 ms
  direction: CascadeDirection = 'ease'
): number[] {
  if (noteCount <= 1 || spreadMs <= 0) {
    return Array(noteCount).fill(0);
  }

  const totalSec = spreadMs / 1000;
  const jitterMs = () => (Math.random() - 0.5) * 2; // ±1ms micro-jitter

  switch (direction) {
    case 'up':
      return Array.from({ length: noteCount }, (_, i) => {
        const t = i / (noteCount - 1);
        return t * totalSec + jitterMs() / 1000;
      });

    case 'down':
      return Array.from({ length: noteCount }, (_, i) => {
        const t = (noteCount - 1 - i) / (noteCount - 1);
        return t * totalSec + jitterMs() / 1000;
      });

    case 'flam':
      return Array.from({ length: noteCount }, (_, i) => {
        if (i === 0) return 0;
        return totalSec + (Math.random() * 0.003);
      });

    case 'ease':
    default:
      // Exponential curve: bass hits firmly, upper notes ripple
      return Array.from({ length: noteCount }, (_, i) => {
        const t = i / (noteCount - 1);
        const curved = t * t;
        return curved * totalSec + jitterMs() / 1000;
      });
  }
}

/** Backwards-compatible alias */
export function strumOffsets(count: number, strumSec = 0.020): number[] {
  return calculateCascadeOffsets(count, strumSec * 1000, 'ease');
}
