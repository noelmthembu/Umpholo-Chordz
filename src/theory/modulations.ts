/**
 * modulations.ts
 *
 * Suggested Jazz Modulation & Harmonic Transition Engine.
 *
 * Provides 8 master jazz modulation pathways from any tonic key / progression:
 *   1. Circle of Fifths / Cycle 5 (Dominant Key)
 *   2. Circle of Fifths / Cycle 5 (Subdominant Key)
 *   3. Tritone Substitution Modulation (bII7 pivot)
 *   4. Chromatic Mediant Shifts (bVI and bIII Bill Evans impressionism)
 *   5. Backdoor ii-V-I Cadence (iv7 -> bVII7 -> I)
 *   6. Coltrane Changes / Giant Steps Matrix (Major thirds 3-tonic cycle)
 *   7. Symmetrical Diminished 7th Pivot (4-way resolution)
 *   8. Secondary Dominant Extended Turnaround (VI7 -> II7 -> V7 -> I)
 */

import type { Chord, ModulationSuggestion, QualityKey } from '../types';
import { NOTE_NAMES, pcToMidi } from './scales';
import { buildQualityChordTones, chordSymbolForQuality } from './chords';
import { closestMidiForPc, jazzVoicing } from './voicing';

interface StepDef {
  rootPc: number;
  quality: QualityKey;
  lengthBeats: number;
  degree?: number;
}

function buildModulationChords(steps: StepDef[], currentRootPc: number): Chord[] {
  const chords: Chord[] = [];
  let prevUpperMidis: number[] = [];
  let prevRootMidi: number | null = null;
  const upperAnchor = pcToMidi(currentRootPc, 4); // D4/F4 anchor

  let currentBeat = 0;

  steps.forEach((s) => {
    const rootMidi =
      prevRootMidi === null
        ? pcToMidi(s.rootPc, 3)
        : closestMidiForPc(s.rootPc, prevRootMidi);

    const voicingResult = jazzVoicing(
      s.rootPc,
      s.quality,
      upperAnchor,
      prevUpperMidis
    );

    const { tones } = buildQualityChordTones(s.rootPc, s.quality);
    const symbol = chordSymbolForQuality(s.rootPc, s.quality);
    const midiNotes = [...new Set([rootMidi, ...voicingResult.midiNotes])].sort((a, b) => a - b);

    chords.push({
      degree: s.degree ?? -1,
      rootPc: s.rootPc,
      quality: s.quality,
      tones,
      symbol,
      midiNotes,
      startBeat: currentBeat,
      lengthBeats: s.lengthBeats,
      voicingLabel: voicingResult.shapeLabel,
      voicingCategory: voicingResult.category,
    });

    currentBeat += s.lengthBeats;
    prevRootMidi = rootMidi;
    prevUpperMidis = voicingResult.midiNotes;
  });

  return chords;
}

