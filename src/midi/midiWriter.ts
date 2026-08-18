/**
 * midiWriter.ts
 *
 * High-precision Standard MIDI File (SMF Format 1) Writer.
 *
 * Encodes:
 *   - Cascade strum micro-timing (staggered note-on ticks per chord)
 *   - Human pianist velocity balance (weighted lead, guide tones, bass foundation)
 *   - Track metadata, tempo, and time signature
 */

import type { CascadeDirection, Chord } from '../types';
import { chordVelocities, calculateCascadeOffsets } from '../theory/voicing';

function writeVarLen(value: number): number[] {
  let buffer = value & 0x7f;
  const bytes: number[] = [];
  let v = value;
  while ((v >>= 7) > 0) {
    buffer <<= 8;
    buffer |= 0x80 | (v & 0x7f);
  }
  while (true) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) buffer >>= 8;
    else break;
  }
  return bytes;
}

function u32(n: number): number[] {
  return [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function u16(n: number): number[] {
  return [(n >> 8) & 0xff, n & 0xff];
}

interface RawEvent {
  tick: number;
  type: 0x90 | 0x80;
  note: number;
  vel: number;
}

interface NoteLike {
  midi: number;
  startBeat: number;
  lengthBeats: number;
  velocity?: number;
  tickOffset?: number;
}

function buildTrackEvents(noteList: NoteLike[], ppq: number): number[] {
  const raw: RawEvent[] = [];

  noteList.forEach((n) => {
    const baseOnTick = Math.round(n.startBeat * ppq);
    const tickOffset = n.tickOffset ?? 0;
    const onTick = Math.max(0, baseOnTick + tickOffset);
    const offTick = Math.max(onTick + 10, Math.round((n.startBeat + n.lengthBeats * 0.92) * ppq) + tickOffset);
    const vel = Math.max(1, Math.min(127, Math.round((n.velocity ?? 0.8) * 127)));

    raw.push({ tick: onTick, type: 0x90, note: n.midi, vel });
    raw.push({ tick: offTick, type: 0x80, note: n.midi, vel: 0 });
  });

  raw.sort((a, b) => a.tick - b.tick);

  const bytes: number[] = [];
  let lastTick = 0;
  raw.forEach((ev) => {
    bytes.push(...writeVarLen(ev.tick - lastTick));
    bytes.push(ev.type, ev.note, ev.vel);
    lastTick = ev.tick;
  });
  bytes.push(0x00, 0xff, 0x2f, 0x00); // End of track
  return bytes;
}

function wrapTrackChunk(eventBytes: number[]): number[] {
  return [0x4d, 0x54, 0x72, 0x6b, ...u32(eventBytes.length), ...eventBytes];
}

export interface MidiExportOptions {
  bpm: number;
  cascadeMs?: number;
  cascadeDirection?: CascadeDirection;
  trackName?: string;
}

/** Build a 2-track Standard MIDI File (format 1): tempo/meta, chords. */
export function buildMidiFile(
  chords: Chord[],
  bpmOrOptions: number | MidiExportOptions
): Uint8Array {
  const options: MidiExportOptions =
    typeof bpmOrOptions === 'number'
      ? { bpm: bpmOrOptions, cascadeMs: 22, cascadeDirection: 'ease' }
      : bpmOrOptions;

  const { bpm, cascadeMs = 22, cascadeDirection = 'ease', trackName = 'Umpholo Jazz Voicings' } = options;

  const ppq = 480;
  const usPerQuarter = Math.round(60000000 / bpm);
  const msPerQuarter = 60000 / bpm;
  const ticksPerMs = ppq / msPerQuarter;

  const header = [0x4d, 0x54, 0x68, 0x64, ...u32(6), ...u16(1), ...u16(2), ...u16(ppq)];

  // Track 0: Tempo & Meta events
  let tempoBytes: number[] = [];
  tempoBytes.push(
    ...writeVarLen(0),
    0xff,
    0x51,
    0x03,
    (usPerQuarter >> 16) & 0xff,
    (usPerQuarter >> 8) & 0xff,
    usPerQuarter & 0xff
  );
  tempoBytes.push(
    ...writeVarLen(0),
    0xff,
    0x03,
    ...writeVarLen(trackName.length),
    ...Array.from(trackName).map((c) => c.charCodeAt(0))
  );
  tempoBytes.push(0x00, 0xff, 0x2f, 0x00);
  const track0 = wrapTrackChunk(tempoBytes);

  // Track 1: Staggered notes with cascade strum & pianist velocity
  const chordNotes: NoteLike[] = chords.flatMap((c) => {
    const velocities = chordVelocities(c.midiNotes, 0.82, 'leadSing');
    const offsetsSec = calculateCascadeOffsets(c.midiNotes.length, cascadeMs, cascadeDirection);

    return c.midiNotes.map((m, i) => {
      const offsetMs = offsetsSec[i] * 1000;
      const tickOffset = Math.round(offsetMs * ticksPerMs);

      return {
        midi: m,
        startBeat: c.startBeat,
        lengthBeats: c.lengthBeats,
        velocity: velocities[i],
        tickOffset,
      };
    });
  });

  const track1 = wrapTrackChunk(buildTrackEvents(chordNotes, ppq));

  return new Uint8Array([...header, ...track0, ...track1]);
}

/** Build a single chord MIDI file */
export function buildSingleChordMidi(
  midiNotes: number[],
  bpm = 112,
  cascadeMs = 24
): Uint8Array {
  const fakeChord: Chord = {
    degree: 1,
    rootPc: midiNotes[0] % 12,
    tones: [],
    symbol: 'Chord',
    midiNotes,
    startBeat: 0,
    lengthBeats: 4,
  };
  return buildMidiFile([fakeChord], { bpm, cascadeMs, trackName: 'Single Jazz Chord Voicing' });
}

/** Trigger a browser download of the generated MIDI file. */
export function downloadMidi(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes.buffer.slice(0) as ArrayBuffer], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
