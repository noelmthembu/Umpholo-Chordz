/** Underlying 7-note scale modes used internally to compute scale-degree
 * root pitches for a given Feel. Not shown directly in the UI anymore. */
export type ModeName =
  | 'Major'
  | 'Dorian'
  | 'Phrygian'
  | 'Lydian'
  | 'Mixolydian'
  | 'Aeolian'
  | 'Locrian';

/** The genre/harmonic "feel" the person picks in the UI. Each one carries
 * its own hand-written, genre-authentic chord-quality progressions (not
 * just diatonic 7ths stacked at random) — real functional harmony moves
 * like secondary dominants, passing diminished chords, tritone subs, and
 * modal-interchange borrowed chords, in the style associated with each
 * genre's well-known harmonic vocabulary. */
export type FeelKey =
  | 'minor'
  | 'major'
  | 'soulful'
  | 'jazzy'
  | 'gospel'
  | 'rnb'
  | 'jazzblues';

export type StyleKey =
  | 'kabza'
  | 'melmusiq'
  | 'kelvinmomo'
  | 'djstoks'
  | 'soulfuldesciple'
  | 'melomusiq'
  | 'stixx'
  | 'bandros'
  | 'masmusiq'
  | 'deepphil'
  | 'djyvino'
  | 'jappino';

export type InstrumentKey = 'piano' | 'rhodes' | 'pad' | 'organ' | 'abtpiano';

/** Explicit chord-quality vocabulary — every chord in a progression is
 * built from one of these, rather than a blind diatonic third-stack, so
 * the qualities that come out (dominant 7s, half-diminished ii chords,
 * altered dominants, passing diminished 7ths, sus chords…) match real
 * harmonic practice for the genre. */
export type QualityKey =
  | 'maj7' | 'maj9' | '6' | '69' | 'madd9'
  | 'm7' | 'm9' | 'm11' | 'm6'
  | '7' | '9' | '13' | '7b9' | '7#9' | '7alt' | '9sus4' | '7sus4'
  | 'm7b5' | 'dim7';

export interface ChordTone {
  pc: number;
  semitoneFromRoot: number;
}

export interface Chord {
  degree: number;
  rootPc: number;
  tones: ChordTone[];
  symbol: string;
  midiNotes: number[];
  startBeat: number;
  lengthBeats: number;
}

export interface StyleProfile {
  label: string;
  /** Probability that a layered color tension (e.g. a ♭9, ♯11, or add13)
   * gets voiced on top of a chord, tuned per artist for how "extended" and
   * lush their piano touch typically is. */
  altProb: number;
  register: number;
}

export interface GenerationParams {
  rootPc: number;
  mode: FeelKey;
  style: StyleKey;
  bars: number;
  bpm: number;
  swing: number;
}
