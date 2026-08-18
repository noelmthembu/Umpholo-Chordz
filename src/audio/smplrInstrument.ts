import * as Tone from 'tone';
import type { PlayableInstrument } from './synths';

/** Minimal shape of the smplr instrument instances we use (SplendidGrandPiano,
 * ElectricPiano, Soundfont) — just the surface this adapter touches. */
interface SmplrLike {
  ready: Promise<void>;
  start(event: { note: string | number; velocity?: number; time?: number; duration?: number | null }): (time?: number) => void;
  stop(target?: unknown): void;
  output: { volume: number };
}

type SmplrFactory = (ctx: BaseAudioContext, opts: { destination?: AudioNode }) => SmplrLike;

/**
 * Adapts a real sample-based `smplr` instrument (multi-velocity-layer
 * sampled acoustic/electric pianos, organ, pads — the same class of
 * sample-playback approach a DAW like BandLab uses for its stock
 * instruments) to the app's PlayableInstrument surface, so it can be
 * scheduled by the same Tone.Part-driven transport as everything else.
 *
 * Shares Tone.js's own AudioContext (`Tone.getContext().rawContext`) so
 * the `time` values Tone schedules line up with smplr's clock exactly.
 */
export class SmplrInstrument implements PlayableInstrument {
  private inst: SmplrLike;
  readonly loaded: Promise<void>;
  volume: { value: number };

  constructor(factory: SmplrFactory) {
    const ctx = Tone.getContext().rawContext as unknown as BaseAudioContext;
    const inst = factory(ctx, {});
    this.inst = inst;
    this.loaded = inst.ready;
    this.volume = {
      get value(): number {
        // smplr volume is 0-127 (MIDI-style); expose it as approximate dB
        // so it drops into the same `.volume.value = -6` call sites as
        // every other instrument in the palette.
        return 20 * Math.log10(Math.max(inst.output.volume, 1) / 127);
      },
      set value(db: number) {
        inst.output.volume = Math.max(0, Math.min(127, Math.round(127 * 10 ** (db / 20))));
      },
    };
  }

  triggerAttackRelease(
    notes: string | string[],
    duration: number | string,
    time?: number,
    velocity: number | number[] = 0.8
  ): void {
    const list = Array.isArray(notes) ? notes : [notes];
    const durSec = typeof duration === 'number' ? duration : Tone.Time(duration).toSeconds();
    const startTime = time ?? Tone.now();
    const velocities = Array.isArray(velocity) ? velocity : list.map(() => velocity as number);
    list.forEach((note, i) => {
      const v = velocities[i] ?? velocities[velocities.length - 1] ?? 0.8;
      const gmVelocity = Math.max(1, Math.min(127, Math.round(v * 127)));
      this.inst.start({ note, velocity: gmVelocity, time: startTime, duration: durSec });
    });
  }

  dispose(): void {
    this.inst.stop();
  }
}
