import * as Tone from 'tone';
import type { Chord, InstrumentKey } from '../types';
import type { SynthMap } from './synths';

interface ScheduleArgs {
  synths: SynthMap;
  chords: Chord[];
  bpm: number;
  swing: number; // 0-1
  chordInstrument: InstrumentKey;
}

interface SchedEvent {
  time: string;
  notes: string[];
  dur: number;
}

/**
 * (Re)builds the Tone.Part that drives chord playback. Returns the Part so
 * the caller can dispose it before scheduling a new one.
 */
export function scheduleTransport({
  synths,
  chords,
  bpm,
  swing,
  chordInstrument,
}: ScheduleArgs): Tone.Part {
  Tone.Transport.cancel();
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.swing = swing;
  Tone.Transport.swingSubdivision = '16n';

  const chordSynth = synths[chordInstrument];

  const events: SchedEvent[] = chords.map((c) => ({
    time: `0:${c.startBeat}`,
    notes: c.midiNotes.map((m) => Tone.Frequency(m, 'midi').toNote()),
    dur: c.lengthBeats,
  }));

  const quarter = Tone.Time('4n').toSeconds();

  const part = new Tone.Part<[string, SchedEvent]>((time, ev) => {
    chordSynth.triggerAttackRelease(ev.notes, ev.dur * quarter, time);
  }, events.map((e) => [e.time, e] as [string, SchedEvent])).start(0);

  part.loop = true;
  const bars = chords.length || 4;
  part.loopEnd = `${bars}m`;

  return part;
}
