import type { Chord, GenerationParams, QualityKey, StyleKey, StyleProfile } from '../types';
import { pcToMidi, scalePitchClasses } from './scales';
import { buildQualityChordTones, chordSymbolForQuality, qualityFamily } from './chords';
import { closestMidiForPc, voiceLeadUpperStructure } from './voicing';
import { FEEL_PROFILES, feelRootPc, type FeelStep } from './feels';

/**
 * Amapholas / Private-School-piano artist-influence dials. These no longer
 * decide *which* chords play (the Feel's genre-authentic templates do that)
 * — instead they shape the extra color tension layered on top and the
 * register/spacing, i.e. how a given progression is *voiced*, the way a
 * real player's touch differs from the notes on the page.
 */
export const STYLE_PROFILES: Record<StyleKey, StyleProfile> = {
  kabza: {
    label: 'Kabza De Small — spacious, soulful, foundational Amapiano piano',
    altProb: 0.30, register: 0,
  },
  melmusiq: {
    label: 'MelMusiq — melodic, soulful piano runs',
    altProb: 0.25, register: 1,
  },
  kelvinmomo: {
    label: 'Kelvin Momo — Private School pioneer, moody minimalist jazz',
    altProb: 0.38, register: 0,
  },
  djstoks: {
    label: 'DJ Stokie — soulful, warm chord pads',
    altProb: 0.22, register: 0,
  },
  soulfuldesciple: {
    label: 'Soulful Deciple — gospel-tinged, lush 9ths',
    altProb: 0.28, register: 1,
  },
  melomusiq: {
    label: 'Melo Musiq — flowing, jazzy piano phrasing',
    altProb: 0.26, register: 1,
  },
  stixx: {
    label: 'Stixx — bright, bouncy jazzy stabs',
    altProb: 0.18, register: 1,
  },
  bandros: {
    label: 'Bandros — deep, meditative extended voicings',
    altProb: 0.34, register: 0,
  },
  masmusiq: {
    label: 'Mas Musiq — catchy, melodic piano hooks',
    altProb: 0.22, register: 1,
  },
  deepphil: {
    label: 'Deep Phil — deep-house-tinged smooth chords',
    altProb: 0.26, register: 0,
  },
  djyvino: {
    label: 'Djy Vino — soulful Private School warmth',
    altProb: 0.27, register: 0,
  },
  jappino: {
    label: 'Jappino — rich, jazz-forward chord work',
    altProb: 0.32, register: 1,
  },
};

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function weightedPick<K extends string>(weights: Record<K, number>): K {
  const entries = Object.entries(weights) as [K, number][];
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [k, w] of entries) {
    if (r < w) return k;
    r -= w;
  }
  return entries[0][0];
}

/** Extra color tone(s) appropriate to a chord's harmonic family — so any
 * added tension enriches the genre-authentic chord instead of clashing
 * with it. Each option is a semitone offset from the chord root (can
 * exceed 12 to land an octave up, matching the rest of the tone list). */
function tensionOptionsFor(quality: QualityKey): { semi: number; label: string }[] {
  switch (qualityFamily(quality)) {
    case 'major':
      return [
        { semi: 21, label: ' add13' },
        { semi: 18, label: ' \u266f11' },
      ];
    case 'minor':
      return [
        { semi: 17, label: ' 11' },
        { semi: 21, label: ' add13' },
      ];
    case 'dominant':
      return [
        { semi: 13, label: ' \u266d9' },
        { semi: 15, label: ' \u266f9' },
        { semi: 18, label: ' \u266f11' },
      ];
    case 'halfdim':
      return [{ semi: 17, label: ' 11' }];
    case 'dim':
    default:
      return [];
  }
}

/**
 * Generate a chord progression for the chosen genre Feel. `usedProgressions`
 * is a caller-owned Set (persisted for the session) used to avoid repeating
 * the same template until the whole pool for that feel has been exhausted.
 */
export function generateProgression(
  params: GenerationParams,
  usedProgressions: Set<string>
): Chord[] {
  const { rootPc, mode: feelKey, style: styleKey, bars } = params;
  const feel = FEEL_PROFILES[feelKey];
  const style = STYLE_PROFILES[styleKey];
  const scale = scalePitchClasses(rootPc, feel.baseScaleMode);

  let candidates = feel.templates.filter((t) => {
    const sig = `${feelKey}|${t.label}|${rootPc}`;
    return !usedProgressions.has(sig);
  });
  if (candidates.length === 0) {
    feel.templates.forEach((t) => usedProgressions.delete(`${feelKey}|${t.label}|${rootPc}`));
    candidates = feel.templates;
  }
  const template = pick(candidates);
  usedProgressions.add(`${feelKey}|${template.label}|${rootPc}`);

  const steps: FeelStep[] = [];
  for (let i = 0; i < bars; i++) steps.push(template.steps[i % template.steps.length]);

  const bassOctave = 2 + style.register;
  const upperCenter = pcToMidi(0, 4 + style.register); // mid-register anchor for the first chord's upper structure

  const chords: Chord[] = [];
  let prevRootMidi: number | null = null;
  let prevUpperMidis: number[] = [];

  steps.forEach((step, i) => {
    const cRootPc = feelRootPc(rootPc, scale, step.root);
    let { tones } = buildQualityChordTones(cRootPc, step.quality);
    let tensionLabel = '';

    // Layer a style-driven color tone on top of the genre-authentic chord —
    // only from the options that fit that chord's harmonic function, so it
    // adds lushness (the layered tension-and-release soulful/jazzy voicings
    // are known for) rather than a wrong note.
    if (Math.random() < style.altProb) {
      const options = tensionOptionsFor(step.quality);
      if (options.length) {
        const t = pick(options);
        const already = tones.some((tn) => tn.semitoneFromRoot === t.semi);
        if (!already) {
          tones = tones.concat([{ pc: (cRootPc + t.semi) % 12, semitoneFromRoot: t.semi }]);
          tensionLabel = t.label;
        }
      }
    }

    // Root anchors the bass, voice-led to the nearest octave of the
    // previous root so the bassline itself moves smoothly bar to bar.
    const rootMidi = prevRootMidi === null ? pcToMidi(cRootPc, bassOctave) : closestMidiForPc(cRootPc, prevRootMidi);

    // Everything above the root is a rootless upper-structure voicing,
    // voice-led against the previous chord's upper structure so common
    // tones are held and the rest move by the smallest possible step —
    // this is what makes the progression feel like it's breathing instead
    // of jumping around the keyboard.
    const upperPcs = tones.slice(1).map((t) => t.pc);
    const upperMidis = voiceLeadUpperStructure(
      upperPcs,
      prevUpperMidis.length ? prevUpperMidis : [upperCenter],
      upperCenter
    );

    const midiNotes = [rootMidi, ...upperMidis];
    const symbol = chordSymbolForQuality(cRootPc, step.quality) + tensionLabel;
    const degree = 'deg' in step.root ? step.root.deg : -1;

    chords.push({
      degree,
      rootPc: cRootPc,
      tones,
      symbol,
      midiNotes: [...new Set(midiNotes)].sort((a, b) => a - b),
      startBeat: i * 4,
      lengthBeats: 4,
    });

    prevRootMidi = rootMidi;
    prevUpperMidis = upperMidis;
  });

  return chords;
}
