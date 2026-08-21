/** Underlying 7-note scale modes used internally to compute scale-degree
 * root pitches for a given Feel. */
export type ModeName =
  | 'Major'
  | 'Dorian'
  | 'Phrygian'
  | 'Lydian'
  | 'Mixolydian'
  | 'Aeolian'
  | 'Locrian'
  | 'MelodicMinor'
  | 'HarmonicMinor'
  | 'Altered'
  | 'Diminished';

/** The genre/harmonic "feel" the person picks in the UI. */
export type FeelKey =
  | 'minor'
  | 'major'
  | 'soulful'
  | 'jazzy'
  | 'gospel'
  | 'rnb'
  | 'jazzblues'
  | 'modaljazz'
  | 'bossanova'
  | 'coltrane'
  | 'ballad'
  | 'bebopprivate';

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
  | 'jappino'
  | 'billevans'
  | 'herbie'
  | 'glasper'
  | 'barryharris'
  | 'mccoytyner'
  | 'kennybarron';

export type InstrumentKey = 'piano' | 'rhodes' | 'pad' | 'organ' | 'abtpiano';

/** Explicit chord-quality vocabulary — rich jazz harmonic vocabulary */
export type QualityKey =
  | 'maj7' | 'maj9' | 'maj13' | 'maj7#11' | '6' | '69' | 'madd9'
  | 'm7' | 'm9' | 'm11' | 'm13' | 'm6' | 'm69' | 'mmaj7'
  | '7' | '9' | '13' | '7b9' | '7#9' | '7alt' | '7#11' | '7b13' | '13b9' | '9#11'
  | '9sus4' | '7sus4' | '13sus4' | '7b9sus4'
  | 'm7b5' | 'dim7' | 'aug7';

export interface ChordTone {
  pc: number;
  semitoneFromRoot: number;
  role?: string;
}

export interface Chord {
  degree: number;
  rootPc: number;
  quality?: QualityKey;
  tones: ChordTone[];
  symbol: string;
  midiNotes: number[];
  /** Low-hand foundation, typically root plus octave when space allows. */
  bassMidiNotes?: number[];
  /** Right-hand guide tones, extensions, and melodic color. */
  upperMidiNotes?: number[];
  /** Cycles among nearby voice-led shapes when the arranger requests a revoice. */
  voicingVariant?: number;
  startBeat: number;
  lengthBeats: number;
  voicingLabel?: string;
  voicingCategory?: VoicingCategory;
}

export interface StyleProfile {
  label: string;
  artist: string;
  /** Probability of adding upper-structure color tension */
  altProb: number;
  register: number;
  densityBias?: number; // 0 = sparse/shells, 1 = dense/clusters
}

export type CascadeDirection = 'up' | 'down' | 'flam' | 'ease';

export interface CascadeParams {
  spreadMs: number; // 0 ms to 80 ms
  direction: CascadeDirection;
}

export interface HumanFeelParams {
  velocityHumanize: number; // 0 to 1
  timingJitterMs: number;   // 0 to 20 ms
  handBalance: 'balanced' | 'leadSing' | 'bassSolid' | 'warmTrio';
}

export interface GenerationParams {
  rootPc: number;
  mode: FeelKey;
  style: StyleKey;
  bars: number;
  bpm: number;
  swing: number;
  cascadeMs?: number;
  cascadeDirection?: CascadeDirection;
}

// ─────────────────────────────────────────────────────────────────────────────
// Voicing Library & 1,500+ Unique Voicings Types
// ─────────────────────────────────────────────────────────────────────────────

export type VoicingCategory =
  | 'Rootless A (Evans/Levine)'
  | 'Rootless B (Evans/Levine)'
  | 'Drop-2 Open Voicing'
  | 'Drop-3 Warm Voicing'
  | 'Drop-2 & 4 Spacious'
  | 'Quartal / So What (Tyner/Glasper)'
  | 'Upper Structure Triad (UST)'
  | 'Barry Harris 6th-Diminished'
  | 'Modern Cluster & Neo-Soul'
  | 'Kenny Barron Open 4ths/5ths'
  | 'Red Garland Shell & Stab'
  | 'Altered & Symmetrical Dominant';

export interface VoicingEntry {
  id: string;
  rootPc: number;
  rootName: string;
  quality: QualityKey;
  symbol: string;
  category: VoicingCategory;
  label: string;
  offsets: number[];
  midiNotes: number[];
  spanSemitones: number;
  description: string;
  intervals: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Modulation System Types
// ─────────────────────────────────────────────────────────────────────────────

export type ModulationType =
  | 'cycle5_dom'
  | 'cycle5_subdom'
  | 'tritone_sub'
  | 'chromatic_mediant_flat'
  | 'chromatic_mediant_sharp'
  | 'backdoor_cadence'
  | 'coltrane_matrix'
  | 'diminished_pivot'
  | 'modal_interchange'
  | 'secondary_dominant_chain';

export interface ModulationSuggestion {
  id: string;
  type: ModulationType;
  title: string;
  targetKeyName: string;
  targetRootPc: number;
  harmonicConcept: string;
  explanation: string;
  transitionChords: Chord[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 150 Performed Progressions Library Types
// ─────────────────────────────────────────────────────────────────────────────

export type ProgressionGenre =
  | 'Essential Standards & ii-V-I'
  | 'Bill Evans & Impressionism'
  | 'Bebop & Hard Bop'
  | 'Modern Modal & Quartal'
  | 'Neo-Soul & R&B Jazz'
  | 'Bossa Nova & Latin Jazz'
  | 'Gospel Jazz & Praise'
  | 'Coltrane Changes & Mediants';

export interface PerformedProgression {
  id: string;
  title: string;
  genre: ProgressionGenre;
  suggestedBpm: number;
  feel: FeelKey;
  defaultRootPc: number;
  description: string;
  tags: string[];
  steps: {
    rootOffset: number; // semitones relative to tonic
    degree: number;
    quality: QualityKey;
    lengthBeats?: number;
    voicingCategory?: VoicingCategory;
    customVoicingOffsets?: number[];
  }[];
}