/** Generate intelligent modulation suggestions for a given tonic key */
export function getSuggestedModulations(currentRootPc: number): ModulationSuggestion[] {
  const rootName = NOTE_NAMES[currentRootPc];
  const suggestions: ModulationSuggestion[] = [];

  // 1. Cycle 5 to Dominant Key (+7 semitones)
  const domKey = (currentRootPc + 7) % 12;
  const domKeyName = NOTE_NAMES[domKey];
  const iiDom = (domKey + 2) % 12;
  const vDom = (domKey + 7) % 12;

  suggestions.push({
    id: 'cycle5-dom',
    type: 'cycle5_dom',
    title: `Modulate to Dominant (${domKeyName}) via ii–V–I`,
    targetKeyName: domKeyName,
    targetRootPc: domKey,
    harmonicConcept: 'Cycle of 5ths Cadence',
    explanation: `Moves energy up a fifth from ${rootName} to ${domKeyName} using a smooth jazz ii–V–I cadence ([${NOTE_NAMES[iiDom]}m9 → ${NOTE_NAMES[vDom]}13 → ${domKeyName}maj9]).`,
    transitionChords: buildModulationChords(
      [
        { rootPc: iiDom, quality: 'm9', lengthBeats: 4 },
        { rootPc: vDom, quality: '13', lengthBeats: 4 },
        { rootPc: domKey, quality: 'maj9', lengthBeats: 4 },
      ],
      currentRootPc
    ),
  });

  // 2. Cycle 5 to Subdominant Key (+5 semitones)
  const subdomKey = (currentRootPc + 5) % 12;
  const subdomKeyName = NOTE_NAMES[subdomKey];
  const iiSub = (subdomKey + 2) % 12;
  const vSub = (subdomKey + 7) % 12;

  suggestions.push({
    id: 'cycle5-subdom',
    type: 'cycle5_subdom',
    title: `Modulate to Subdominant (${subdomKeyName}) via ii–V–I`,
    targetKeyName: subdomKeyName,
    targetRootPc: subdomKey,
    harmonicConcept: 'Subdominant Pivot',
    explanation: `Softens harmonic tension by shifting to the subdominant key ${subdomKeyName} through a warm [${NOTE_NAMES[iiSub]}m11 → ${NOTE_NAMES[vSub]}9 → ${subdomKeyName}maj9] movement.`,
    transitionChords: buildModulationChords(
      [
        { rootPc: iiSub, quality: 'm11', lengthBeats: 4 },
        { rootPc: vSub, quality: '9', lengthBeats: 4 },
        { rootPc: subdomKey, quality: 'maj9', lengthBeats: 4 },
      ],
      currentRootPc
    ),
  });

  // 3. Tritone Substitution Modulation (bII7 Resolution)
  const tritoneSubPc = (currentRootPc + 1) % 12; // Db7 -> C
  const tritoneSubName = NOTE_NAMES[tritoneSubPc];
  const iiMinorPc = (currentRootPc + 2) % 12; // Dm9 -> Db7alt -> Cmaj9

  suggestions.push({
    id: 'tritone-sub',
    type: 'tritone_sub',
    title: `Tritone Sub Cadence (♭II7 → I)`,
    targetKeyName: rootName,
    targetRootPc: currentRootPc,
    harmonicConcept: 'Chromatic Tritone Reharmonization',
    explanation: `Substitutes the standard V7 with the ♭II7 dominant chord (${tritoneSubName}7alt) creating a chromatic bass glide into ${rootName}maj9.`,
    transitionChords: buildModulationChords(
      [
        { rootPc: iiMinorPc, quality: 'm9', lengthBeats: 4 },
        { rootPc: tritoneSubPc, quality: '7alt', lengthBeats: 4 },
        { rootPc: currentRootPc, quality: 'maj9', lengthBeats: 4 },
      ],
      currentRootPc
    ),
  });

  // 4. Chromatic Mediant (♭VI Major 7th - Bill Evans Color)
  const flatSixPc = (currentRootPc + 8) % 12; // Ab in C
  const flatSixName = NOTE_NAMES[flatSixPc];
  const flatSixSecDom = (flatSixPc + 7) % 12; // Eb7

  suggestions.push({
    id: 'chromatic-mediant-bvi',
    type: 'chromatic_mediant_flat',
    title: `Chromatic Mediant to ♭VI (${flatSixName}maj9)`,
    targetKeyName: flatSixName,
    targetRootPc: flatSixPc,
    harmonicConcept: 'Impressionistic Mediant Shift',
    explanation: `Iconic Bill Evans & Robert Glasper harmony: shifts to the chromatic mediant key ${flatSixName}maj9, sharing smooth common tones with ${rootName}.`,
    transitionChords: buildModulationChords(
      [
        { rootPc: currentRootPc, quality: 'maj9', lengthBeats: 4 },
        { rootPc: flatSixSecDom, quality: '7alt', lengthBeats: 2 },
        { rootPc: flatSixPc, quality: 'maj9', lengthBeats: 4 },
        { rootPc: flatSixPc, quality: 'maj7#11', lengthBeats: 2 },
      ],
      currentRootPc
    ),
  });

  // 5. Backdoor ii–V–I Cadence (iv7 → ♭VII7 → I)
  const minorFourPc = (currentRootPc + 5) % 12; // Fm in C
  const flatSevenPc = (currentRootPc + 10) % 12; // Bb7 in C

  suggestions.push({
    id: 'backdoor-cadence',
    type: 'backdoor_cadence',
    title: `Backdoor Cadence (iv7 → ♭VII13 → I)`,
    targetKeyName: rootName,
    targetRootPc: currentRootPc,
    harmonicConcept: 'Backdoor Resolution',
    explanation: `Replaces the V7 with a minor iv7 to ♭VII13 cadence ([${NOTE_NAMES[minorFourPc]}m9 → ${NOTE_NAMES[flatSevenPc]}13 → ${rootName}maj9]) for a soulful, smooth gospel-jazz resolution.`,
    transitionChords: buildModulationChords(
      [
        { rootPc: minorFourPc, quality: 'm9', lengthBeats: 4 },
        { rootPc: flatSevenPc, quality: '13', lengthBeats: 4 },
        { rootPc: currentRootPc, quality: 'maj9', lengthBeats: 4 },
      ],
      currentRootPc
    ),
  });

  // 6. Coltrane Changes / Giant Steps Matrix
  // Cmaj7 -> Eb7 -> Abmaj7 -> B7 -> Emaj7 -> G7 -> Cmaj7
  const center1 = currentRootPc;
  const domCenter2 = (currentRootPc + 3) % 12; // Eb7
  const center2 = (currentRootPc + 8) % 12; // Ab
  const domCenter3 = (center2 + 3) % 12; // B7
  const center3 = (center2 + 8) % 12; // E
  const domCenter1 = (center3 + 3) % 12; // G7

  suggestions.push({
    id: 'coltrane-matrix',
    type: 'coltrane_matrix',
    title: `Coltrane 3-Tonic Matrix (Giant Steps)`,
    targetKeyName: rootName,
    targetRootPc: currentRootPc,
    harmonicConcept: 'Coltrane Changes (Major 3rds)',
    explanation: `Cycles through 3 tonic centers a major third apart (${rootName} → ${NOTE_NAMES[center2]} → ${NOTE_NAMES[center3]} → ${rootName}) connected by secondary dominants.`,
    transitionChords: buildModulationChords(
      [
        { rootPc: center1, quality: 'maj7', lengthBeats: 2 },
        { rootPc: domCenter2, quality: '7', lengthBeats: 2 },
        { rootPc: center2, quality: 'maj7', lengthBeats: 2 },
        { rootPc: domCenter3, quality: '7', lengthBeats: 2 },
        { rootPc: center3, quality: 'maj7', lengthBeats: 2 },
        { rootPc: domCenter1, quality: '7', lengthBeats: 2 },
        { rootPc: center1, quality: 'maj9', lengthBeats: 4 },
      ],
      currentRootPc
    ),
  });

  // 7. Symmetrical Diminished 7th Pivot
  const dimPivotPc = (currentRootPc + 11) % 12; // Bdim7 resolving to C or Eb
  const dimTargetPc = (currentRootPc + 3) % 12; // Eb (+3 semitones minor third)
  const dimTargetName = NOTE_NAMES[dimTargetPc];

  suggestions.push({
    id: 'diminished-pivot',
    type: 'diminished_pivot',
    title: `Diminished 7th Pivot to ${dimTargetName} (+m3)`,
    targetKeyName: dimTargetName,
    targetRootPc: dimTargetPc,
    harmonicConcept: 'Symmetric Diminished Pivot',
    explanation: `Uses the symmetrical nature of the diminished 7th chord (${NOTE_NAMES[dimPivotPc]}dim7) as a universal leading-tone pivot to modulate into ${dimTargetName}maj9.`,
    transitionChords: buildModulationChords(
      [
        { rootPc: currentRootPc, quality: 'maj9', lengthBeats: 4 },
        { rootPc: dimPivotPc, quality: 'dim7', lengthBeats: 4 },
        { rootPc: dimTargetPc, quality: 'maj9', lengthBeats: 4 },
      ],
      currentRootPc
    ),
  });

  // 8. Secondary Dominant Extended Turnaround (VI7 → II7 → V7 → I)
  const viDomPc = (currentRootPc + 9) % 12; // A7
  const iiDomPc = (currentRootPc + 2) % 12; // D7
  const vDomPc = (currentRootPc + 7) % 12; // G7

  suggestions.push({
    id: 'secondary-turnaround',
    type: 'secondary_dominant_chain',
    title: `Extended Cycle Turnaround (VI7 → II7 → V7 → I)`,
    targetKeyName: rootName,
    targetRootPc: currentRootPc,
    harmonicConcept: 'Circle of Dominants Turnaround',
    explanation: `Bebop cycle turnaround chaining secondary dominants ([${NOTE_NAMES[viDomPc]}7(♭9) → ${NOTE_NAMES[iiDomPc]}13 → ${NOTE_NAMES[vDomPc]}7(♯9) → ${rootName}6/9]).`,
    transitionChords: buildModulationChords(
      [
        { rootPc: viDomPc, quality: '7b9', lengthBeats: 4 },
        { rootPc: iiDomPc, quality: '13', lengthBeats: 4 },
        { rootPc: vDomPc, quality: '7#9', lengthBeats: 4 },
        { rootPc: currentRootPc, quality: '69', lengthBeats: 4 },
      ],
      currentRootPc
    ),
  });

  return suggestions;
}
