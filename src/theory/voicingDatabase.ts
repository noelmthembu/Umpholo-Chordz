/**
 * voicingDatabase.ts
 *
 * Master Catalog of Over 1,500 Unique Jazz Chord Voicings in MIDI.
 *
 * Covers all 12 root pitch classes and all chord qualities across:
 *   - Rootless A (Evans/Levine)
 *   - Rootless B (Evans/Levine)
 *   - Drop-2 Open Voicings (all inversions)
 *   - Drop-3 Warm Voicings
 *   - Drop-2 & 4 Spacious Voicings
 *   - Quartal / So What 4th Stacks (Tyner / Barron / Glasper)
 *   - Upper Structure Triads (USII, USbV, USbVI, USVI, USbIII, USbII)
 *   - Barry Harris 6th-Diminished / Block Voicings
 *   - Modern Cluster & Neo-Soul (Robert Glasper)
 *   - Kenny Barron Open 4ths & 5ths
 *   - Red Garland Stride Shell & Stabs
 *   - Altered & Symmetrical Dominants
 */

import type { QualityKey, VoicingCategory, VoicingEntry } from '../types';
import { NOTE_NAMES, intervalName, pcToMidi } from './scales';
import { JAZZ_VOICING_SHAPES, UPPER_STRUCTURE_TRIADS, buildUpperStructureVoicing } from './voicing';
import { QUALITY_SYMBOLS } from './chords';

// ─────────────────────────────────────────────────────────────────────────────
// Systematic Drop-2 and Drop-3 Inversion Shapes
// ─────────────────────────────────────────────────────────────────────────────

interface InversionDef {
  quality: QualityKey;
  inversion: number;
  type: 'Drop-2' | 'Drop-3' | 'Drop-2-4';
  offsets: number[];
  label: string;
}

