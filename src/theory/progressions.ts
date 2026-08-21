import type { Chord, GenerationParams, StyleKey, StyleProfile } from '../types';
import { pcToMidi, scalePitchClasses } from './scales';
import { buildQualityChordTones, chordSymbolForQuality } from './chords';
import { buildPianoVoicing } from './pianoVoicing';
import { FEEL_PROFILES, feelRootPc, type FeelStep } from './feels';

export const STYLE_PROFILES: Record<StyleKey, StyleProfile> = {
  // Amapiano & Private School Legends
  kabza:          { label: 'Kabza De Small — spacious, soulful, foundational Amapiano piano', artist: 'Kabza De Small', altProb: 0.30, register: 0, densityBias: 0.5 },
  kelvinmomo:     { label: 'Kelvin Momo — Private School pioneer, moody minimalist jazz', artist: 'Kelvin Momo', altProb: 0.38, register: 0, densityBias: 0.6 },
  melmusiq:       { label: 'MelMusiq — melodic, flowing soulful piano runs', artist: 'MelMusiq', altProb: 0.25, register: 1, densityBias: 0.4 },
  djstoks:        { label: 'DJ Stokie — soulful, warm chord pads', artist: 'DJ Stokie', altProb: 0.22, register: 0, densityBias: 0.4 },
  soulfuldesciple:{ label: 'Soulful Deciple — gospel-tinged, lush 9ths', artist: 'Soulful Deciple', altProb: 0.28, register: 1, densityBias: 0.6 },
  melomusiq:      { label: 'Melo Musiq — flowing, jazzy piano phrasing', artist: 'Melo Musiq', altProb: 0.26, register: 1, densityBias: 0.5 },
  stixx:          { label: 'Stixx — bright, bouncy jazzy stabs', artist: 'Stixx', altProb: 0.18, register: 1, densityBias: 0.3 },
  bandros:        { label: 'Bandros — deep, meditative extended voicings', artist: 'Bandros', altProb: 0.34, register: 0, densityBias: 0.7 },
  masmusiq:       { label: 'Mas Musiq — catchy, melodic piano hooks', artist: 'Mas Musiq', altProb: 0.22, register: 1, densityBias: 0.4 },
  deepphil:       { label: 'Deep Phil — deep-house-tinged smooth chords', artist: 'Deep Phil', altProb: 0.26, register: 0, densityBias: 0.5 },
  djyvino:        { label: 'Djy Vino — soulful Private School warmth', artist: 'Djy Vino', altProb: 0.27, register: 0, densityBias: 0.5 },
  jappino:        { label: 'Jappino — rich, jazz-forward chord work', artist: 'Jappino', altProb: 0.32, register: 1, densityBias: 0.6 },

  // Master Jazz Pianists
  billevans:      { label: 'Bill Evans — rootless A/B, delicate guide-tone voice leading', artist: 'Bill Evans', altProb: 0.45, register: 0, densityBias: 0.6 },
  herbie:         { label: 'Herbie Hancock — quartal sus4s, open fifths, rich modal color', artist: 'Herbie Hancock', altProb: 0.42, register: 0, densityBias: 0.7 },
  glasper:        { label: 'Robert Glasper — neo-soul clusters, dragging pocket, tight 2nds', artist: 'Robert Glasper', altProb: 0.50, register: 0, densityBias: 0.8 },
  barryharris:    { label: 'Barry Harris — 6th-diminished scale, locked-hands drop-2', artist: 'Barry Harris', altProb: 0.35, register: 0, densityBias: 0.6 },
  mccoytyner:     { label: 'McCoy Tyner — powerful stacked 4ths, pentatonic stabs', artist: 'McCoy Tyner', altProb: 0.40, register: 1, densityBias: 0.8 },
  kennybarron:    { label: 'Kenny Barron — 5-voice concert spreads, open 4ths/5ths', artist: 'Kenny Barron', altProb: 0.44, register: 0, densityBias: 0.7 },
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

export function generateProgression(
  params: GenerationParams,
  usedProgressions: Set<string>
): Chord[] {
  const { rootPc, mode: feelKey, style: styleKey, bars } = params;
  const feel = FEEL_PROFILES[feelKey] || FEEL_PROFILES.soulful;
  const style = STYLE_PROFILES[styleKey] || STYLE_PROFILES.kelvinmomo;
  const scale = scalePitchClasses(rootPc, feel.baseScaleMode);

  // Template selection (non-repeating within session)
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

  // Assemble steps
  const steps: FeelStep[] = [];
  for (let i = 0; i < bars; i++) {
    steps.push(template.steps[i % template.steps.length]);
  }

  const upperAnchor = pcToMidi(2, 4 + style.register); // D4

  const chords: Chord[] = [];
  let prevRootMidi: number | null = null;
  let prevUpperMidis: number[] = [];

  let currentBeat = 0;

  steps.forEach((step) => {
    const cRootPc = feelRootPc(rootPc, scale, step.root);
    const lengthBeats = step.lengthBeats ?? 4;

    const voicingResult = buildPianoVoicing({
      rootPc: cRootPc,
      quality: step.quality,
      anchor: upperAnchor,
      previousUpperMidis: prevUpperMidis,
      previousBassMidi: prevRootMidi,
      densityBias: style.densityBias,
      register: style.register,
    });

    const { tones } = buildQualityChordTones(cRootPc, step.quality);
    const symbol = chordSymbolForQuality(cRootPc, step.quality);
    const degree = 'deg' in step.root ? step.root.deg : -1;

    const midiNotes = voicingResult.midiNotes;

    chords.push({
      degree,
      rootPc: cRootPc,
      quality: step.quality,
      tones,
      symbol,
      midiNotes,
      bassMidiNotes: voicingResult.bassMidiNotes,
      upperMidiNotes: voicingResult.upperMidiNotes,
      voicingVariant: 0,
      startBeat: currentBeat,
      lengthBeats,
      voicingLabel: voicingResult.shapeLabel,
      voicingCategory: voicingResult.category,
    });

    currentBeat += lengthBeats;
    prevRootMidi = voicingResult.bassMidiNotes[0];
    prevUpperMidis = voicingResult.upperMidiNotes;
  });

  return chords;
}
