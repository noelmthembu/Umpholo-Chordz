import * as Tone from 'tone';
import type { CascadeDirection, Chord, InstrumentKey } from '../types';
import type { SynthMap } from './synths';
import { chordVelocities, calculateCascadeOffsets } from '../theory/voicing';

interface ScheduleArgs {
  synths: SynthMap;
  chords: Chord[];
  bpm: number;
  swing: number; // 0-1
  chordInstrument: InstrumentKey;
  cascadeMs?: number;
  cascadeDirection?: CascadeDirection;
  handBalance?: 'balanced' | 'leadSing' | 'bassSolid' | 'warmTrio';
  onActiveChordChange?: (chordIndex: number) => void;
}

interface SchedEvent {
  time: string;
  notes: string[];
  dur: number;
  chordIndex: number;
}

/**
 * (Re)builds the Tone.Part that drives chord playback with realistic jazz pianist
 * touch and dynamic cascade strum timing.
 */
export function scheduleTransport({
  synths,
  chords,
  bpm,
  swing,
  chordInstrument,
  cascadeMs = 22,
  cascadeDirection = 'ease',
  handBalance = 'leadSing',
  onActiveChordChange,
}: ScheduleArgs): Tone.Part {
  Tone.Transport.cancel();
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.swing = swing;
  Tone.Transport.swingSubdivision = '16n';

  const chordSynth = synths[chordInstrument];

  const events: SchedEvent[] = chords.map((c, idx) => ({
    time: `0:${c.startBeat}`,
    notes: c.midiNotes.map((m) => Tone.Frequency(m, 'midi').toNote()),
    dur: c.lengthBeats,
    chordIndex: idx,
  }));

  const quarter = Tone.Time('4n').toSeconds();

  const part = new Tone.Part<[string, SchedEvent]>((time, ev) => {
    const { notes, dur, chordIndex } = ev;
    const durSec = dur * quarter;

    if (onActiveChordChange) {
      Tone.Draw.schedule(() => {
        onActiveChordChange(chordIndex);
      }, time);
    }

    // Per-voice velocity shaped for jazz pianist balance
    const velocities = chordVelocities(
      notes.map((_, i) => i),
      0.78,
      handBalance
    );

    // Natural cascade strum onset offsets
    const offsets = calculateCascadeOffsets(
      notes.length,
      cascadeMs,
      cascadeDirection
    );

    notes.forEach((note, i) => {
      chordSynth.triggerAttackRelease(
        [note],
        durSec,
        time + offsets[i],
        [velocities[i]]
      );
    });
  }, events.map((e) => [e.time, e] as [string, SchedEvent])).start(0);

  part.loop = true;
  const totalBeats = chords.reduce((sum, c) => sum + c.lengthBeats, 0);
  const bars = Math.ceil(totalBeats / 4) || 4;
  part.loopEnd = `${bars}m`;

  return part;
}

/** Play a single audition chord with the current instrument and cascade */
export function playAuditionChord(
  synths: SynthMap,
  instrument: InstrumentKey,
  midiNotes: number[],
  cascadeMs = 24,
  cascadeDirection: CascadeDirection = 'ease'
): void {
  const chordSynth = synths[instrument];
  if (!chordSynth) return;

  const notes = midiNotes.map((m) => Tone.Frequency(m, 'midi').toNote());
  const velocities = chordVelocities(midiNotes, 0.82, 'leadSing');
  const offsets = calculateCascadeOffsets(notes.length, cascadeMs, cascadeDirection);

  const now = Tone.now() + 0.05;
  notes.forEach((note, i) => {
    chordSynth.triggerAttackRelease([note], 2.2, now + offsets[i], [velocities[i]]);
  });
}