const INVERSION_LIBRARY: InversionDef[] = [
  // Major 7 Drop-2
  { quality: 'maj7', inversion: 0, type: 'Drop-2', offsets: [4, 7, 11, 14], label: 'maj7 Drop-2 (Root Pos)' },
  { quality: 'maj7', inversion: 1, type: 'Drop-2', offsets: [7, 11, 14, 16], label: 'maj7 Drop-2 (1st Inv)' },
  { quality: 'maj7', inversion: 2, type: 'Drop-2', offsets: [11, 14, 16, 19], label: 'maj7 Drop-2 (2nd Inv)' },
  { quality: 'maj7', inversion: 3, type: 'Drop-2', offsets: [14, 16, 19, 23], label: 'maj7 Drop-2 (3rd Inv)' },

  // Major 7 Drop-3
  { quality: 'maj7', inversion: 0, type: 'Drop-3', offsets: [4, 11, 14, 19], label: 'maj7 Drop-3 (Root Pos)' },
  { quality: 'maj7', inversion: 1, type: 'Drop-3', offsets: [7, 14, 16, 23], label: 'maj7 Drop-3 (1st Inv)' },
  { quality: 'maj7', inversion: 2, type: 'Drop-3', offsets: [11, 16, 19, 26], label: 'maj7 Drop-3 (2nd Inv)' },
  { quality: 'maj7', inversion: 3, type: 'Drop-3', offsets: [14, 19, 23, 28], label: 'maj7 Drop-3 (3rd Inv)' },

  // Minor 7 Drop-2
  { quality: 'm7', inversion: 0, type: 'Drop-2', offsets: [3, 7, 10, 14], label: 'm7 Drop-2 (Root Pos)' },
  { quality: 'm7', inversion: 1, type: 'Drop-2', offsets: [7, 10, 14, 15], label: 'm7 Drop-2 (1st Inv)' },
  { quality: 'm7', inversion: 2, type: 'Drop-2', offsets: [10, 14, 15, 19], label: 'm7 Drop-2 (2nd Inv)' },
  { quality: 'm7', inversion: 3, type: 'Drop-2', offsets: [14, 15, 19, 22], label: 'm7 Drop-2 (3rd Inv)' },

  // Minor 7 Drop-3
  { quality: 'm7', inversion: 0, type: 'Drop-3', offsets: [3, 10, 14, 19], label: 'm7 Drop-3 (Root Pos)' },
  { quality: 'm7', inversion: 1, type: 'Drop-3', offsets: [7, 14, 15, 22], label: 'm7 Drop-3 (1st Inv)' },
  { quality: 'm7', inversion: 2, type: 'Drop-3', offsets: [10, 15, 19, 26], label: 'm7 Drop-3 (2nd Inv)' },
  { quality: 'm7', inversion: 3, type: 'Drop-3', offsets: [14, 19, 22, 27], label: 'm7 Drop-3 (3rd Inv)' },

  // Dominant 7 Drop-2
  { quality: '7', inversion: 0, type: 'Drop-2', offsets: [4, 7, 10, 14], label: '7 Drop-2 (Root Pos)' },
  { quality: '7', inversion: 1, type: 'Drop-2', offsets: [7, 10, 14, 16], label: '7 Drop-2 (1st Inv)' },
  { quality: '7', inversion: 2, type: 'Drop-2', offsets: [10, 14, 16, 19], label: '7 Drop-2 (2nd Inv)' },
  { quality: '7', inversion: 3, type: 'Drop-2', offsets: [14, 16, 19, 22], label: '7 Drop-2 (3rd Inv)' },

  // Dominant 7 Drop-3
  { quality: '7', inversion: 0, type: 'Drop-3', offsets: [4, 10, 14, 19], label: '7 Drop-3 (Root Pos)' },
  { quality: '7', inversion: 1, type: 'Drop-3', offsets: [7, 14, 16, 22], label: '7 Drop-3 (1st Inv)' },
  { quality: '7', inversion: 2, type: 'Drop-3', offsets: [10, 16, 19, 26], label: '7 Drop-3 (2nd Inv)' },
  { quality: '7', inversion: 3, type: 'Drop-3', offsets: [14, 19, 22, 28], label: '7 Drop-3 (3rd Inv)' },

  // Half-diminished m7b5 Drop-2
  { quality: 'm7b5', inversion: 0, type: 'Drop-2', offsets: [3, 6, 10, 14], label: 'm7b5 Drop-2 (Root Pos)' },
  { quality: 'm7b5', inversion: 1, type: 'Drop-2', offsets: [6, 10, 14, 15], label: 'm7b5 Drop-2 (1st Inv)' },
  { quality: 'm7b5', inversion: 2, type: 'Drop-2', offsets: [10, 14, 15, 18], label: 'm7b5 Drop-2 (2nd Inv)' },
  { quality: 'm7b5', inversion: 3, type: 'Drop-2', offsets: [14, 15, 18, 22], label: 'm7b5 Drop-2 (3rd Inv)' },

  // Diminished 7 Drop-2
  { quality: 'dim7', inversion: 0, type: 'Drop-2', offsets: [3, 6, 9, 14], label: 'dim7 Drop-2 (Root Pos)' },
  { quality: 'dim7', inversion: 1, type: 'Drop-2', offsets: [6, 9, 14, 15], label: 'dim7 Drop-2 (1st Inv)' },
  { quality: 'dim7', inversion: 2, type: 'Drop-2', offsets: [9, 14, 15, 18], label: 'dim7 Drop-2 (2nd Inv)' },
  { quality: 'dim7', inversion: 3, type: 'Drop-2', offsets: [14, 15, 18, 21], label: 'dim7 Drop-2 (3rd Inv)' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Generator for 1,500+ Unique Voicings
// ─────────────────────────────────────────────────────────────────────────────

let cachedVoicingDatabase: VoicingEntry[] | null = null;

export function getJazzVoicingsDatabase(): VoicingEntry[] {
  if (cachedVoicingDatabase) return cachedVoicingDatabase;

  const entries: VoicingEntry[] = [];
  const qualities = Object.keys(JAZZ_VOICING_SHAPES) as QualityKey[];

  NOTE_NAMES.forEach((rootName, rootPc) => {
    // 1. All predefined hand shapes across all qualities
    qualities.forEach((quality) => {
      const shapes = JAZZ_VOICING_SHAPES[quality] || [];
      const qualitySym = QUALITY_SYMBOLS[quality] || quality;
      const baseMidi = pcToMidi(rootPc, 3); // Bass register C3

      shapes.forEach((shape, sIdx) => {
        // Register octaves: Medium (RH Evans register) and High register
        [0, 1].forEach((octOffset) => {
          const rootMidi = pcToMidi(rootPc, 4 + octOffset);
          const upperMidis = shape.offsets.map((o) => rootMidi + o);
          const fullVoicing = [baseMidi, ...upperMidis].sort((a, b) => a - b);
          const intervals = shape.offsets.map((o) => intervalName(o));

          const id = `v-${rootName}-${quality}-${shape.category.slice(0, 4)}-${sIdx}-${octOffset}`;
          const span = fullVoicing[fullVoicing.length - 1] - fullVoicing[0];

          entries.push({
            id,
            rootPc,
            rootName,
            quality,
            symbol: `${rootName}${qualitySym}`,
            category: shape.category,
            label: `${rootName}${qualitySym} • ${shape.label} ${octOffset === 1 ? '(High Register)' : ''}`,
            offsets: shape.offsets,
            midiNotes: fullVoicing,
            spanSemitones: span,
            description: `Authentic jazz piano voicing for ${rootName}${qualitySym} featuring [${intervals.join(', ')}].`,
            intervals: ['R', ...intervals],
          });
        });
      });
    });

    // 2. Drop-2 and Drop-3 Inversions across 4-way shifts
    INVERSION_LIBRARY.forEach((inv, iIdx) => {
      const qualitySym = QUALITY_SYMBOLS[inv.quality] || inv.quality;
      const baseMidi = pcToMidi(rootPc, 3);
      const rootMidi = pcToMidi(rootPc, 4);

      const upperMidis = inv.offsets.map((o) => rootMidi + o);
      const fullVoicing = [baseMidi, ...upperMidis].sort((a, b) => a - b);
      const intervals = inv.offsets.map((o) => intervalName(o));
      const cat: VoicingCategory = inv.type === 'Drop-2' ? 'Drop-2 Open Voicing' : 'Drop-3 Warm Voicing';

      const id = `inv-${rootName}-${inv.quality}-${inv.type}-${inv.inversion}-${iIdx}`;
      const span = fullVoicing[fullVoicing.length - 1] - fullVoicing[0];

      entries.push({
        id,
        rootPc,
        rootName,
        quality: inv.quality,
        symbol: `${rootName}${qualitySym}`,
        category: cat,
        label: `${rootName}${qualitySym} • ${inv.label}`,
        offsets: inv.offsets,
        midiNotes: fullVoicing,
        spanSemitones: span,
        description: `Classic jazz four-way close inversion adapted into ${inv.type} distribution for pianistic balance.`,
        intervals: ['R', ...intervals],
      });
    });

    // 3. Upper Structure Triads over Dominant 7th chords
    UPPER_STRUCTURE_TRIADS.forEach((ust, uIdx) => {
      const baseMidi = pcToMidi(rootPc, 2);
      const ustNotes = buildUpperStructureVoicing(rootPc, ust, 4);
      const fullVoicing = [baseMidi, ...ustNotes].sort((a, b) => a - b);

      const id = `ust-${rootName}-7-${uIdx}`;
      const span = fullVoicing[fullVoicing.length - 1] - fullVoicing[0];

      entries.push({
        id,
        rootPc,
        rootName,
        quality: '7alt',
        symbol: `${rootName}7(${ust.name.split(' ')[1]})`,
        category: 'Upper Structure Triad (UST)',
        label: `${rootName}7 • ${ust.name}`,
        offsets: ustNotes.map((n) => n - pcToMidi(rootPc, 4)),
        midiNotes: fullVoicing,
        spanSemitones: span,
        description: `Bilateral Upper Structure Triad voicing: LH guides (3 & 7) + RH ${ust.name} superimposing ${ust.colorTensions}.`,
        intervals: ['R', '3', 'b7', ...ust.colorTensions.split(', ')],
      });
    });
  });

  cachedVoicingDatabase = entries;
  return entries;
}

export const VOICING_CATEGORIES: VoicingCategory[] = [
  'Rootless A (Evans/Levine)',
  'Rootless B (Evans/Levine)',
  'Drop-2 Open Voicing',
  'Drop-3 Warm Voicing',
  'Drop-2 & 4 Spacious',
  'Quartal / So What (Tyner/Glasper)',
  'Upper Structure Triad (UST)',
  'Barry Harris 6th-Diminished',
  'Modern Cluster & Neo-Soul',
  'Kenny Barron Open 4ths/5ths',
  'Red Garland Shell & Stab',
  'Altered & Symmetrical Dominant',
];

/** Search and filter voicings */
export function searchVoicings(params: {
  query?: string;
  rootPc?: number;
  quality?: QualityKey;
  category?: VoicingCategory;
  limit?: number;
}): VoicingEntry[] {
  const db = getJazzVoicingsDatabase();
  let results = db;

  if (params.rootPc !== undefined && params.rootPc >= 0) {
    results = results.filter((v) => v.rootPc === params.rootPc);
  }

  if (params.quality) {
    results = results.filter((v) => v.quality === params.quality);
  }

  if (params.category) {
    results = results.filter((v) => v.category === params.category);
  }

  if (params.query && params.query.trim().length > 0) {
    const q = params.query.toLowerCase().trim();
    results = results.filter(
      (v) =>
        v.label.toLowerCase().includes(q) ||
        v.symbol.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
    );
  }

  return results.slice(0, params.limit || 50);
}
