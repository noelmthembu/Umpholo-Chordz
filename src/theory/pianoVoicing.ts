import type { QualityKey, VoicingCategory } from '../types';
import { QUALITY_TONES } from './chords';
import { closestMidiForPc, jazzVoicing } from './voicing';

export interface PianoVoicingOptions {
  rootPc: number;
  quality: QualityKey;
  anchor: number;
  previousUpperMidis?: number[];
  previousBassMidi?: number | null;
  preferredCategory?: VoicingCategory;
  densityBias?: number;
  register?: number;
  variation?: number;
}

export interface PianoVoicingResult {
  midiNotes: number[];
  bassMidiNotes: number[];
  upperMidiNotes: number[];
  shapeLabel: string;
  category: VoicingCategory;
}

const BASS_LOW = 28; // E0 — low enough for weight without muddying the piano
const BASS_HIGH = 47; // B2 — keeps the foundation below the right hand
const UPPER_LOW = 50; // D3
const UPPER_HIGH = 84; // C6

function constrainToRange(note: number, low: number, high: number): number {
  let result = note;
  while (result < low) result += 12;
  while (result > high) result -= 12;
  return result;
}

function enrichUpperStructure(
  rootPc: number,
  quality: QualityKey,
  notes: number[],
  targetCount: number,
  variation: number
): number[] {
  const result = [...new Set(notes)].sort((a, b) => a - b);
  if (result.length >= targetCount) return result;

  const existingPitchClasses = new Set(result.map((note) => ((note % 12) + 12) % 12));
  const chordOffsets = QUALITY_TONES[quality] || QUALITY_TONES.maj7;
  const prioritized = [...chordOffsets.filter((offset) => offset !== 0), 0];
  const orderedOffsets = variation % 2 === 0 ? prioritized.reverse() : prioritized;

  for (const offset of orderedOffsets) {
    if (result.length >= targetCount) break;

    const pitchClass = (rootPc + offset) % 12;
    if (offset !== 0 && existingPitchClasses.has(pitchClass)) continue;

    const target = Math.max(UPPER_LOW, (result[result.length - 1] ?? UPPER_LOW) + 2);
    let added = closestMidiForPc(pitchClass, target);
    while (added <= (result[result.length - 1] ?? UPPER_LOW)) added += 12;
    if (added > UPPER_HIGH) {
      added -= 12;
    }

    if (added >= UPPER_LOW && added <= UPPER_HIGH && !result.includes(added)) {
      result.push(added);
      result.sort((a, b) => a - b);
      existingPitchClasses.add(pitchClass);
    }
  }

  // Real comping voicings keep stacking once every chord tone has been used
  // once — most commonly doubling the 3rd, 7th, or root an octave above the
  // current top note (a la the octave-doubled melody notes in the reference
  // chords). Once unique pitch classes are exhausted, keep layering the same
  // priority tones an octave higher until the target density is reached.
  let guard = 0;
  while (result.length < targetCount && guard < 8) {
    guard += 1;
    const doubleOffset = prioritized[guard % prioritized.length];
    const pitchClass = (rootPc + doubleOffset) % 12;
    const target = Math.max(UPPER_LOW, (result[result.length - 1] ?? UPPER_LOW) + 2);
    let added = closestMidiForPc(pitchClass, target);
    while (added <= (result[result.length - 1] ?? UPPER_LOW)) added += 12;
    if (added > UPPER_HIGH) added -= 12;
    if (added >= UPPER_LOW && added <= UPPER_HIGH && !result.includes(added)) {
      result.push(added);
      result.sort((a, b) => a - b);
    } else {
      break;
    }
  }

  return result;
}

/**
 * Builds a practical two-hand piano chord from a jazz upper structure.
 *
 * The supplied references consistently use a low root (often reinforced at
 * the octave), followed by 3–5 right-hand voices. This creates five to seven
 * sounding notes with a 22–31 semitone span rather than a uniform four-note
 * block chord.
 */
export function buildPianoVoicing(options: PianoVoicingOptions): PianoVoicingResult {
  const {
    rootPc,
    quality,
    anchor,
    previousUpperMidis = [],
    previousBassMidi = null,
    preferredCategory,
    densityBias = 0.6,
    register = 0,
    variation = 0,
  } = options;

  // The reference recordings (Amapiano/soulful house comping) almost never sit
  // at a bare four-note block chord: they stack a 3rd, 5th, 7th and one or two
  // color tones (9/11/13) in the right hand while the left hand holds a root
  // that is very often doubled at the octave. Target 5-6 right-hand voices so
  // the combined chord (bass + upper) lands in the 6-8 note range those files
  // show, rather than the previous 4-5 note minimum.
  const targetUpperCount = densityBias >= 0.7 ? 6 : densityBias >= 0.4 ? 5 : 4;
  const upper = jazzVoicing(
    rootPc,
    quality,
    anchor,
    previousUpperMidis,
    preferredCategory,
    variation
  );
  const upperMidiNotes = enrichUpperStructure(rootPc, quality, upper.midiNotes, targetUpperCount, variation);

  const bassTarget = previousBassMidi ?? 36 + Math.min(2, Math.max(0, register)) * 2;
  const bassRoot = constrainToRange(closestMidiForPc(rootPc, bassTarget), BASS_LOW, BASS_HIGH);
  const bassOctave = bassRoot + 12;
  // Reference chords double the root at the octave in the overwhelming
  // majority of comped voicings (root in the low register, root repeated an
  // octave up right below the right-hand structure). Only skip the doubling
  // when it would land inside a semitone/whole-tone of the lowest right-hand
  // voice, which is the one case that actually sounds muddy.
  const lowestUpper = upperMidiNotes[0] ?? UPPER_LOW;
  const collidesWithUpper = upperMidiNotes.includes(bassOctave);
  const tooCloseToUpper = lowestUpper - bassOctave >= 0 && lowestUpper - bassOctave <= 2;
  const canDoubleBass = densityBias >= 0.25 && !collidesWithUpper && !tooCloseToUpper;
  const bassMidiNotes = canDoubleBass ? [bassRoot, bassOctave] : [bassRoot];

  const midiNotes = [...new Set([...bassMidiNotes, ...upperMidiNotes])].sort((a, b) => a - b);
  const colorAdded = upperMidiNotes.length > upper.midiNotes.length;
  const bassLabel = bassMidiNotes.length === 2 ? 'root + octave bass' : 'root bass';

  return {
    midiNotes,
    bassMidiNotes,
    upperMidiNotes,
    shapeLabel: `Full piano (${bassLabel}) • ${upper.shapeLabel}${colorAdded ? ' + color' : ''}`,
    category: upper.category,
  };
}
